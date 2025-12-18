// Test function to debug message sending issues
import { sendLibraryMessage } from './messageLibrarySender'
import type { MessageLibraryEntry } from '../types'

// Test function to send a simple message
export async function testSendMessage(recipientPhone: string): Promise<void> {
  console.log('🧪 Testing message sending...')
  console.log('📱 Recipient:', recipientPhone)
  console.log('🔑 Access Token:', import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN ? 'Present' : 'Missing')
  console.log('📞 Phone Number ID:', import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID)
  console.log('🌐 API Version:', import.meta.env.VITE_WHATSAPP_API_VERSION)

  // Create a test message
  const testMessage: MessageLibraryEntry = {
    messageId: 'test-123',
    name: 'Test Message',
    type: 'standard_text',
    status: 'published',
    contentPayload: {
      body: 'Hello! This is a test message from your WhatsApp Business API. 🚀'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  try {
    console.log('📤 Sending test message...')
    const result = await sendLibraryMessage(testMessage, recipientPhone)
    
    if (result.success) {
      console.log('✅ Message sent successfully!')
      alert('✅ Test message sent successfully!')
    } else {
      console.error('❌ Failed to send message:', result.error)
      alert(`❌ Failed to send message: ${result.error}`)
    }
  } catch (error) {
    console.error('💥 Error during message sending:', error)
    alert(`💥 Error: ${error}`)
  }
}

// Debug function to check environment variables
export function debugEnvironment(): void {
  console.log('🔍 Environment Debug:')
  console.log('- VITE_WHATSAPP_ACCESS_TOKEN:', import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN ? 'Set (length: ' + import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN.length + ')' : 'Not set')
  console.log('- VITE_WHATSAPP_PHONE_NUMBER_ID:', import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || 'Not set')
  console.log('- VITE_WHATSAPP_BUSINESS_ACCOUNT_ID:', import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || 'Not set')
  console.log('- VITE_WHATSAPP_API_VERSION:', import.meta.env.VITE_WHATSAPP_API_VERSION || 'Not set')
  console.log('- VITE_WHATSAPP_BUSINESS_NUMBER:', import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || 'Not set')
  console.log('- VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL || 'Not set')
}

// Test API connectivity
export async function testWhatsAppAPI(): Promise<void> {
  const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID
  const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN
  const API_VERSION = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v22.0'

  if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
    console.error('❌ Missing required environment variables')
    alert('❌ Missing ACCESS_TOKEN or PHONE_NUMBER_ID')
    return
  }

  try {
    console.log('🔗 Testing WhatsApp API connectivity...')
    
    // Test with a simple API call to get phone number info
    const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ WhatsApp API connection successful!')
      console.log('📞 Phone number info:', data)
      alert('✅ WhatsApp API connection successful!')
    } else {
      console.error('❌ WhatsApp API error:', data)
      alert(`❌ WhatsApp API error: ${data.error?.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('💥 Network error:', error)
    alert(`💥 Network error: ${error}`)
  }
}

// Add these functions to window for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testSendMessage = testSendMessage;
  (window as any).debugEnvironment = debugEnvironment;
  (window as any).testWhatsAppAPI = testWhatsAppAPI;
}
