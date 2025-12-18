const { sendTextMessage, sendInteractiveMessage } = require('./whatsappService');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// In-memory conversation state (in production, use Redis or database)
const conversationStates = new Map();

/**
 * Handle salon booking flow for incoming messages
 */
async function handleSalonBookingFlow(message) {
  try {
    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type;

    // Handle interactive messages (buttons/lists)
    let processedMessage = messageText;
    if (message.interactive) {
      if (message.interactive.type === 'button_reply') {
        processedMessage = message.interactive.button_reply.id;
      } else if (message.interactive.type === 'list_reply') {
        processedMessage = message.interactive.list_reply.id;
      }
    }

    console.log(`🏪 Processing salon booking message from ${phoneNumber}: ${messageText}`);
    console.log(`📱 Message type: ${messageType}, Processed message: ${processedMessage}`);

    // Clean phone number (remove + and spaces)
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    
    // Check if user exists in database
    const existingCustomer = await findCustomerByPhone(cleanPhone);

    if (!existingCustomer) {
      await handleNewCustomer(phoneNumber, processedMessage);
    } else {
      await handleExistingCustomer(phoneNumber, processedMessage, existingCustomer);
    }

    return true; // Message handled
  } catch (error) {
    console.error('❌ Error in salon booking flow:', error);
    await sendTextMessage(message.from, 'Sorry, something went wrong. Please try again later.');
    return false;
  }
}

/**
 * Find customer by phone number with improved matching
 */
async function findCustomerByPhone(phoneNumber) {
  try {
    // Normalize phone number - extract last 10 digits
    const normalizedPhone = phoneNumber.replace(/[^\d]/g, '').slice(-10);
    
    const query = `
      SELECT * FROM customers 
      WHERE REGEXP_REPLACE(phone_number, '[^0-9]', '', 'g') LIKE $1
      LIMIT 1
    `;
    const result = await pool.query(query, [`%${normalizedPhone}`]);
    
    console.log(`🔍 Looking for customer with phone ending in: ${normalizedPhone}`);
    console.log(`📞 Found customer:`, result.rows[0] ? 'Yes' : 'No');
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error finding customer:', error);
    return null;
  }
}

/**
 * Handle new customer registration flow
 */
async function handleNewCustomer(phoneNumber, message) {
  const state = conversationStates.get(phoneNumber) || {
    phoneNumber,
    step: 'ask_name',
    data: {},
    lastActivity: new Date()
  };

  switch (state.step) {
    case 'ask_name':
      await sendTextMessage(
        phoneNumber,
        "Welcome aboard! Please share your full name."
      );
      state.step = 'collect_name';
      break;

    case 'collect_name':
      state.data.name = message.trim();
      await sendTextMessage(
        phoneNumber,
        `Thanks, ${state.data.name}! Please share your Date of Birth (DD-MM-YYYY).`
      );
      state.step = 'collect_dob';
      break;

    case 'collect_dob':
      // Validate DOB format
      const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dobRegex.test(message.trim())) {
        await sendTextMessage(
          phoneNumber,
          "Please enter your date of birth in DD-MM-YYYY format (e.g., 15-06-1990)."
        );
        return;
      }
      
      state.data.dob = message.trim();
      await sendGenderSelection(phoneNumber);
      state.step = 'collect_gender';
      break;

    case 'collect_gender':
      if (!['female', 'male', 'other'].includes(message.toLowerCase())) {
        await sendGenderSelection(phoneNumber);
        return;
      }
      
      // Map to correct enum values
      const genderMap = {
        'female': 'Female',
        'male': 'Male', 
        'other': 'Other'
      };
      state.data.gender = genderMap[message.toLowerCase()];
      await createCustomerAndAskBooking(phoneNumber, state.data);
      state.step = 'ask_booking';
      break;

    case 'ask_booking':
      if (message.toLowerCase() === 'yes' || message.toLowerCase().includes('yes')) {
        await startBookingFlow(phoneNumber, state);
      } else if (message.toLowerCase() === 'no' || message.toLowerCase().includes('no')) {
        await sendTextMessage(
          phoneNumber,
          "Alright! You can type \"Book Appointment\" anytime to get started."
        );
        await sendMainMenu(phoneNumber, state.data.name);
        state.step = 'main_menu';
      } else {
        await askForBookingAfterRegistration(phoneNumber);
      }
      break;

    default:
      await sendMainMenu(phoneNumber, state.data.name || 'there');
      state.step = 'main_menu';
  }

  conversationStates.set(phoneNumber, state);
}

/**
 * Handle existing customer interactions
 */
async function handleExistingCustomer(phoneNumber, message, customer) {
  const state = conversationStates.get(phoneNumber) || {
    phoneNumber,
    step: 'main_menu',
    data: { customerId: customer.customer_id, name: customer.customer_name },
    lastActivity: new Date()
  };

  console.log(`👤 Existing customer: ${customer.customer_name}, step: ${state.step}, message: ${message}`);

  // Check if we're in a booking flow first
  if (state.step && state.step !== 'main_menu') {
    console.log('🔄 Handling booking flow step');
    await handleBookingFlow(phoneNumber, message, state);
  } 
  // Handle main menu button responses and text commands
  else if (message.toLowerCase().includes('book_appointment') || message === '1' || message.toLowerCase().includes('book appointment')) {
    console.log('🎯 Starting booking flow for existing customer');
    await startBookingFlow(phoneNumber, state);
  } else if (message.toLowerCase().includes('view_bookings') || message.toLowerCase().includes('my bookings')) {
    await showBookings(phoneNumber, state);
  } else if (message.toLowerCase().includes('services_prices')) {
    await showServicesMenu(phoneNumber);
  } else if (message.toLowerCase().includes('contact_salon')) {
    await showContactInfo(phoneNumber);
  } else {
    // First interaction or unrecognized command - show welcome message and menu
    await sendTextMessage(
      phoneNumber,
      `Welcome back, ${customer.customer_name}! 😊\n\nHow can I assist you today?`
    );
    await sendMainMenu(phoneNumber, customer.customer_name);
    state.step = 'main_menu';
  }

  conversationStates.set(phoneNumber, state);
}

/**
 * Send gender selection buttons
 */
async function sendGenderSelection(phoneNumber) {
  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: 'Please select your gender:'
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'female', title: 'Female' } },
        { type: 'reply', reply: { id: 'male', title: 'Male' } },
        { type: 'reply', reply: { id: 'other', title: 'Other' } }
      ]
    }
  });
}

/**
 * Create customer in database and ask for booking
 */
async function createCustomerAndAskBooking(phoneNumber, data) {
  try {
    // Parse DOB
    const [day, month, year] = data.dob.split('-');
    const dob = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    // Create customer
    const query = `
      INSERT INTO customers (customer_name, phone_number, dob, gender)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      data.name,
      phoneNumber,
      dob,
      data.gender
    ]);

    // Store customer ID for future use
    const state = conversationStates.get(phoneNumber);
    if (state) {
      state.data.customerId = result.rows[0].customer_id;
    }

    await sendTextMessage(
      phoneNumber,
      `Perfect! Your profile has been created. 🎉\n\nWelcome to Bodhi Salon & Spa, ${data.name}!`
    );

    await askForBookingAfterRegistration(phoneNumber);

  } catch (error) {
    console.error('Error creating customer:', error);
    await sendTextMessage(
      phoneNumber,
      'Sorry, there was an error creating your profile. Please try again.'
    );
  }
}

/**
 * Ask for booking after registration
 */
async function askForBookingAfterRegistration(phoneNumber) {
  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: 'Would you like to book an appointment now?'
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'yes', title: 'Yes' } },
        { type: 'reply', reply: { id: 'no', title: 'No' } }
      ]
    }
  });
}

/**
 * Send main menu
 */
async function sendMainMenu(phoneNumber, name) {
  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: 'What would you like to do today?'
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'book_appointment', title: '📅 Book Appointment' } },
        { type: 'reply', reply: { id: 'view_bookings', title: '📋 View Bookings' } },
        { type: 'reply', reply: { id: 'services_prices', title: '💰 Services & Prices' } }
      ]
    }
  });
}

/**
 * Start booking flow - Step 1: Show Services
 */
async function startBookingFlow(phoneNumber, state) {
  try {
    await sendTextMessage(phoneNumber, "Please choose your service(s):");
    
    // Get real services from database
    const servicesQuery = 'SELECT service_id, service_name, service_category FROM services WHERE is_active = true LIMIT 6';
    const servicesResult = await pool.query(servicesQuery);
    const services = servicesResult.rows;

    if (services.length === 0) {
      await sendTextMessage(phoneNumber, 'Sorry, no services are currently available.');
      return;
    }

    // Send first 3 services as buttons
    const firstThree = services.slice(0, 3);
    await sendInteractiveMessage(phoneNumber, {
      type: 'button',
      body: {
        text: 'Select your service:'
      },
      action: {
        buttons: firstThree.map(service => ({
          type: 'reply', 
          reply: { 
            id: service.service_id.toString(), 
            title: service.service_name.substring(0, 20) // WhatsApp button title limit
          }
        }))
      }
    });

    // Send remaining services if any
    if (services.length > 3) {
      setTimeout(async () => {
        const remaining = services.slice(3, 6);
        await sendInteractiveMessage(phoneNumber, {
          type: 'button',
          body: {
            text: 'More services:'
          },
          action: {
            buttons: remaining.map(service => ({
              type: 'reply', 
              reply: { 
                id: service.service_id.toString(), 
                title: service.service_name.substring(0, 20)
              }
            }))
          }
        });
      }, 1000);
    }

    state.step = 'select_services';
    state.data.availableServices = services;
    
    console.log(`🎯 Booking flow started, step set to: ${state.step}`);
    console.log(`📋 Available services: ${services.map(s => `${s.service_id}:${s.service_name}`).join(', ')}`);
    console.log(`💾 Saving state for phone: ${phoneNumber}`);
    
    // Save the updated state
    conversationStates.set(phoneNumber, state);
    
    // Verify state was saved
    const savedState = conversationStates.get(phoneNumber);
    console.log(`✅ State saved successfully: step=${savedState.step}, servicesCount=${savedState.data.availableServices?.length || 0}`);
  } catch (error) {
    console.error('Error starting booking flow:', error);
    await sendTextMessage(phoneNumber, 'Sorry, there was an error loading services.');
  }
}

/**
 * Handle booking flow steps
 */
async function handleBookingFlow(phoneNumber, message, state) {
  console.log(`🔄 Booking flow step: ${state.step}, message: ${message}`);
  console.log(`📊 Available services:`, state.data.availableServices?.map(s => `${s.service_id}:${s.service_name}`) || 'None');
  
  switch (state.step) {
    case 'select_services':
      // Handle real service selection by ID
      const serviceId = parseInt(message);
      console.log(`🔍 Parsing service ID: ${message} → ${serviceId}`);
      
      if (serviceId && state.data.availableServices) {
        const selectedService = state.data.availableServices.find(s => s.service_id === serviceId);
        console.log(`🔍 Found service:`, selectedService ? `${selectedService.service_name}` : 'Not found');
        
        if (selectedService) {
          state.data.selectedService = selectedService;
          console.log(`✅ Service selected: ${selectedService.service_name}`);
          await showTimeSlots(phoneNumber, state);
          // Update state and save it
          conversationStates.set(phoneNumber, state);
        } else {
          console.log(`❌ Service ID ${serviceId} not found in available services`);
          await sendTextMessage(phoneNumber, 'Please select a valid service from the options above.');
        }
      } else {
        console.log(`❌ Invalid service selection: message="${message}", serviceId=${serviceId}, hasServices=${!!state.data.availableServices}`);
        await sendTextMessage(phoneNumber, 'Please select a service by clicking one of the buttons above.');
      }
      break;

    case 'select_slot':
      // Handle time slot selection
      if (message && (message.includes('AM') || message.includes('PM'))) {
        state.data.selectedTime = message;
        console.log(`✅ Time slot selected: ${message}`);
        await showAvailableStaff(phoneNumber, state);
        conversationStates.set(phoneNumber, state);
      } else {
        await sendTextMessage(phoneNumber, 'Please select a valid time slot from the options above.');
      }
      break;

    case 'select_staff':
      // Handle staff selection by ID
      const staffId = parseInt(message);
      if (staffId && state.data.availableStaff) {
        const selectedStaff = state.data.availableStaff.find(s => s.staff_id === staffId);
        if (selectedStaff) {
          state.data.selectedStaff = selectedStaff;
          console.log(`✅ Staff selected: ${selectedStaff.staff_name}`);
          await showBookingConfirmation(phoneNumber, state);
          conversationStates.set(phoneNumber, state);
        } else {
          await sendTextMessage(phoneNumber, 'Please select a valid staff member from the options above.');
        }
      } else {
        await sendTextMessage(phoneNumber, 'Please select a staff member by clicking one of the buttons above.');
      }
      break;

    case 'booking_confirmation':
      if (message.toLowerCase().includes('confirm_appointment')) {
        await confirmBooking(phoneNumber, state);
      } else if (message.toLowerCase().includes('cancel_appointment')) {
        await cancelBooking(phoneNumber, state);
      } else if (message.toLowerCase().includes('reschedule_appointment')) {
        await rescheduleBooking(phoneNumber, state);
      } else {
        await sendTextMessage(phoneNumber, 'Please choose one of the options: Confirm, Cancel, or Reschedule.');
      }
      break;

    default:
      console.log(`❓ Unknown booking step: ${state.step}`);
      await sendTextMessage(phoneNumber, 'Something went wrong. Let me show you the main menu.');
      await sendMainMenu(phoneNumber, state.data.name);
      state.step = 'main_menu';
      conversationStates.set(phoneNumber, state);
  }
}

/**
 * Step 2: Show available time slots
 */
async function showTimeSlots(phoneNumber, state) {
  await sendTextMessage(
    phoneNumber,
    `Great choice! Please select your preferred time slot:`
  );

  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: 'Available slots:'
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: '10:00 AM', title: '10:00 AM' } },
        { type: 'reply', reply: { id: '11:00 AM', title: '11:00 AM' } },
        { type: 'reply', reply: { id: '12:30 PM', title: '12:30 PM' } }
      ]
    }
  });

  setTimeout(async () => {
    await sendInteractiveMessage(phoneNumber, {
      type: 'button',
      body: {
        text: 'More slots:'
      },
      action: {
        buttons: [
          { type: 'reply', reply: { id: '2:00 PM', title: '2:00 PM' } }
        ]
      }
    });
  }, 1000);

  state.step = 'select_slot';
  console.log(`⏰ Time slot selection step set`);
  conversationStates.set(phoneNumber, state);
}

/**
 * Step 3: Show available staff for selected slot
 */
async function showAvailableStaff(phoneNumber, state) {
  try {
    await sendTextMessage(
      phoneNumber,
      `Here are the staff available at ${state.data.selectedTime}:`
    );

    // Get real staff from database
    const staffQuery = 'SELECT staff_id, staff_name, position FROM staff WHERE status = true LIMIT 3';
    const staffResult = await pool.query(staffQuery);
    const staff = staffResult.rows;

    if (staff.length === 0) {
      await sendTextMessage(phoneNumber, 'Sorry, no staff available at this time.');
      return;
    }

    await sendInteractiveMessage(phoneNumber, {
      type: 'button',
      body: {
        text: 'Choose your staff:'
      },
      action: {
        buttons: staff.map(member => ({
          type: 'reply', 
          reply: { 
            id: member.staff_id.toString(), 
            title: member.staff_name.substring(0, 20)
          }
        }))
      }
    });

    state.data.availableStaff = staff;
    state.step = 'select_staff';
    console.log(`👥 Staff selection step set, available: ${staff.map(s => s.staff_name).join(', ')}`);
    conversationStates.set(phoneNumber, state);
  } catch (error) {
    console.error('Error loading staff:', error);
    await sendTextMessage(phoneNumber, 'Sorry, there was an error loading staff.');
  }
}

/**
 * Step 4: Show booking confirmation
 */
async function showBookingConfirmation(phoneNumber, state) {
  const today = new Date();
  const bookingDate = today.toLocaleDateString('en-IN');

  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: `Here are your booking details:\n\n` +
            `Service: ${state.data.selectedService.service_name}\n` +
            `Date: ${bookingDate}\n` +
            `Time: ${state.data.selectedTime}\n` +
            `Staff: ${state.data.selectedStaff.staff_name}\n\n` +
            `Please confirm your appointment.`
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'confirm_appointment', title: '✅ Confirm' } },
        { type: 'reply', reply: { id: 'cancel_appointment', title: '❌ Cancel' } },
        { type: 'reply', reply: { id: 'reschedule_appointment', title: '📅 Reschedule' } }
      ]
    }
  });

  state.step = 'booking_confirmation';
  console.log(`✅ Booking confirmation step set`);
  conversationStates.set(phoneNumber, state);
}

/**
 * Confirm booking - Store in database
 */
async function confirmBooking(phoneNumber, state) {
  try {
    const today = new Date();
    const bookingDate = today.toLocaleDateString('en-IN');
    
    // Parse time and create booking datetime
    const [time, period] = state.data.selectedTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    if (period === 'PM' && hour24 !== 12) hour24 += 12;
    if (period === 'AM' && hour24 === 12) hour24 = 0;
    
    const bookingDateTime = new Date();
    bookingDateTime.setHours(hour24, parseInt(minutes) || 0, 0, 0);
    
    // Create booking in database
    const bookingQuery = `
      INSERT INTO bookings (
        customer_id, 
        staff_id, 
        service_type, 
        booking_date, 
        booking_time, 
        booking_status, 
        special_notes,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING booking_id
    `;
    
    const bookingResult = await pool.query(bookingQuery, [
      state.data.customerId,
      state.data.selectedStaff.staff_id,
      'Salon', // Valid service type enum value
      today,
      bookingDateTime,
      'Confirmed', // Valid booking status enum value
      `WhatsApp booking - Service: ${state.data.selectedService.service_name}`
    ]);
    
    const bookingId = bookingResult.rows[0].booking_id;
    
    console.log(`✅ Booking created successfully: ID ${bookingId} for customer ${state.data.customerId}`);

    await sendTextMessage(
      phoneNumber,
      `Your appointment is confirmed! 🎉\n\n` +
      `Booking ID: #${bookingId}\n` +
      `Service: ${state.data.selectedService.service_name}\n` +
      `Date: ${bookingDate}\n` +
      `Time: ${state.data.selectedTime}\n` +
      `Staff: ${state.data.selectedStaff.staff_name}\n\n` +
      `You can type "My Bookings" anytime to view or manage.`
    );

    // Send contact salon option after booking confirmation
    setTimeout(async () => {
      await sendInteractiveMessage(phoneNumber, {
        type: 'button',
        body: {
          text: 'Need help or have questions?'
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'contact_salon', title: '📞 Contact Salon' } }
          ]
        }
      });
    }, 1000);

    // Reset state to main menu
    state.step = 'main_menu';
    state.data = { customerId: state.data.customerId, name: state.data.name };
    
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    await sendTextMessage(
      phoneNumber,
      'Sorry, there was an error confirming your booking. Please try again or contact the salon directly.'
    );
  }
}

/**
 * Cancel booking
 */
async function cancelBooking(phoneNumber, state) {
  await sendTextMessage(
    phoneNumber,
    'Your appointment has been cancelled successfully.'
  );

  // Reset state to main menu
  state.step = 'main_menu';
  state.data = { customerId: state.data.customerId, name: state.data.name };
}

/**
 * Reschedule booking
 */
async function rescheduleBooking(phoneNumber, state) {
  await sendTextMessage(
    phoneNumber,
    'Sure! Please select a new time slot.'
  );

  // Go back to slot selection
  await showTimeSlots(phoneNumber, state);
}

/**
 * Show customer bookings
 */
async function showBookings(phoneNumber, state) {
  try {
    const query = `
      SELECT b.*, s.staff_name 
      FROM bookings b
      LEFT JOIN staff s ON b.staff_id = s.staff_id
      WHERE b.customer_id = $1 AND b.booking_date >= CURRENT_DATE
      ORDER BY b.booking_date ASC, b.booking_time ASC
    `;
    const result = await pool.query(query, [state.data.customerId]);
    const bookings = result.rows;

    if (bookings.length === 0) {
      await sendTextMessage(
        phoneNumber,
        'You have no upcoming bookings. Would you like to book an appointment?'
      );
      await sendInteractiveMessage(phoneNumber, {
        type: 'button',
        body: { text: 'Book your first appointment:' },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'book_appointment', title: '📅 Book Now' } },
            { type: 'reply', reply: { id: 'main_menu', title: '🏠 Main Menu' } }
          ]
        }
      });
    } else {
      let bookingText = '📋 Your upcoming appointments:\n\n';
      bookings.forEach((booking, index) => {
        const date = new Date(booking.booking_date).toLocaleDateString('en-IN');
        const time = new Date(booking.booking_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const staff = booking.staff_name || 'Staff TBD';
        const status = booking.booking_status || 'CONFIRMED';
        bookingText += `${index + 1}. #${booking.booking_id} - ${date} at ${time}\n   Staff: ${staff}\n   Status: ${status}\n\n`;
      });

      await sendTextMessage(phoneNumber, bookingText);
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    await sendTextMessage(
      phoneNumber,
      'Sorry, I couldn\'t fetch your bookings right now. Please try again later.'
    );
  }
}

/**
 * Show services menu
 */
async function showServicesMenu(phoneNumber) {
  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: 'Choose your category to see services and prices:'
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'womens_services', title: '👩 Women\'s Services' } },
        { type: 'reply', reply: { id: 'mens_services', title: '👨 Men\'s Services' } },
        { type: 'reply', reply: { id: 'book_appointment', title: '📅 Book Appointment' } }
      ]
    }
  });
}

/**
 * Show contact information
 */
async function showContactInfo(phoneNumber) {
  await sendTextMessage(
    phoneNumber,
    `📞 Contact Bodhi Salon & Spa:\n\n` +
    `📱 Phone: ${process.env.SALON_PHONE || '+91-XXXXXXXXXX'}\n` +
    `🕛 Hours: ${process.env.SALON_HOURS || '10 AM – 8 PM'}\n` +
    `📍 Location: ${process.env.SALON_ADDRESS || 'Bodhi Salon, Thrissur'}\n\n` +
    `We're here to help! 😊`
  );
}

/**
 * Send appointment reminder
 */
async function sendAppointmentReminder(phoneNumber, booking) {
  const date = new Date(booking.booking_date).toLocaleDateString('en-IN');
  const time = new Date(booking.booking_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const staff = booking.staff_name || 'our team';

  await sendTextMessage(
    phoneNumber,
    `⏰ Reminder: Your appointment at Bodhi Salon is at ${time} today (${date}).\n\n` +
    `Staff: ${staff}\n\n` +
    `Please arrive 5-10 minutes early. See you soon! 🌿`
  );
}

/**
 * Send delay notification
 */
async function sendDelayNotification(phoneNumber, delayMinutes, newTime) {
  await sendInteractiveMessage(phoneNumber, {
    type: 'button',
    body: {
      text: `Your appointment is delayed by ${delayMinutes} minutes.\n\nNew expected time: ${newTime}`
    },
    action: {
      buttons: [
        { type: 'reply', reply: { id: 'confirm_delay', title: '✅ Confirm' } },
        { type: 'reply', reply: { id: 'reschedule', title: '📅 Reschedule' } }
      ]
    }
  });
}

/**
 * Send bill after service completion
 */
async function sendBillNotification(phoneNumber, bill) {
  const services = bill.services || 'Services';
  const amount = bill.totalAmount || bill.grand_total || 0;

  await sendTextMessage(
    phoneNumber,
    `🧾 Your services have been completed. Thank you for visiting Bodhi Salon!\n\n` +
    `Services: ${services}\n` +
    `Total: ₹${amount}\n\n` +
    `Your bill will be sent shortly. 📄`
  );
}

module.exports = {
  handleSalonBookingFlow,
  sendAppointmentReminder,
  sendDelayNotification,
  sendBillNotification
};