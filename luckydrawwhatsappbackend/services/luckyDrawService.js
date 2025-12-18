const { sendTextMessage, sendDocument } = require('./whatsappService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Supabase REST helper
const supabaseRest = axios.create({
  baseURL: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL}/rest/v1` : null,
  headers: {
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  },
  timeout: 8000
});

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseRest.defaults.headers['apikey'] = process.env.SUPABASE_SERVICE_ROLE_KEY;
  supabaseRest.defaults.headers['Authorization'] = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
}

// Supabase Admin Client
let supabaseAdmin = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  }
} catch (e) {
  supabaseAdmin = null;
}

// User state management (in-memory for simplicity)
const userStates = new Map();

/**
 * Lucky Draw Flow States:
 * - null: No active flow
 * - 'awaiting_name': Waiting for user to provide their name
 */

/**
 * Handle Lucky Draw flow
 * @param {Object} message - WhatsApp message object
 */
async function handleLuckyDrawFlow(message) {
  const phoneNumber = message.from;
  const currentState = userStates.get(phoneNumber);

  try {
    // Extract message text
    let messageText = '';
    if (message.type === 'text' && message.text) {
      messageText = message.text.body.trim();
    } else if (message.type === 'interactive') {
      // Handle button clicks
      if (message.interactive.button_reply) {
        messageText = message.interactive.button_reply.id;
      } else if (message.interactive.list_reply) {
        messageText = message.interactive.list_reply.id;
      }
    }

    console.log(`📱 Lucky Draw Flow - Phone: ${phoneNumber}, State: ${currentState}, Message: "${messageText}"`);

    // Step 1: User clicks "Join" or sends "join" message
    if (!currentState && (messageText.toLowerCase() === 'join' || messageText === 'join_contest')) {
      await startLuckyDrawFlow(phoneNumber);
      return true;
    }

    // Step 2: User provides their name
    if (currentState === 'awaiting_name' && messageText) {
      await completeLuckyDrawRegistration(phoneNumber, messageText);
      return true;
    }

    return false; // Message not handled by Lucky Draw flow
  } catch (error) {
    console.error('❌ Error in Lucky Draw flow:', error);
    userStates.delete(phoneNumber); // Reset state on error
    await sendTextMessage(phoneNumber, 'Sorry, something went wrong. Please try again by sending "Join".');
    return true;
  }
}

/**
 * Start the Lucky Draw flow
 */
async function startLuckyDrawFlow(phoneNumber) {
  console.log(`🎯 Starting Lucky Draw flow for ${phoneNumber}`);

  // Set user state to awaiting name
  userStates.set(phoneNumber, 'awaiting_name');

  // Send welcome message
  const welcomeMessage = `Welcome to 3rd Eye Security Systems. Please enter your name to join contest.`;
  
  await sendTextMessage(phoneNumber, welcomeMessage);
  console.log(`✅ Sent welcome message to ${phoneNumber}`);
}

/**
 * Complete Lucky Draw registration
 */
async function completeLuckyDrawRegistration(phoneNumber, userName) {
  console.log(`✅ Completing registration for ${phoneNumber} with name: ${userName}`);

  try {
    // Get the active contest (you can modify this logic to get a specific contest)
    let contestId = null;
    
    if (supabaseAdmin) {
      const { data: contests, error } = await supabaseAdmin
        .from('contests')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && contests && contests.length > 0) {
        contestId = contests[0].id;
      }
    }

    // If no contest found, use a default or create one
    if (!contestId) {
      console.warn('⚠️  No active contest found, using default contest ID');
      // You might want to create a default contest or handle this differently
    }

    // Save participant to database
    if (supabaseAdmin && contestId) {
      const { data, error } = await supabaseAdmin
        .from('participants')
        .insert([
          {
            contest_id: contestId,
            name: userName,
            phone_number: phoneNumber,
            entry_timestamp: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error('❌ Error saving participant:', error);
        throw error;
      }

      console.log(`✅ Participant saved to database:`, data);
    }

    // Clear user state
    userStates.delete(phoneNumber);

    // Send success message
    const successMessage = `You've successfully entered the Lucky Draw!🎉\n\nThe draw will take place on Monday, 10th November 2025.\n\nWe'll notify you if you're one of the winners.\n\nGood luck! `;

    await sendTextMessage(phoneNumber, successMessage);
    console.log(`✅ Sent success message to ${phoneNumber}`);

    // Send company brochure
    await sendCompanyBrochure(phoneNumber);

  } catch (error) {
    console.error('❌ Error completing registration:', error);
    throw error;
  }
}

/**
 * Send company brochure PDF
 */
async function sendCompanyBrochure(phoneNumber) {
  try {
    const brochurePath = path.join(__dirname, '..', 'public', '3rd Eye Security Systems.pdf');
    
    // Check if brochure exists
    if (!fs.existsSync(brochurePath)) {
      console.warn(`⚠️  Brochure not found at ${brochurePath}`);
      console.warn('⚠️  Skipping brochure send. Please add the PDF file to the public folder.');
      return;
    }

    console.log(`📄 Sending brochure to ${phoneNumber}`);
    console.log(`📄 Brochure path: ${brochurePath}`);
    
    // Send the PDF document via WhatsApp
    await sendDocument(
      phoneNumber, 
      brochurePath, 
      '3rd Eye Security Systems - Company Brochure',
      '3rd Eye Security Systems.pdf'
    );
    
    console.log(`✅ Brochure sent successfully to ${phoneNumber}`);
    
  } catch (error) {
    console.error('❌ Error sending brochure:', error);
    // Don't throw - brochure sending is optional
  }
}

/**
 * Reset user state (for testing)
 */
function resetUserState(phoneNumber) {
  userStates.delete(phoneNumber);
  console.log(`🔄 Reset state for ${phoneNumber}`);
}

/**
 * Get current user state (for debugging)
 */
function getUserState(phoneNumber) {
  return userStates.get(phoneNumber) || null;
}

module.exports = {
  handleLuckyDrawFlow,
  startLuckyDrawFlow,
  resetUserState,
  getUserState
};
