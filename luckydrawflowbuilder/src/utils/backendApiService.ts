// API service for communicating with the Railway deployed backend webhook server

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error('VITE_BACKEND_URL environment variable is required for Railway backend connection');
}

console.log('🔗 Railway Backend URL:', BACKEND_URL);

export interface FlowTrigger {
  id: string
  keyword: string
  flowId: string
  message?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BackendResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

class BackendApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = BACKEND_URL
  }

  // Trigger Management
  async getAllTriggers(): Promise<FlowTrigger[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result: BackendResponse<FlowTrigger[]> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch triggers')
      }
      
      return result.data || []
    } catch (error) {
      console.error('Error fetching triggers:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Backend server is not running or not accessible')
      }
      throw error
    }
  }

  async createTrigger(trigger: Omit<FlowTrigger, 'id'>): Promise<FlowTrigger> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trigger)
      })
      
      const result: BackendResponse<FlowTrigger> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create trigger')
      }
      
      return result.data!
    } catch (error) {
      console.error('Error creating trigger:', error)
      throw error
    }
  }

  async updateTrigger(id: string, updates: Partial<FlowTrigger>): Promise<FlowTrigger> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      const result: BackendResponse<FlowTrigger> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update trigger')
      }
      
      return result.data!
    } catch (error) {
      console.error('Error updating trigger:', error)
      throw error
    }
  }

  async deleteTrigger(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers/${id}`, {
        method: 'DELETE'
      })
      
      const result: BackendResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete trigger')
      }
    } catch (error) {
      console.error('Error deleting trigger:', error)
      throw error
    }
  }

  async toggleTrigger(id: string, isActive: boolean): Promise<FlowTrigger> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      })
      
      const result: BackendResponse<FlowTrigger> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to toggle trigger')
      }
      
      return result.data!
    } catch (error) {
      console.error('Error toggling trigger:', error)
      throw error
    }
  }

  async testTrigger(message: string, phoneNumber: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/triggers/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, phoneNumber })
      })
      
      const result: BackendResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to test trigger')
      }
      
      return result.data
    } catch (error) {
      console.error('Error testing trigger:', error)
      throw error
    }
  }

  // WhatsApp Integration
  async testWhatsAppConnection(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/test`)
      const result: BackendResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'WhatsApp connection test failed')
      }
      
      return result.data
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error)
      throw error
    }
  }

  async sendFlow(phoneNumber: string, flowId: string, message?: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/send-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber, flowId, message })
      })
      
      const result: BackendResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send flow')
      }
      
      return result.data
    } catch (error) {
      console.error('Error sending flow:', error)
      throw error
    }
  }

  async getWhatsAppConfig(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/config`)
      const result: BackendResponse<any> = await response.json()
      
      return result.data || {}
    } catch (error) {
      console.error('Error getting WhatsApp config:', error)
      return {}
    }
  }

  async registerFlow(flowId: string, flowName: string, activationMessage: string, autoCreateTrigger: boolean = true): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/whatsapp/register-flow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          flowId, 
          flowName, 
          activationMessage,
          autoCreateTrigger
        })
      })
      
      const result: BackendResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to register flow')
      }
      
      return result.data
    } catch (error) {
      console.error('Error registering flow:', error)
      throw error
    }
  }

  // Health Check
  async checkHealth(): Promise<any> {
    console.log(`🔗 Checking health at: ${this.baseUrl}/health`)
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })
      
      console.log('📡 Health check response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('📊 Health check data:', data)
      return { ...data, status: data.status || 'healthy', isConnected: true }
    } catch (error) {
      console.error('❌ Health check failed:', error)
      return { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Backend not accessible',
        isConnected: false
      }
    }
  }

  // Get webhook status
  getWebhookStatus(): {
    isConfigured: boolean
    webhookUrl: string
    backendUrl: string
    isBackendRunning: boolean
  } {
    return {
      isConfigured: true, // Backend handles configuration
      webhookUrl: `${this.baseUrl}/webhook`,
      backendUrl: this.baseUrl,
      isBackendRunning: false // Will be updated by health check
    }
  }
}

// Export singleton instance
export const backendApiService = new BackendApiService()
export default BackendApiService