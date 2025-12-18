import { WhatsAppService } from './whatsappService'
import type { MessageLibraryEntry } from '../types'

const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || ''
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || ''
const API_VERSION = import.meta.env.VITE_WHATSAPP_API_VERSION || 'v22.0'

function authHeaders() {
  return {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
}

// Official WhatsApp Business API base URL
const API_BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`

export async function sendLibraryMessage(entry: MessageLibraryEntry, to: string): Promise<{ success: boolean; error?: string }> {
  if (!to) return { success: false, error: 'Missing recipient phone number' }
  // Normalize
  const recipient = to.replace(/\s+/g, '')

  try {
    switch (entry.type) {
      case 'standard_text': {
        const body = (entry.contentPayload as any).body || ''
        const message = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'text',
          text: {
            preview_url: false,
            body: body
          }
        }
        
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(message)
        })
        
        const data = await res.json()
        if (!res.ok) {
          console.error('WhatsApp API Error:', data)
          return { success: false, error: data.error?.message || 'Failed to send text message' }
        }
        
        console.log('Text message sent successfully:', data)
        return { success: true }
      }

      case 'interactive_button': {
        const payload = entry.contentPayload as any
        const buttons = (payload.buttons || []).slice(0, 3).map((b: any) => ({
          type: 'reply',
          reply: {
            id: b.buttonId || b.id,
            title: b.title
          }
        }))
        
        const interactive: any = {
          type: 'button',
          body: { text: payload.body || '' },
          action: { buttons }
        }
        
        // Add optional header
        if (payload.header) {
          interactive.header = { type: 'text', text: payload.header }
        }
        
        // Add optional footer
        if (payload.footer) {
          interactive.footer = { text: payload.footer }
        }
        
        const message = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'interactive',
          interactive
        }
        
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(message)
        })
        
        const data = await res.json()
        if (!res.ok) {
          console.error('WhatsApp API Error:', data)
          return { success: false, error: data.error?.message || 'Failed to send interactive button message' }
        }
        
        console.log('Interactive button message sent successfully:', data)
        return { success: true }
      }

      case 'interactive_list': {
        const payload = entry.contentPayload as any
        
        const interactive: any = {
          type: 'list',
          body: { text: payload.body || '' },
          action: {
            button: payload.buttonText || 'View Options',
            sections: (payload.sections || []).map((s: any) => ({
              title: s.title,
              rows: (s.rows || []).map((r: any) => ({
                id: r.rowId || r.id,
                title: r.title,
                description: r.description
              }))
            }))
          }
        }
        
        // Add optional header
        if (payload.header) {
          interactive.header = { type: 'text', text: payload.header }
        }
        
        // Add optional footer
        if (payload.footer) {
          interactive.footer = { text: payload.footer }
        }
        
        const message = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'interactive',
          interactive
        }

        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(message)
        })
        
        const data = await res.json()
        if (!res.ok) {
          console.error('WhatsApp API Error:', data)
          return { success: false, error: data.error?.message || 'Failed to send interactive list message' }
        }
        
        console.log('Interactive list message sent successfully:', data)
        return { success: true }
      }

      case 'flow_starter': {
        const payload = entry.contentPayload as any
        
        const interactive = {
          type: 'flow',
          header: {
            type: 'text',
            text: 'Complete the Form'
          },
          body: {
            text: payload.message || 'Please complete this form to continue.'
          },
          footer: {
            text: 'Powered by WhatsApp Flow'
          },
          action: {
            name: 'flow',
            parameters: {
              flow_message_version: '3',
              flow_id: payload.flowId,
              flow_cta: 'Start',
              flow_action: 'navigate'
            }
          }
        }
        
        const message = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipient,
          type: 'interactive',
          interactive
        }
        
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(message)
        })
        
        const data = await res.json()
        if (!res.ok) {
          console.error('WhatsApp API Error:', data)
          return { success: false, error: data.error?.message || 'Failed to send flow message' }
        }
        
        console.log('Flow message sent successfully:', data)
        return { success: true }
      }

      default:
        return { success: false, error: 'Unsupported message type for sending' }
    }
  } catch (error: any) {
    return { success: false, error: error?.message || String(error) }
  }
}

export default sendLibraryMessage
