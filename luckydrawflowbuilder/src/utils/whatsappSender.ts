import type { Screen } from '../types'

// WhatsApp Business API configuration using environment variables
const WHATSAPP_API_URL = `https://graph.facebook.com/${import.meta.env.VITE_WHATSAPP_API_VERSION || 'v22.0'}`
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '158282837372377'
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || ''

export interface WhatsAppFlowResponse {
  id?: string
  success?: boolean
  error?: string
  message?: string
}

// Convert builder screens to WhatsApp Flow format
export function convertToWhatsAppFlow(screens: Screen[]): any {
  const whatsappFlow = {
    version: "5.0",
    screens: screens.map(screen => ({
      id: screen.id,
      title: screen.title,
      terminal: screen.terminal,
      success: screen.success,
      layout: {
        type: "SingleColumnLayout",
        children: screen.elements.map(element => {
          switch (element.type) {
            case 'TextHeading':
              return {
                type: "TextHeading",
                text: element.text
              }
            case 'TextSubheading':
              return {
                type: "TextSubheading", 
                text: element.text
              }
            case 'TextBody':
              return {
                type: "TextBody",
                text: element.text
              }
            case 'TextInput':
              return {
                type: "TextInput",
                label: element.label,
                name: element.name,
                required: element.required || false,
                input_type: element.inputType || 'text'
              }
            case 'RadioButtonsGroup':
              return {
                type: "RadioButtonsGroup",
                label: element.label,
                name: element.name,
                required: element.required || false,
                data_source: element.options
              }
            case 'Footer':
              return {
                type: "Footer",
                label: element.label,
                on_click_action: {
                  name: element.action === 'navigate' ? "navigate" : "complete",
                  next: {
                    type: "screen",
                    name: element.nextScreen || ""
                  },
                  payload: {}
                }
              }
            default:
              return element
          }
        })
      }
    }))
  }
  
  return whatsappFlow
}

// Use the known business account ID
const BUSINESS_ACCOUNT_ID = '164297206767745'

// Create a new flow - Fixed endpoint according to documentation
export async function createWhatsAppFlow(screens: Screen[], flowName: string): Promise<WhatsAppFlowResponse> {
  try {
    const whatsappFlow = convertToWhatsAppFlow(screens)
    
    // Use the known business account ID
    const businessAccountId = BUSINESS_ACCOUNT_ID
    
    // Create flow using business account endpoint (correct according to docs)
    const response = await fetch(`${WHATSAPP_API_URL}/${businessAccountId}/flows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: flowName,
        categories: ['OTHER'],
        flow_json: whatsappFlow
      })
    })

    const data = await response.json()
    
    if (response.ok && data.id) {
      return {
        id: data.id,
        success: true,
        message: 'Flow created successfully'
      }
    } else {
      console.error('Flow creation error:', data)
      return {
        success: false,
        error: data.error?.message || JSON.stringify(data.error) || 'Failed to create flow'
      }
    }
  } catch (error) {
    console.error('Flow creation exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Publish the flow
export async function publishFlow(flowId: string): Promise<WhatsAppFlowResponse> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${flowId}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      return {
        success: true,
        message: 'Flow published successfully'
      }
    } else {
      return {
        success: false,
        error: data.error?.message || 'Failed to publish flow'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Send flow to a WhatsApp number
export async function sendFlowToWhatsApp(
  toNumber: string, 
  flowId: string, 
  flowToken: string,
  buttonText: string = "Open Flow"
): Promise<WhatsAppFlowResponse> {
  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toNumber,
        type: "interactive",
        interactive: {
          type: "flow",
          header: {
            type: "text",
            text: "Test Flow from Builder"
          },
          body: {
            text: "This is a test flow created with the WhatsApp Flow Builder. Tap the button below to try it out!"
          },
          footer: {
            text: "Built with Flow Builder v7.2"
          },
          action: {
            name: "flow",
            parameters: {
              flow_message_version: "3",
              flow_id: flowId,
              flow_token: flowToken,
              flow_cta: buttonText,
              mode: "draft" // Use "published" for published flows
            }
          }
        }
      })
    })

    const data = await response.json()
    
    if (response.ok) {
      return {
        success: true,
        message: 'Flow sent successfully to ' + toNumber
      }
    } else {
      return {
        success: false,
        error: data.error?.message || 'Failed to send flow'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Send flow as interactive message (simpler approach - works without flow approval)
export async function sendFlowAsInteractiveMessage(
  screens: Screen[], 
  toNumber: string, 
  flowName: string = 'Test Flow'
): Promise<WhatsAppFlowResponse> {
  try {
    const firstScreen = screens[0]
    if (!firstScreen || !firstScreen.elements.length) {
      return {
        success: false,
        error: 'No screens or elements available to send'
      }
    }

    // Create interactive message with buttons based on screen elements
    const buttons = firstScreen.elements
      .filter(el => el.type === 'Footer' || el.type === 'NavigationList' || el.type === 'RadioButtonsGroup')
      .slice(0, 3) // WhatsApp allows max 3 buttons
      .map((el: any, index: number) => ({
        type: "reply",
        reply: {
          id: `btn_${index}`,
          title: (el.label || el.text || `Option ${index + 1}`).substring(0, 20) // Max 20 chars
        }
      }))

    let messagePayload: any

    if (buttons.length > 0) {
      // Interactive message with buttons
      messagePayload = {
        messaging_product: "whatsapp",
        to: toNumber.replace(/\+/g, ''),
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: flowName
          },
          body: {
            text: `${firstScreen.title}\n\n` + 
                  firstScreen.elements
                    .filter(el => el.type.includes('Text') && (el as any).text)
                    .map((el: any) => (el as any).text)
                    .slice(0, 3)
                    .join('\n') + 
                  '\n\n🔽 Choose an option:'
          },
          footer: {
            text: "Built with Flow Builder"
          },
          action: {
            buttons: buttons
          }
        }
      }
    } else {
      // Simple text message if no interactive elements
      messagePayload = {
        messaging_product: "whatsapp",
        to: toNumber.replace(/\+/g, ''),
        type: "text",
        text: {
          body: `${flowName}\n\n${firstScreen.title}\n\n` + 
                firstScreen.elements
                  .map((el: any) => {
                    if (el.text) return `• ${el.text}`
                    if (el.label) return `• ${el.label}`
                    return `• ${el.type}`
                  })
                  .join('\n') + 
                '\n\n📱 This is a preview of your flow created with Flow Builder!'
        }
      }
    }

    const response = await fetch(`${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    })

    const data = await response.json()
    
    if (response.ok) {
      return {
        success: true,
        message: `Flow preview sent to ${toNumber}! Message ID: ${data.messages?.[0]?.id}`
      }
    } else {
      console.error('Send interactive message error:', data)
      return {
        success: false,
        error: data.error?.message || JSON.stringify(data.error) || 'Failed to send message'
      }
    }
    
  } catch (error) {
    console.error('Send interactive message exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Complete flow process: try interactive message first, then formal flow
export async function sendTestFlow(
  screens: Screen[], 
  toNumber: string, 
  flowName: string = 'Test Flow'
): Promise<WhatsAppFlowResponse> {
  try {
    // First, try the simpler interactive message approach
    console.log('Sending flow as interactive message...')
    const interactiveResult = await sendFlowAsInteractiveMessage(screens, toNumber, flowName)
    
    if (interactiveResult.success) {
      return {
        ...interactiveResult,
        message: interactiveResult.message + '\n\nNote: Sent as interactive message (no formal flow creation needed)'
      }
    }

    // If interactive message fails, try creating a formal flow
    console.log('Interactive message failed, trying formal flow creation...')
    
    // Step 1: Create the flow
    console.log('Creating flow...')
    const createResult = await createWhatsAppFlow(screens, flowName)
    
    if (!createResult.success || !createResult.id) {
      return {
        success: false,
        error: `Both interactive message and flow creation failed. Interactive error: ${interactiveResult.error}. Flow error: ${createResult.error}`
      }
    }

    const flowId = createResult.id
    
    // Step 2: Publish the flow
    console.log('Publishing flow...')
    const publishResult = await publishFlow(flowId)
    
    if (!publishResult.success) {
      return {
        success: false,
        error: `Flow created but publishing failed: ${publishResult.error}`
      }
    }

    // Step 3: Send the flow
    console.log('Sending formal flow...')
    const flowToken = `flow_token_${Date.now()}`
    const sendResult = await sendFlowToWhatsApp(toNumber, flowId, flowToken)
    
    if (sendResult.success) {
      return {
        success: true,
        message: `Formal flow created (${flowId}) and sent to ${toNumber}`
      }
    } else {
      return sendResult
    }
    
  } catch (error) {
    console.error('Complete flow process error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Process failed'
    }
  }
}