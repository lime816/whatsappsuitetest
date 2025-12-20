import { WhatsAppService } from './whatsappService'
import { backendApiService } from './backendApiService'
import { buildFlowJson } from './jsonBuilder'
import { ErrorHandler } from './errorHandler'
import type { Screen } from '../types'

export interface FlowCreationOptions {
  flowName: string
  screens: Screen[]
  customMessage: string
  autoCreateTrigger?: boolean
}

export interface FlowSendOptions {
  phoneNumber: string
  flowId: string
  message: string
}

export class FlowService {
  private whatsappService: WhatsAppService
  private errorHandler: ErrorHandler

  constructor(errorHandler: ErrorHandler) {
    this.whatsappService = new WhatsAppService()
    this.errorHandler = errorHandler
  }

  /**
   * Consolidated flow sending function - replaces handleSendFlowMessage, handleSendSelectedFlow, handleSendActiveFlow
   */
  async sendFlowToUser(options: FlowSendOptions): Promise<boolean> {
    const { phoneNumber, flowId, message } = options

    if (!phoneNumber.trim()) {
      this.errorHandler.handleWarning('Please enter a phone number', 'Phone Number Required')
      return false
    }

    if (!flowId) {
      this.errorHandler.handleWarning('Please select a flow', 'No Flow Selected')
      return false
    }

    try {
      const result = await this.whatsappService.sendFlowActivationMessage(
        phoneNumber,
        flowId,
        message || 'Please complete this form to continue.'
      )

      this.errorHandler.handleSuccess(
        `Flow sent successfully!\nMessage ID: ${result.messages[0].id}\nSent to: +${phoneNumber}`,
        'Flow Activation Sent',
        8000
      )

      return true
    } catch (error) {
      this.errorHandler.handleApiError(error, {
        operation: 'Send Flow',
        fallbackMessage: 'Make sure:\n• The flow is approved/published\n• Phone number is correct\n• Access token has proper permissions',
        duration: 10000
      })
      return false
    }
  }

  /**
   * Create flow with automatic trigger registration
   */
  async createFlow(options: FlowCreationOptions): Promise<{ success: boolean; flowId?: string }> {
    const { flowName, screens, customMessage, autoCreateTrigger = true } = options

    if (!flowName.trim()) {
      this.errorHandler.handleWarning('Please enter a flow name', 'Flow Name Required')
      return { success: false }
    }

    if (screens.length === 0) {
      this.errorHandler.handleWarning('Please create at least one screen', 'No Screens Found')
      return { success: false }
    }

    try {
      const builderJson = buildFlowJson(screens)
      console.log('📋 Creating flow with JSON:', JSON.stringify(builderJson, null, 2))

      const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN
      const businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID

      // Create flow structure
      const createResponse = await fetch(
        `https://graph.facebook.com/v22.0/${businessAccountId}/flows`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: flowName.trim(),
            categories: ['SIGN_UP']
          })
        }
      )

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error?.message || `HTTP ${createResponse.status}`)
      }

      const flowResult = await createResponse.json()
      console.log('✅ Flow created:', flowResult.id)

      // Auto-create webhook trigger
      if (autoCreateTrigger && flowResult.id) {
        try {
          await backendApiService.registerFlow(
            flowResult.id,
            flowName.trim(),
            customMessage.trim() || 'Please complete this form to continue.',
            true
          )
          console.log('🎯 Auto-created webhook trigger')
          this.errorHandler.handleSuccess(
            `Automatic trigger created for keyword: "${customMessage}"`,
            'Webhook Trigger Created',
            3000
          )
        } catch (triggerError) {
          console.error('Failed to auto-create trigger:', triggerError)
          this.errorHandler.handleWarning(
            `Flow created but couldn't create webhook trigger: ${triggerError instanceof Error ? triggerError.message : 'Unknown error'}`,
            'Trigger Creation Failed',
            5000
          )
        }
      }

      this.errorHandler.handleSuccess(
        `Flow created successfully!\nFlow ID: ${flowResult.id}\nStatus: DRAFT\n\n📋 Check console for generated JSON`,
        'Flow Created',
        8000
      )

      return { success: true, flowId: flowResult.id }
    } catch (error) {
      this.errorHandler.handleApiError(error, {
        operation: 'Create Flow',
        fallbackMessage: '📋 Check console for generated JSON\n\nNext Steps:\n1. Copy JSON from console\n2. Go to WhatsApp Business Manager\n3. Upload JSON manually',
        duration: 10000
      })
      return { success: false }
    }
  }

  /**
   * Get all flows from WhatsApp
   */
  async getAllFlows(): Promise<any[]> {
    try {
      const result = await this.whatsappService.getAllFlows()
      return result.data || []
    } catch (error) {
      this.errorHandler.handleApiError(error, {
        operation: 'Get All Flows'
      })
      return []
    }
  }

  /**
   * Approve/publish a flow
   */
  async approveFlow(flowId: string): Promise<boolean> {
    try {
      const result = await this.whatsappService.approveFlow(flowId)
      
      if (result.success) {
        this.errorHandler.handleSuccess(
          `${result.message}\n\nFlow ID: ${flowId}\n\n📋 WhatsApp will review (24-72 hours)`,
          'Flow Submitted for Approval',
          10000
        )
        return true
      } else {
        this.errorHandler.handleWarning(
          `${result.message}\n\nFlow ID: ${flowId}`,
          'Approval Request Issue',
          10000
        )
        return false
      }
    } catch (error) {
      this.errorHandler.handleApiError(error, {
        operation: 'Approve Flow',
        fallbackMessage: 'Try checking your flow in Facebook Business Manager'
      })
      return false
    }
  }

  /**
   * Get flow details
   */
  async getFlowDetails(flowId: string): Promise<any> {
    try {
      const result = await this.whatsappService.getFlowDetails(flowId)
      
      const details = `
📋 Flow Details:
ID: ${result.id}
Name: ${result.name || 'Unnamed'}
Status: ${result.status}
Categories: ${result.categories?.join(', ') || 'None'}
Created: ${new Date(result.created_time * 1000).toLocaleString()}
Updated: ${new Date(result.updated_time * 1000).toLocaleString()}
Preview URL: ${result.preview_url || 'Not available'}
      `.trim()
      
      this.errorHandler.handleInfo(details, 'Flow Details', 10000)
      return result
    } catch (error) {
      this.errorHandler.handleApiError(error, {
        operation: 'Get Flow Details'
      })
      return null
    }
  }
}
