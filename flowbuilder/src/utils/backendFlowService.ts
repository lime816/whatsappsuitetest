// New service to handle backend flow operations
import { Screen } from '../types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

if (!BACKEND_URL) {
  throw new Error('VITE_BACKEND_URL environment variable is required')
}

export interface BackendFlowResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export interface FlowData {
  screens: Screen[]
  flowName: string
  flowId?: string
}

class BackendFlowService {
  private baseUrl: string

  constructor() {
    this.baseUrl = BACKEND_URL
  }

  /**
   * Create or update flow with backend JSON generation
   */
  async createOrUpdateFlow(flowData: FlowData): Promise<BackendFlowResponse> {
    try {
      console.log('📤 Sending flow to backend for JSON generation:', {
        flowName: flowData.flowName,
        flowId: flowData.flowId,
        screenCount: flowData.screens.length
      })

      const response = await fetch(`${this.baseUrl}/api/flows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flowData)
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Backend flow creation successful:', result)
      return result

    } catch (error) {
      console.error('❌ Backend flow creation failed:', error)
      throw error
    }
  }

  /**
   * Update existing flow
   */
  async updateFlow(flowId: string, flowData: Omit<FlowData, 'flowId'>): Promise<BackendFlowResponse> {
    try {
      console.log('📤 Updating flow on backend:', { flowId, flowName: flowData.flowName })

      const response = await fetch(`${this.baseUrl}/api/flows/${flowId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flowData)
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Backend flow update successful:', result)
      return result

    } catch (error) {
      console.error('❌ Backend flow update failed:', error)
      throw error
    }
  }

  /**
   * Get flow with generated JSON
   */
  async getFlow(flowId: string): Promise<BackendFlowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/flows/${flowId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result

    } catch (error) {
      console.error('❌ Backend flow retrieval failed:', error)
      throw error
    }
  }

  /**
   * Get all flows
   */
  async getAllFlows(status?: string): Promise<BackendFlowResponse> {
    try {
      const url = new URL(`${this.baseUrl}/api/flows`)
      if (status) {
        url.searchParams.append('status', status)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result

    } catch (error) {
      console.error('❌ Backend flows retrieval failed:', error)
      throw error
    }
  }

  /**
   * Generate JSON without saving (for preview)
   */
  async generateJson(screens: Screen[]): Promise<BackendFlowResponse> {
    try {
      console.log('🔨 Generating JSON on backend:', { screenCount: screens.length })

      const response = await fetch(`${this.baseUrl}/api/flows/generate-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ screens })
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ Backend JSON generation successful')
      return result

    } catch (error) {
      console.error('❌ Backend JSON generation failed:', error)
      throw error
    }
  }

  /**
   * Manually sync flow with WhatsApp
   */
  async syncWithWhatsApp(flowId: string): Promise<BackendFlowResponse> {
    try {
      console.log('🔄 Syncing flow with WhatsApp:', { flowId })

      const response = await fetch(`${this.baseUrl}/api/flows/${flowId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log('✅ WhatsApp sync successful:', result)
      return result

    } catch (error) {
      console.error('❌ WhatsApp sync failed:', error)
      throw error
    }
  }

  /**
   * Delete flow
   */
  async deleteFlow(flowId: string): Promise<BackendFlowResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/flows/${flowId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: BackendFlowResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return result

    } catch (error) {
      console.error('❌ Backend flow deletion failed:', error)
      throw error
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`)
      return await response.json()
    } catch (error) {
      console.error('❌ Backend health check failed:', error)
      return { status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Export singleton instance
export const backendFlowService = new BackendFlowService()
export default BackendFlowService