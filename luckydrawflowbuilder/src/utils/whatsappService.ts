import { buildFlowJson } from './jsonBuilder'

// WhatsApp Business API Service
export class WhatsAppService {
  private accessToken: string
  private phoneNumberId: string
  private businessAccountId: string
  private baseUrl: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken || import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN || ''
    this.phoneNumberId = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '158282837372377'
    this.businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '164297206767745'
    this.baseUrl = `https://graph.facebook.com/${import.meta.env.VITE_WHATSAPP_API_VERSION || 'v22.0'}`
    
    if (!this.accessToken) {
      console.warn('WhatsApp access token not provided. Please set VITE_WHATSAPP_ACCESS_TOKEN in your .env file.')
    }
  }

  // Test business account access and permissions
  async testBusinessAccountAccess(): Promise<any> {
    // Try accessing the business account directly using the business account ID
    const url = `${this.baseUrl}/${this.businessAccountId}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Business account access error:', data)
        
        // Try alternative approach - check phone number directly
        return this.testPhoneNumberAccess()
      }

      return {
        success: true,
        businessAccount: data,
        message: `Successfully accessed business account: ${data.name || this.businessAccountId}`
      }
    } catch (error) {
      console.error('Error testing business account access:', error)
      // Fallback to phone number test
      return this.testPhoneNumberAccess()
    }
  }

  // Test phone number access as fallback
  async testPhoneNumberAccess(): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Phone number access error:', data)
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return {
        success: true,
        phoneNumber: data,
        message: `Successfully accessed phone number: ${data.display_phone_number || this.phoneNumberId}`
      }
    } catch (error) {
      console.error('Error testing phone number access:', error)
      throw error
    }
  }

  // Send hello message to initiate flow conversation
  async sendHelloToStartFlow(to: string = '918281348343'): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\+/g, ''), // Remove + if present
      type: 'template',
      template: {
        name: 'hello_world',
        language: {
          code: 'en_US'
        }
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('WhatsApp API Error:', data)
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // After successful hello message, we can now send flow messages within 24 hours
      return {
        ...data,
        message: 'Hello message sent! You can now send flow messages to this number for 24 hours.'
      }
    } catch (error) {
      console.error('Error sending hello message:', error)
      throw error
    }
  }

  // Create a flow using WhatsApp Business API - using phone number ID instead of business account
  async createFlow(flowName: string, category: string = 'OTHER'): Promise<any> {
    // Validate inputs
    if (!flowName || typeof flowName !== 'string' || flowName.trim().length === 0) {
      throw new Error('Flow name is required and must be a non-empty string')
    }

    const cleanName = flowName.trim()
    if (cleanName.length > 60) {
      throw new Error('Flow name must be 60 characters or less')
    }

    // Use phone number ID endpoint instead of business account to avoid permission issues
    const url = `${this.baseUrl}/${this.phoneNumberId}/flows`
    
    // Valid categories according to WhatsApp Business API v22.0 docs
    const validCategories = ['SIGN_UP', 'LEAD_GENERATION', 'CUSTOMER_SUPPORT', 'APPOINTMENT_BOOKING', 'OTHER']
    const upperCategory = category.toUpperCase()
    
    if (!validCategories.includes(upperCategory)) {
      console.warn(`Invalid category '${category}', using 'OTHER' instead`)
      category = 'OTHER'
    }
    
    // Correct payload structure for WhatsApp Business API v22.0
    const payload = {
      name: cleanName,
      categories: [upperCategory]
    }

    console.log('Creating flow with payload:', JSON.stringify(payload, null, 2))
    console.log('URL:', url)
    console.log('Phone Number ID:', this.phoneNumberId)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Flow creation error:', {
          url,
          payload,
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        
        // Specific error handling for parameter issues
        if (data.error?.code === 100) {
          // Try alternative approach using phone number ID if business account fails
          console.log('Trying alternative flow creation using phone number ID...')
          return await this.createFlowAlternative(cleanName, upperCategory)
        } else if (data.error?.code === 190) {
          throw new Error('Access token error. Token may be expired or invalid.')
        } else if (data.error?.code === 200) {
          throw new Error('Permission error. Access token needs "whatsapp_business_management" permission.')
        } else if (data.error?.code === 368) {
          throw new Error('Business account verification required. Verify your WhatsApp Business Account.')
        }
        
        throw new Error(`${data.error?.message || 'Unknown error'} (Code: ${data.error?.code || 'N/A'})`)
      }

      console.log('✅ Flow created successfully:', data)
      return data
    } catch (error) {
      console.error('Error creating flow:', error)
      throw error
    }
  }

  // Alternative flow creation method using phone number ID
  async createFlowAlternative(flowName: string, category: string = 'OTHER'): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/flows`
    
    const payload = {
      name: flowName,
      categories: [category]
    }

    console.log('Creating flow via phone number ID with payload:', JSON.stringify(payload, null, 2))
    console.log('Alternative URL:', url)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Alternative flow creation error:', {
          url,
          payload,
          status: response.status,
          statusText: response.statusText,
          data: data
        })
        
        throw new Error(`Flow creation failed: ${data.error?.message || 'Unknown error'} (Code: ${data.error?.code || 'N/A'})`)
      }

      console.log('✅ Flow created successfully via alternative method:', data)
      return data
    } catch (error) {
      console.error('Error in alternative flow creation:', error)
      throw error
    }
  }

  // Send interactive message with flow button
  async sendFlowMessage(to: string, flowId: string, flowToken?: string, buttonText: string = 'Start Flow'): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\+/g, ''),
      type: 'interactive',
      interactive: {
        type: 'flow',
        header: {
          type: 'text',
          text: 'Complete the Form'
        },
        body: {
          text: 'Please fill out this form to continue with the lucky draw registration.'
        },
        footer: {
          text: 'Built with Flow Builder'
        },
        action: {
          name: 'flow',
          parameters: {
            flow_message_version: '3',
            flow_token: flowToken || `token_${Date.now()}`,
            flow_id: flowId,
            flow_cta: buttonText,
            flow_action: 'navigate',
            flow_action_payload: {
              screen: 'WELCOME',
              data: {}
            }
          }
        }
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Flow message error:', data)
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('Error sending flow message:', error)
      throw error
    }
  }

  // Send a template message
  async sendTemplateMessage(to: string, templateName: string = 'hello_world', languageCode: string = 'en_US') {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${result.error?.message || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw error
    }
  }

  // Send a text message
  async sendTextMessage(to: string, text: string) {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: text
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${result.error?.message || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw error
    }
  }

  // Send interactive message (buttons, lists, etc.)
  async sendInteractiveMessage(to: string, interactiveData: any) {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'interactive',
      interactive: interactiveData
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${result.error?.message || 'Unknown error'}`)
      }

      return result
    } catch (error) {
      console.error('Error sending WhatsApp interactive message:', error)
      throw error
    }
  }

  // Convert flow screen to WhatsApp interactive message format
  convertScreenToInteractive(screen: any) {
    const interactive: any = {
      type: 'flow',
      header: {
        type: 'text',
        text: screen.title || 'Flow Message'
      },
      body: {
        text: 'Please complete this flow to continue.'
      },
      action: {
        name: 'flow',
        parameters: {
          flow_message_version: '3',
          flow_token: `flow_token_${Date.now()}`,
          flow_id: 'your_flow_id', // You'll need to create a flow in WhatsApp Business Manager
          flow_cta: 'Open Flow',
          flow_action: 'navigate',
          flow_action_payload: {
            screen: screen.id,
            data: {}
          }
        }
      }
    }

    return interactive
  }

  // Test the connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      const result = await response.json()
      return { success: response.ok, data: result }
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Upload flow JSON to existing flow ID
  async uploadFlowAssets(flowId: string, flowJson: any): Promise<any> {
    const url = `${this.baseUrl}/${flowId}/assets`
    
    // Create form data with flow JSON
    const formData = new FormData()
    const flowBlob = new Blob([JSON.stringify(flowJson, null, 2)], { type: 'application/json' })
    formData.append('file', flowBlob, 'flow.json')
    formData.append('asset_type', 'FLOW_JSON')

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
          // Don't set Content-Type, let browser set it for FormData
        },
        body: formData
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Flow upload error:', data)
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('Error uploading flow assets:', error)
      throw error
    }
  }

  // Publish flow for approval
  async publishFlow(flowId: string): Promise<any> {
    const url = `${this.baseUrl}/${flowId}/publish`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error('Flow publish error:', data)
        throw new Error(data.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('Error publishing flow:', error)
      throw error
    }
  }

  // Send custom flow with your current builder data
  async sendCustomFlowAfterHello(to: string, builderScreens: any[], flowName: string = 'Custom Flow'): Promise<any> {
    try {
      // Step 1: Send hello message first to initiate conversation
      console.log('📱 Step 1: Sending hello message to initiate conversation...')
      const helloResult = await this.sendHelloToStartFlow(to)
      console.log('✅ Hello message sent:', helloResult.messages?.[0]?.id)

      // Wait a bit for hello message to be delivered
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Step 2: Create flow
      console.log('🔧 Step 2: Creating flow on WhatsApp Business Account...')
      const createResult = await this.createFlow(flowName, 'SIGN_UP')
      console.log('✅ Flow created:', createResult.id)

      // Step 3: Convert builder data to WhatsApp format using the actual builder JSON utility
      const whatsappFlowData = buildFlowJson(builderScreens)
      console.log('🔧 Generated WhatsApp Flow JSON:', JSON.stringify(whatsappFlowData, null, 2))

      // Step 4: Upload flow JSON
      console.log('📤 Step 4: Uploading flow JSON...')
      const uploadResult = await this.uploadFlowAssets(createResult.id, whatsappFlowData)
      console.log('✅ Flow JSON uploaded')

      // Step 5: Send flow message (in draft mode)
      console.log('📨 Step 5: Sending flow message...')
      const flowToken = `token_${Date.now()}`
      const flowResult = await this.sendFlowMessage(to, createResult.id, flowToken, 'Complete Form')
      
      return {
        success: true,
        flowId: createResult.id,
        helloMessageId: helloResult.messages?.[0]?.id,
        flowMessageId: flowResult.messages?.[0]?.id,
        approvalInstructions: {
          step1: 'Go to Facebook Business Manager (business.facebook.com)',
          step2: 'Navigate to WhatsApp > Flows',
          step3: `Find your flow: "${flowName}"`,
          step4: 'Click "Submit for Review"',
          step5: 'Wait 24-72 hours for approval',
          step6: 'Once approved, flow will work for all users'
        },
        message: `✅ Custom flow sent successfully!\n\nFlow ID: ${createResult.id}\n\n⚠️ IMPORTANT: Flow is in DRAFT mode and only works for you and your test numbers. To make it live for all users, you must submit it for Facebook approval.`
      }

    } catch (error) {
      console.error('Error in custom flow process:', error)
      throw error
    }
  }



  // Send builder JSON as interactive message (bypasses flow creation API)
  async sendBuilderAsInteractiveMessage(to: string, builderScreens: any[]): Promise<any> {
    try {
      console.log('📱 Sending builder data as interactive message...')
      
      // Convert builder data to WhatsApp format using the actual builder
      const builderJson = buildFlowJson(builderScreens)
      console.log('🔧 Builder JSON:', JSON.stringify(builderJson, null, 2))
      
      // Create interactive message from builder data
      const firstScreen = builderScreens[0]
      if (!firstScreen) {
        throw new Error('No screens found in builder')
      }

      const interactiveMessage = {
        messaging_product: "whatsapp",
        to: to.replace(/\+/g, ''),
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "text",
            text: firstScreen.title || "Form Builder"
          },
          body: {
            text: `This form was built using the Flow Builder:\n\nScreens: ${builderScreens.length}\nElements: ${builderScreens.reduce((count, screen) => count + (screen.elements?.length || 0), 0)}\n\nJSON Preview:\n${JSON.stringify(builderJson, null, 2).substring(0, 200)}...`
          },
          footer: {
            text: "Built with Flow Builder"
          },
          action: {
            buttons: firstScreen.elements?.slice(0, 3).map((element: any, index: number) => ({
              type: "reply",
              reply: {
                id: `element_${index}`,
                title: (element.text || element.label || element.placeholder || `Element ${index + 1}`).substring(0, 20)
              }
            })) || [{
              type: "reply",
              reply: {
                id: "builder_default",
                title: "View Form"
              }
            }]
          }
        }
      }

      const response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interactiveMessage)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to send builder message: ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      console.log('✅ Builder message sent successfully:', result)
      return result
    } catch (error) {
      console.error('Error sending builder message:', error)
      throw error
    }
  }

  // Send a simple interactive button message (works without flow creation permissions)
  async sendSimpleInteractiveMessage(to: string = '918281348343', flowData: any): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`
    
    // Create simple button interactive message
    const payload = {
      messaging_product: 'whatsapp',
      to: to.replace(/\+/g, ''),
      type: 'interactive',
      interactive: {
        type: 'button',
        header: {
          type: 'text',
          text: flowData.title || 'Flow Preview'
        },
        body: {
          text: `This is a preview of your flow: "${flowData.title}"\n\nScreens: ${flowData.screens?.length || 0}\nElements: ${this.countFlowElements(flowData)}`
        },
        footer: {
          text: 'Built with WhatsApp Flow Builder'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'start_flow',
                title: '▶️ Start Flow'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'view_details',
                title: '📋 View Details'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'close',
                title: '❌ Close'
              }
            }
          ]
        }
      }
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('Interactive message error:', result)
        throw new Error(result.error?.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Interactive message sent successfully:', result)
      return result
    } catch (error) {
      console.error('Error sending interactive message:', error)
      throw error
    }
  }

  // Helper method to count flow elements
  private countFlowElements(flowData: any): number {
    let count = 0
    if (flowData.screens) {
      flowData.screens.forEach((screen: any) => {
        if (screen.children) {
          count += screen.children.length
        }
      })
    }
    return count
  }

  async getAllFlows() {
    try {
      console.log('Fetching all flows from business account...');
      
      // Try business account first
      let response = await fetch(`${this.baseUrl}/${this.businessAccountId}/flows`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Business account flow fetch failed, trying phone number ID...');
        
        // Try phone number ID as alternative
        response = await fetch(`${this.baseUrl}/${this.phoneNumberId}/flows`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch flows from both endpoints:', errorData);
        throw new Error(`Failed to fetch flows: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code || 'N/A'})`);
      }

      const result = await response.json();
      console.log('Flows retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error fetching flows:', error);
      throw error;
    }
  }

  async approveFlow(flowId: string) {
    try {
      console.log(`Submitting flow ${flowId} for approval...`);
      
      // First, get the flow details to check current status
      const flowDetails = await this.getFlowDetails(flowId);
      console.log('Current flow status:', flowDetails.status);
      
      if (flowDetails.status === 'PUBLISHED') {
        return {
          success: true,
          message: 'Flow is already published!',
          status: 'PUBLISHED'
        };
      }
      
      // Submit for review - this is the correct WhatsApp flow approval process
      const response = await fetch(`https://graph.facebook.com/v22.0/${flowId}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to submit flow for approval:', errorData);
        
        // Provide helpful error messages
        if (errorData.error?.code === 100) {
          return {
            success: false,
            message: 'Flow submission failed. This usually means:\n• Flow is incomplete or has validation errors\n• Flow is already submitted for review\n• Access token lacks required permissions\n\nTry checking the flow in Facebook Business Manager.',
            error: errorData
          };
        }
        
        throw new Error(`Failed to submit flow: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('Flow submitted for approval successfully:', result);
      
      return {
        success: true,
        message: 'Flow submitted for approval successfully! You will be notified when it is approved.',
        result: result
      };
    } catch (error) {
      console.error('Error submitting flow for approval:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error
      };
    }
  }

  async updateFlowStatus(flowId: string, status: string) {
    try {
      console.log(`Updating flow ${flowId} status to ${status}...`);
      
      const response = await fetch(`https://graph.facebook.com/v22.0/${flowId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update flow status:', errorData);
        throw new Error(`Failed to update flow status: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Flow status updated successfully:', result);
      return result;
    } catch (error) {
      console.error('Error updating flow status:', error);
      throw error;
    }
  }

  async getFlowDetails(flowId: string) {
    try {
      console.log(`Fetching flow details for ${flowId}...`);
      
      const response = await fetch(`https://graph.facebook.com/v22.0/${flowId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch flow details:', errorData);
        throw new Error(`Failed to fetch flow details: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Flow details retrieved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error fetching flow details:', error);
      throw error;
    }
  }

  async getFlowAsset(flowId: string) {
    try {
      console.log(`🔍 Fetching flow asset (JSON) for ${flowId}...`);
      
      // Method 1: Try to get assets directly
      console.log('📡 Attempting Method 1: Direct asset fetch...');
      let response = await fetch(`https://graph.facebook.com/v22.0/${flowId}/assets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      let method1Success = response.ok;
      console.log(`Method 1 result: ${response.ok ? '✅ Success' : '❌ Failed'} (Status: ${response.status})`);

      if (!response.ok) {
        console.warn('⚠️ Direct asset fetch failed, trying alternative method...');
        
        // Method 2: Try getting flow details with fields parameter
        console.log('📡 Attempting Method 2: Flow details with fields...');
        response = await fetch(`https://graph.facebook.com/v22.0/${flowId}?fields=id,name,status,categories,validation_errors,json_version,data_api_version,endpoint_uri,preview`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log(`Method 2 result: ${response.ok ? '✅ Success' : '❌ Failed'} (Status: ${response.status})`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to fetch flow asset:', errorData);
        
        // Provide more helpful error message
        if (errorData.error?.code === 100) {
          throw new Error('Invalid flow ID or insufficient permissions to access flow assets. Make sure your access token has the required permissions.');
        } else if (errorData.error?.code === 190) {
          throw new Error('Access token expired or invalid. Please check your WhatsApp API credentials in the .env file.');
        } else if (errorData.error?.code === 10) {
          throw new Error('Permission denied. Your access token may not have the required scopes to read flow assets.');
        }
        
        throw new Error(`Failed to fetch flow asset: ${errorData.error?.message || 'Unknown error'} (Code: ${errorData.error?.code || 'N/A'})`);
      }

      const result = await response.json();
      console.log('📦 Flow data retrieved:', JSON.stringify(result, null, 2));
      
      // Handle different response formats
      
      // Format 1: Direct asset data in 'data' array (from /assets endpoint)
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        console.log('✅ Format 1: Found asset data in array');
        const latestAsset = result.data[0];
        console.log('Latest asset:', latestAsset);
        
        // Check if there's a download_url in the asset
        if (latestAsset.download_url) {
          console.log('🔗 Found download URL in asset, fetching JSON...');
          try {
            const jsonData = await this.fetchFlowJsonFromDownloadUrl(latestAsset.download_url);
            if (jsonData && jsonData.screens) {
              console.log('✅ Successfully fetched flow JSON from asset download URL');
              return jsonData;
            }
          } catch (err) {
            console.warn('⚠️ Failed to fetch from asset download URL:', err);
          }
        }
        
        if (typeof latestAsset.asset === 'string') {
          try {
            const parsed = JSON.parse(latestAsset.asset);
            console.log('✅ Successfully parsed asset string');
            return parsed;
          } catch (e) {
            console.error('❌ Failed to parse asset string:', e);
            console.log('Returning unparsed asset');
            return latestAsset;
          }
        }
        
        if (latestAsset.asset && typeof latestAsset.asset === 'object') {
          console.log('✅ Asset is already an object');
          return latestAsset.asset;
        }
        
        console.log('⚠️ Returning raw asset data');
        return latestAsset;
      }
      
      // Format 2: Flow details with preview URL (from flow details endpoint)
      if (result.preview && result.preview.preview_url) {
        console.log('⚠️ Format 2: Flow has preview URL but no direct asset data');
        console.log('Preview URL:', result.preview.preview_url);
        
        // Return info indicating preview is available
        return {
          screens: [],
          version: result.json_version || '3.0',
          data_api_version: result.data_api_version || '3.0',
          _note: `This flow is published but asset data is not directly accessible via API. You can view it in WhatsApp Business Manager.`,
          _flowInfo: result
        };
      }
      
      // Format 3: Check if result itself contains screens
      if (result.screens && Array.isArray(result.screens)) {
        console.log('✅ Format 3: Found screens directly in result');
        return result;
      }
      
      // Format 4: Check if it's a flow details response without asset data
      if (result.id && result.status) {
        console.log('⚠️ Format 4: Got flow details but no asset/screen data');
        console.log('Flow status:', result.status);
        
        // Check if there's a download URL in the preview object
        if (result.preview?.download_url) {
          console.log('🔗 Found download URL, attempting to fetch flow JSON...');
          try {
            const jsonData = await this.fetchFlowJsonFromDownloadUrl(result.preview.download_url);
            if (jsonData && jsonData.screens) {
              console.log('✅ Successfully fetched flow JSON from download URL');
              return {
                ...jsonData,
                _flowInfo: result
              };
            }
          } catch (err) {
            console.warn('⚠️ Failed to fetch from download URL:', err);
          }
        }
        
        return {
          screens: [],
          version: result.json_version || 'N/A',
          data_api_version: result.data_api_version || 'N/A',
          _note: `Flow is ${result.status} but screen data is not available through the API. This is normal for published flows. You can view and edit screens in WhatsApp Business Manager.`,
          _flowInfo: result
        };
      }
      
      console.error('❌ Unexpected response format:', result);
      throw new Error('Flow asset data not found. The API response format is not recognized. This may be a published flow where screen data is not directly accessible.');
    } catch (error) {
      console.error('❌ Error fetching flow asset:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to load flow preview. Please ensure the flow has been properly configured with screens.');
    }
  }

  async fetchFlowJsonFromDownloadUrl(downloadUrl: string) {
    try {
      console.log('📥 Fetching flow JSON from download URL:', downloadUrl);
      
      // Get backend URL from environment or use default
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      
      // Strategy 1: Use backend proxy (bypasses CORS)
      try {
        console.log('🔄 Using backend proxy to fetch flow JSON...');
        const proxyUrl = `${backendUrl}/api/proxy/flow-json?url=${encodeURIComponent(downloadUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            console.log('✅ Flow JSON fetched successfully via proxy:', result.data);
            return result.data;
          }
        }
        console.warn('⚠️ Proxy fetch failed:', response.status);
      } catch (proxyError) {
        console.warn('⚠️ Proxy fetch error:', proxyError);
      }

      // Strategy 2: Try direct fetch with authorization header
      try {
        console.log('🔑 Attempting direct fetch with authorization header...');
        const response = await fetch(downloadUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          },
          mode: 'cors'
        });

        if (response.ok) {
          const jsonData = await response.json();
          console.log('✅ Flow JSON fetched successfully with auth:', jsonData);
          return jsonData;
        }
        console.warn('⚠️ Auth fetch failed:', response.status);
      } catch (authError) {
        console.warn('⚠️ Auth fetch error:', authError);
      }

      // Strategy 3: Try without authorization (signed URLs don't need auth)
      try {
        console.log('🔓 Attempting without authorization header...');
        const response = await fetch(downloadUrl, {
          method: 'GET',
          mode: 'cors'
        });

        if (response.ok) {
          const jsonData = await response.json();
          console.log('✅ Flow JSON fetched successfully without auth:', jsonData);
          return jsonData;
        }
        console.warn('⚠️ No-auth fetch failed:', response.status);
      } catch (noAuthError) {
        console.warn('⚠️ No-auth fetch error:', noAuthError);
      }

      throw new Error('All fetch strategies failed. The download URL may have CORS restrictions or may have expired. Make sure your backend server is running.');
    } catch (error) {
      console.error('❌ Error fetching flow JSON from download URL:', error);
      throw error;
    }
  }

  async createFlowDirect(flowName: string, flowJson: any) {
    try {
      console.log(`Creating flow directly: ${flowName}`);
      console.log('Flow JSON:', JSON.stringify(flowJson, null, 2));
      
      // Step 1: Create the flow structure first
      const createPayload = {
        name: flowName,
        categories: ["SIGN_UP"]
      };

      console.log('Creating flow structure...');
      const createResponse = await fetch(`https://graph.facebook.com/v22.0/${this.businessAccountId}/flows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPayload)
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Failed to create flow structure:', errorData);
        throw new Error(`Failed to create flow: ${JSON.stringify(errorData)}`);
      }

      const flowResult = await createResponse.json();
      console.log('Flow structure created:', flowResult);

      // Step 2: Upload the flow JSON as assets
      console.log('Uploading flow assets...');
      const uploadPayload = {
        file: flowJson,
        name: flowName
      };

      const response = await fetch(`https://graph.facebook.com/v22.0/${flowResult.id}/assets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to upload flow assets:', errorData);
        throw new Error(`Failed to upload flow assets: ${JSON.stringify(errorData)}`);
      }

      const uploadResult = await response.json();
      console.log('Flow assets uploaded successfully:', uploadResult);
      
      // Return the original flow creation result with the flow ID
      return flowResult;
    } catch (error) {
      console.error('Error creating flow directly:', error);
      throw error;
    }
  }

  async updateFlowWithBuilderJson(flowId: string, flowJson: any, flowName: string = "Updated Flow") {
    // NOTE: Asset upload requires special permissions
    // Instead, we'll just return the JSON for manual upload in WhatsApp Manager
    console.log(`✏️ Preparing JSON for flow ${flowId}...`);
    console.log('📋 Generated JSON:', JSON.stringify(flowJson, null, 2));
    
    // Return success with the JSON for manual upload
    return {
      success: true,
      flowId: flowId,
      flowName: flowName,
      generatedJson: flowJson,
      message: 'JSON generated successfully. Please upload manually in WhatsApp Business Manager.'
    };
  }

  async sendFlowActivationMessage(phoneNumber: string, flowId: string, messageText: string = "Please complete this form") {
    try {
      console.log(`Sending flow activation message for flow ${flowId} to ${phoneNumber}`);
      
      // First check if the flow exists and get its status
      const flowDetails = await this.getFlowDetails(flowId);
      if (!flowDetails) {
        throw new Error(`Flow ${flowId} not found`);
      }
      
      const isPublished = flowDetails.status === 'PUBLISHED';
      const mode = isPublished ? 'published' : 'draft';
      
      console.log(`Flow ${flowId} status: ${flowDetails.status}, using mode: ${mode}`);
      
      const payload = {
        messaging_product: "whatsapp",
        to: phoneNumber.replace(/\+/g, ''), // Remove + prefix
        type: "interactive",
        interactive: {
          type: "flow",
          header: {
            type: "text",
            text: "Complete the Form"
          },
          body: {
            text: messageText
          },
          footer: {
            text: "Built with Flow Builder"
          },
          action: {
            name: "flow",
            parameters: {
              flow_message_version: "3",
              flow_token: `token_${Date.now()}`,
              flow_id: flowId,
              flow_cta: "Start",
              mode: mode // Use 'published' for published flows, 'draft' for draft flows
            }
          }
        }
      };

      console.log('Flow message payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(`https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send flow activation message:', errorData);
        throw new Error(`Failed to send flow message: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      console.log('Flow activation message sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending flow activation message:', error);
      throw error;
    }
  }

}

// Create a singleton instance
// Create a singleton instance using environment variables
export const whatsAppService = new WhatsAppService()

// Helper functions for flow conversion
export const convertFlowToWhatsAppFormat = (screens: any[]) => {
  return {
    version: '3.0',
    screens: screens.map(screen => ({
      id: screen.id,
      title: screen.title,
      terminal: screen.terminal || false,
      layout: {
        type: 'SingleColumnLayout',
        children: screen.elements.map((element: any) => ({
          type: element.type,
          ...element
        }))
      }
    }))
  }
}