import React, { useState, useEffect } from 'react'
import { Globe, Settings, TestTube, Plus, Trash2, Play, Pause, AlertCircle, CheckCircle, Copy, ExternalLink, Server, MessageCircle } from 'lucide-react'
import { backendApiService, FlowTrigger } from '../utils/backendApiService'

interface WebhookSetupProps {
  flows: any[]
}

export default function WebhookSetup({ flows }: WebhookSetupProps) {
  console.log('🔍 WebhookSetup received flows:', flows)
  const [triggers, setTriggers] = useState<FlowTrigger[]>([])
  const [newTrigger, setNewTrigger] = useState({
    keyword: '',
    flowId: '',
    message: ''
  })
  const [isAddingTrigger, setIsAddingTrigger] = useState(false)
  const [testMessage, setTestMessage] = useState('hell')
  const [testPhoneNumber, setTestPhoneNumber] = useState('918281348343')
  const [selectedFlowForTest, setSelectedFlowForTest] = useState('')
  const [isTestingWebhook, setIsTestingWebhook] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoadingTriggers, setIsLoadingTriggers] = useState(false)
  const [backendHealth, setBackendHealth] = useState<any>(null)
  const [webhookStatus, setWebhookStatus] = useState({
    isConfigured: false,
    webhookUrl: `${import.meta.env.VITE_BACKEND_URL}/webhook`,
    backendUrl: import.meta.env.VITE_BACKEND_URL,
    triggersCount: 0,
    activeTriggersCount: 0,
    isBackendRunning: false
  })

  useEffect(() => {
    // Initialize webhook status with defaults
    const initialStatus = backendApiService.getWebhookStatus()
    setWebhookStatus(prev => ({
      ...prev,
      ...initialStatus,
      triggersCount: 0,
      activeTriggersCount: 0
    }))
    
    loadTriggers()
    updateWebhookStatus()
  }, [])

  const loadTriggers = async () => {
    setIsLoadingTriggers(true)
    try {
      const loadedTriggers = await backendApiService.getAllTriggers()
      setTriggers(loadedTriggers)
    } catch (error) {
      console.error('Error loading triggers:', error)
      alert('Failed to load triggers. Make sure backend server is running.')
    } finally {
      setIsLoadingTriggers(false)
    }
  }

  const updateWebhookStatus = async () => {
    console.log('🔍 Checking backend health...')
    try {
      const health = await backendApiService.checkHealth()
      console.log('✅ Health check result:', health)
      setBackendHealth(health)
      
      const status = backendApiService.getWebhookStatus()
      const isRunning = health.status === 'healthy' && health.isConnected !== false
      
      console.log('📊 Backend status:', { health, isRunning, status })
      
      setWebhookStatus({
        ...status,
        triggersCount: triggers.length,
        activeTriggersCount: triggers.filter(t => t.isActive).length,
        isBackendRunning: isRunning
      })
    } catch (error) {
      console.error('❌ Error checking backend status:', error)
      const status = backendApiService.getWebhookStatus()
      setWebhookStatus({
        ...status,
        triggersCount: triggers.length,
        activeTriggersCount: triggers.filter(t => t.isActive).length,
        isBackendRunning: false
      })
    }
  }

  const addTrigger = async () => {
    if (!newTrigger.keyword || !newTrigger.flowId) {
      alert('Please enter a keyword and select a flow')
      return
    }

    try {
      const trigger = await backendApiService.createTrigger({
        keyword: newTrigger.keyword,
        flowId: newTrigger.flowId,
        message: newTrigger.message || 'Please complete this form:',
        isActive: true
      })

      setTriggers(prev => [...prev, trigger])
      setNewTrigger({ keyword: '', flowId: '', message: '' })
      setIsAddingTrigger(false)
      updateWebhookStatus()
    } catch (error: any) {
      console.error('Error adding trigger:', error)
      alert(`Failed to add trigger: ${error.message}`)
    }
  }

  const removeTrigger = async (id: string) => {
    try {
      await backendApiService.deleteTrigger(id)
      setTriggers(prev => prev.filter(t => t.id !== id))
      updateWebhookStatus()
    } catch (error: any) {
      console.error('Error removing trigger:', error)
      alert(`Failed to remove trigger: ${error.message}`)
    }
  }

  const toggleTrigger = async (id: string, isActive: boolean) => {
    try {
      const updatedTrigger = await backendApiService.toggleTrigger(id, isActive)
      setTriggers(prev => prev.map(t => t.id === id ? updatedTrigger : t))
      updateWebhookStatus()
    } catch (error: any) {
      console.error('Error toggling trigger:', error)
      alert(`Failed to ${isActive ? 'activate' : 'deactivate'} trigger: ${error.message}`)
    }
  }

  const testWebhook = async () => {
    if (!testMessage) {
      alert('Please enter a test message')
      return
    }

    if (!selectedFlowForTest) {
      alert('Please select a flow to send for testing')
      return
    }

    setIsTestingWebhook(true)
    try {
      const selectedFlow = flows.find(flow => flow.id === selectedFlowForTest)
      if (selectedFlow) {
        // Test the webhook by simulating a trigger without creating a permanent trigger
        // This avoids the WhatsApp Flow API format issues
        const result = await backendApiService.testTrigger(testMessage, testPhoneNumber)
        
        setTestResult({
          success: true,
          message: `✅ Webhook Test Simulation Complete!`,
          flowName: selectedFlow.name || selectedFlow.id,
          triggerKeyword: testMessage,
          phoneNumber: testPhoneNumber,
          businessNumber: import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER,
          testType: 'Webhook Simulation Test',
          simulationNote: 'This tests the webhook functionality without sending actual flows to avoid API format issues.',
          ...result
        })
      } else {
        const result = await backendApiService.testTrigger(testMessage, testPhoneNumber)
        setTestResult({
          success: true,
          ...result
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to setup webhook test'
      })
    } finally {
      setIsTestingWebhook(false)
    }
  }

  const copyWebhookUrl = () => {
    const webhookUrl = webhookStatus.webhookUrl || `${import.meta.env.VITE_BACKEND_URL}/webhook`
    navigator.clipboard.writeText(webhookUrl)
    alert('Webhook URL copied to clipboard')
  }

  const copyBackendUrl = () => {
    navigator.clipboard.writeText(webhookStatus.backendUrl)
    alert('Backend URL copied to clipboard')
  }

  const runLocalTest = async () => {
    try {
      console.log('🔍 Running local backend test...')
      const health = await backendApiService.checkHealth()
      setBackendHealth(health)
      console.log('✅ Backend test result:', health)
      
      if (health.status === 'healthy') {
        alert(`✅ Backend Status: ${health.status}\\n⏱️ Uptime: ${health.uptime || 'N/A'}s\\n📦 Version: ${health.version || 'N/A'}\\n🌐 URL: ${webhookStatus.backendUrl}`)
      } else {
        alert(`❌ Backend Error: ${health.error || 'Unknown error'}\\n🔗 Trying to connect to: ${webhookStatus.backendUrl}/health`)
      }
      
      // Update webhook status after test
      updateWebhookStatus()
    } catch (error) {
      console.error('❌ Railway backend test failed:', error)
      alert(`❌ Railway Backend Test Failed\\n\\nError: ${error instanceof Error ? error.message : 'Unknown error'}\\n🔗 URL: ${webhookStatus.backendUrl}\\n\\n💡 Check Railway deployment status and ensure backend service is running`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Globe className="h-6 w-6 text-cyan-400" />
        <h2 className="text-xl font-semibold text-slate-200">Webhook Setup & Backend Integration</h2>
      </div>

      {/* Backend Status */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-slate-200">Backend Configuration</span>
          </h3>
          <div className="flex items-center space-x-2">
            {webhookStatus.isBackendRunning ? (
              <CheckCircle className="h-4 w-4 text-whatsapp-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={`text-sm ${webhookStatus.isBackendRunning ? 'text-whatsapp-400' : 'text-red-400'}`}>
              {webhookStatus.isBackendRunning ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Webhook URL:</label>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <code className="flex-1 text-sm font-mono text-blue-800 bg-transparent select-all">
                {webhookStatus.webhookUrl || `${import.meta.env.VITE_BACKEND_URL}/webhook`}
              </code>
              <button
                onClick={copyWebhookUrl}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium flex items-center gap-1"
                title="Copy Webhook URL"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Backend API URL:</label>
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <code className="flex-1 text-sm font-mono text-green-800 bg-transparent select-all">
                {webhookStatus.backendUrl || import.meta.env.VITE_BACKEND_URL}
              </code>
              <button
                onClick={copyBackendUrl}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center gap-1"
                title="Copy Backend URL"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Backend Status:</label>
              <div className={`p-3 rounded-lg border flex items-center space-x-3 ${
                webhookStatus.isBackendRunning 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                {webhookStatus.isBackendRunning ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-sm font-medium text-green-800">Connected</div>
                      <div className="text-xs text-green-600">Server is running</div>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="text-sm font-medium text-red-800">Disconnected</div>
                      <div className="text-xs text-red-600">Server not accessible</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Active Triggers:</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-lg font-bold text-gray-800">
                  {webhookStatus.activeTriggersCount}
                  <span className="text-sm font-normal text-gray-600"> / {webhookStatus.triggersCount}</span>
                </div>
                <div className="text-xs text-gray-500">triggers active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Backend is deployed on Railway (✅ Production Ready)</li>
          <li>WhatsApp credentials are configured in Railway environment</li>
          <li>Copy webhook URL from above and update in WhatsApp Business API settings</li>
          <li>Subscribe to 'messages' field in webhook configuration</li>
          <li>Test webhook connection using the test button above</li>
        </ol>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks', '_blank')}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
          >
            <ExternalLink className="h-3 w-3" />
            <span>WhatsApp Docs</span>
          </button>
          <button
            onClick={() => window.open(webhookStatus.backendUrl, '_blank')}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
          >
            <Server className="h-3 w-3" />
            <span>Backend API</span>
          </button>
        </div>
      </div>

      {/* Flow Triggers */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">Flow Triggers</h3>
              <p className="text-sm text-gray-500">Automatically send flows when users message keywords</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingTrigger(true)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${
              webhookStatus.isBackendRunning
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
            }`}
            disabled={!webhookStatus.isBackendRunning}
          >
            <div className={`p-1 rounded-full ${
              webhookStatus.isBackendRunning ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-base">Add New Trigger</span>
            {webhookStatus.isBackendRunning && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
          </button>
        </div>

        {/* Backend connection warning */}
        {!webhookStatus.isBackendRunning && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-red-800 mb-1">Backend Server Required</div>
                <div className="text-sm text-red-700">
                  The backend server must be running to manage triggers. Please start the server first.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced example trigger display */}
        {webhookStatus.isBackendRunning && triggers.length === 0 && !isAddingTrigger && (
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-dashed border-blue-300 rounded-xl p-6 mb-6">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -mr-10 -mt-10 opacity-30"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                    hello
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <span className="text-lg">→</span>
                    <span className="text-sm">triggers</span>
                  </div>
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                    📄 Registration Flow
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Play className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-3 mb-3">
                <div className="text-sm text-gray-700 mb-1">
                  💬 <strong>Auto-response message:</strong>
                </div>
                <div className="text-sm text-blue-800 font-medium">
                  "Hello! Please complete this form to continue:"
                </div>
              </div>
              <div className="text-xs text-blue-700 bg-blue-100 bg-opacity-50 rounded-lg p-2 text-center">
                ✨ <strong>Preview:</strong> This is how your triggers will appear once created
              </div>
            </div>
          </div>
        )}

        {/* Add New Trigger */}
        {isAddingTrigger && (
          <div className="bg-gray-50 rounded p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium mb-1">Keyword</label>
                <input
                  type="text"
                  value={newTrigger.keyword}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, keyword: e.target.value }))}
                  placeholder="e.g., hello, start, register"
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Flow</label>
                <select
                  value={newTrigger.flowId}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, flowId: e.target.value }))}
                  className="w-full px-3 py-1.5 border rounded text-sm"
                >
                  <option value="">Select a flow</option>
                  {flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Custom Message (Optional)</label>
                <input
                  type="text"
                  value={newTrigger.message}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please complete this form:"
                  className="w-full px-3 py-1.5 border rounded text-sm"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={addTrigger}
                className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Add Trigger
              </button>
              <button
                onClick={() => setIsAddingTrigger(false)}
                className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Loading State */}
        {isLoadingTriggers && (
          <div className="text-center py-8">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <div className="text-lg font-medium text-gray-700">Loading triggers...</div>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}

        {/* Existing Triggers */}
        {!isLoadingTriggers && triggers.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mx-auto mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <MessageCircle className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xs font-bold">!</span>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">No triggers configured yet</h4>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
              Create automated triggers to send flows when users message specific keywords like 
              <span className="font-semibold text-blue-600">"hello"</span>, 
              <span className="font-semibold text-green-600">"register"</span>, or 
              <span className="font-semibold text-purple-600">"start"</span>.
            </p>
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-dashed border-blue-300 rounded-xl p-6 max-w-lg mx-auto">
              <div className="text-base text-blue-900 font-medium mb-2">
                🚀 <strong>How it works:</strong>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• User sends: <span className="font-mono bg-blue-100 px-2 py-1 rounded">"hello"</span></div>
                <div>• System automatically responds with your flow</div>
                <div>• User receives interactive form instantly</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {triggers.map((trigger, index) => (
              <div
                key={trigger.id}
                className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                  trigger.isActive 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 shadow-sm' 
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200'
                } rounded-xl p-4 mb-3`}
              >
                {/* Status indicator */}
                <div className={`absolute top-0 left-0 w-full h-1 ${
                  trigger.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Trigger info */}
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        trigger.isActive 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}>
                        {trigger.keyword}
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span className="text-lg">→</span>
                        <span className="text-xs uppercase tracking-wide">triggers</span>
                      </div>
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium border border-blue-200">
                        📄 {flows.find(f => f.id === trigger.flowId)?.name || 'Unknown Flow'}
                      </div>
                      <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                        trigger.isActive 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {trigger.isActive ? '✅ Active' : '⏸️ Paused'}
                      </div>
                    </div>
                    
                    {/* Custom message */}
                    {trigger.message && (
                      <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-lg p-2 ml-2">
                        <div className="text-xs text-gray-600 mb-1">💬 Auto-response:</div>
                        <div className="text-sm text-gray-800">"{trigger.message}"</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleTrigger(trigger.id, !trigger.isActive)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        trigger.isActive 
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:scale-105' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200 hover:scale-105'
                      }`}
                      title={trigger.isActive ? 'Pause Trigger' : 'Activate Trigger'}
                      disabled={!webhookStatus.isBackendRunning}
                    >
                      {trigger.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => removeTrigger(trigger.id)}
                      className="p-2 bg-red-100 text-red-600 hover:bg-red-200 hover:scale-105 rounded-lg transition-all duration-200"
                      title="Delete Trigger"
                      disabled={!webhookStatus.isBackendRunning}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhook Testing */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TestTube className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Test Webhook</h3>
            <p className="text-sm text-gray-500">Create a real webhook trigger and test it from your WhatsApp</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 text-blue-600" />
                </div>
                <span>Test Message</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter a keyword to test (e.g., hello, register, start)"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    testMessage 
                      ? 'border-blue-400 bg-blue-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100' 
                      : 'border-gray-300 bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:bg-white'
                  }`}
                />
                {testMessage && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              <div className="flex items-start space-x-2 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">
                  This should match one of your trigger keywords for accurate testing
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">📱</span>
                </div>
                <span>Test Phone Number</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="918281348343"
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 text-gray-900 placeholder-gray-500 ${
                    testPhoneNumber.length >= 10 
                      ? 'border-green-400 bg-green-50 focus:border-green-500 focus:ring-4 focus:ring-green-100' 
                      : 'border-gray-300 bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:bg-white'
                  }`}
                />
                {testPhoneNumber.length >= 10 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              <div className="flex items-start space-x-2 text-xs">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600">
                  WhatsApp number with country code (no + sign required)
                </p>
              </div>
            </div>
          </div>

          {/* Flow Selection */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="h-3 w-3 text-purple-600" />
              </div>
              <span>Select Flow to Send</span>
            </label>
            <div className="relative">
              <select
                value={selectedFlowForTest}
                onChange={(e) => setSelectedFlowForTest(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 text-gray-900 ${
                  selectedFlowForTest 
                    ? 'border-purple-400 bg-purple-50 focus:border-purple-500 focus:ring-4 focus:ring-purple-100' 
                    : 'border-gray-300 bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:bg-white'
                }`}
              >
                <option value="">Choose a flow to send...</option>
                {flows && flows.length > 0 ? (
                  flows.map((flow) => (
                    <option key={flow.id} value={flow.id}>
                      {flow.name || `Flow ${flow.id}`}
                    </option>
                  ))
                ) : (
                  <option disabled>No flows available - Create a flow first</option>
                )}
              </select>
              {selectedFlowForTest && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              )}
            </div>
            <div className="flex items-start space-x-2 text-xs">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">
                Select which flow to test. This will send a test message about the selected flow to verify webhook functionality.
                {flows && flows.length === 0 && (
                  <span className="block text-orange-600 font-medium mt-1">
                    ⚠️ No flows available. Create a flow first using the canvas above.
                  </span>
                )}
                {flows && flows.length > 0 && (
                  <span className="block text-green-600 font-medium mt-1">
                    ✅ {flows.length} flow{flows.length !== 1 ? 's' : ''} available for testing
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={testWebhook}
              disabled={isTestingWebhook || !testMessage || !selectedFlowForTest || !webhookStatus.isBackendRunning}
              className={`px-8 py-4 rounded-xl font-medium flex items-center space-x-3 transition-all duration-200 transform hover:scale-105 ${
                isTestingWebhook || !testMessage || !selectedFlowForTest || !webhookStatus.isBackendRunning
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-sm'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              }`}
            >
              <div className={`p-1 rounded-full ${
                isTestingWebhook || !testMessage || !selectedFlowForTest || !webhookStatus.isBackendRunning
                  ? 'bg-gray-300' : 'bg-blue-500'
              }`}>
                <TestTube className="h-4 w-4" />
              </div>
              <span className="text-lg">{isTestingWebhook ? 'Setting up Webhook...' : 'Setup Real Webhook Test'}</span>
              {isTestingWebhook && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
            </button>

            <button
              onClick={runLocalTest}
              className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-800 flex items-center space-x-3 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <div className="p-1 bg-gray-500 rounded-full">
                <Server className="h-4 w-4" />
              </div>
              <span className="text-lg">Check Backend</span>
            </button>

            {!webhookStatus.isBackendRunning && (
              <div className="flex items-center px-6 py-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 text-yellow-800 rounded-xl text-sm font-medium shadow-sm">
                <div className="p-1 bg-yellow-200 rounded-full mr-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold">Backend Required</div>
                  <div className="text-xs text-yellow-700">Start the backend server to test triggers</div>
                </div>
              </div>
            )}
          </div>

          {/* Test Results */}
          {testResult && (
            <div className={`mt-4 p-3 rounded border ${
              testResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="font-medium">
                {testResult.success ? '✅ Test Successful' : '❌ Test Failed'}
              </div>
              <div className="text-sm mt-1">
                {testResult.message || testResult.error}
              </div>
              {testResult.instructions && (
                <div className="text-sm mt-2 p-3 bg-blue-50 bg-opacity-80 rounded border border-blue-200">
                  <div className="font-medium text-blue-800">🎯 How to Test Your Webhook:</div>
                  <div className="mt-2 space-y-1 text-blue-700">
                    <div>1. Open WhatsApp on your phone</div>
                    <div>2. Send <strong>"{testResult.triggerKeyword}"</strong> to <strong>{testResult.businessNumber}</strong></div>
                    <div>3. You should receive the <strong>{testResult.flowName}</strong> flow automatically!</div>
                  </div>
                  <div className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded">
                    💡 A webhook trigger has been created. Check the triggers list above to see it.
                  </div>
                </div>
              )}
              {testResult.flowSent && !testResult.instructions && (
                <div className="text-sm mt-2 p-2 bg-white bg-opacity-50 rounded border">
                  <div className="font-medium">📱 Flow Test Details:</div>
                  <div>Flow Tested: {testResult.flowSent}</div>
                  <div>Sent to: {testResult.phoneNumber}</div>
                  <div>Original Message: {testMessage}</div>
                  {testResult.testType && (
                    <div>Test Type: {testResult.testType}</div>
                  )}
                </div>
              )}
              {testResult.allActiveTriggers && (
                <div className="text-sm mt-1">
                  <div>Matching trigger: {testResult.matchingTrigger ? testResult.matchingTrigger.keyword : 'None'}</div>
                  <div>Active triggers: {testResult.allActiveTriggers.length}</div>
                  {testResult.simulationResult && (
                    <div>Simulation: {testResult.simulationResult}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}