import { useState, useCallback, useEffect } from 'react'
import { Moon, Sun, Download, Plus, Code2, MessageCircle, Send, QrCode, Globe, Library, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import HyprScreenDesigner from './components/HyprScreenDesigner'
import JsonPreviewPanel from './components/JsonPreviewPanel'
import WhatsAppPreview from './components/WhatsAppPreview'
import FlowXPPanel from './components/FlowXPPanel'
import FlowPreviewPane from './components/FlowPreviewPane'
import QRFlowInitiator from './components/QRFlowInitiator'
import WebhookSetup from './components/WebhookSetup'
import MessageLibrary from './components/MessageLibrary'
import { useFlowStore } from './state/store'
import { useMessageLibraryStore } from './state/messageLibraryStore'
import { buildFlowJson } from './utils/jsonBuilder'
import { downloadText } from './utils/fileWriter'
import { sendTestFlow } from './utils/whatsappSender'
import { WhatsAppService } from './utils/whatsappService'
import { backendApiService } from './utils/backendApiService'
import ToastContainer from './components/ToastContainer'
import { ToastData, ToastType } from './components/Toast'
import ScreenSettings from './components/ScreenSettings'
import Canvas from './components/Canvas'

export default function App() {
  const { screens, addScreen, selectScreen, selectedScreenId } = useFlowStore()
  const { messages, triggers } = useMessageLibraryStore()

  const [showJsonPreview, setShowJsonPreview] = useState(false)
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false)
  const [showFlowXP, setShowFlowXP] = useState(false)
  const [showFlowPreview, setShowFlowPreview] = useState(false)
  const [previewFlowId, setPreviewFlowId] = useState<string>('')
  const [previewFlowName, setPreviewFlowName] = useState<string>('')
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('918281348343')
  const [isSending, setIsSending] = useState(false)
  const [isTestingSms, setIsTestingSms] = useState(false)
  const [flowName, setFlowName] = useState('Lucky Draw Registration')
  const [isCreatingFlow, setIsCreatingFlow] = useState(false)
  const [allFlows, setAllFlows] = useState<any[]>([])
  const [showFlowsPanel, setShowFlowsPanel] = useState(false)
  const [isLoadingFlows, setIsLoadingFlows] = useState(false)
  const [selectedFlow, setSelectedFlow] = useState<any>(null)
  const [customMessage, setCustomMessage] = useState('Please complete this form to continue with your lucky draw registration.')
  const [showFlowSelectionDialog, setShowFlowSelectionDialog] = useState(false)
  const [showQRCodePanel, setShowQRCodePanel] = useState(false)
  const [showWebhookSetup, setShowWebhookSetup] = useState(false)
  const [showMessageLibrary, setShowMessageLibrary] = useState(false)
  const [activeFlowId, setActiveFlowId] = useState<string>('')
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [flowActivationMessages, setFlowActivationMessages] = useState<Record<string, string>>({})
  
  // Hyprland-inspired layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(300)
  const [rightPanelWidth, setRightPanelWidth] = useState(350)
  const [isResizing, setIsResizing] = useState(false)
  
  // Get business phone number from environment variables
  const businessPhoneNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '15550617327'

  // Load stored activation messages from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('flowActivationMessages')
    if (stored) {
      try {
        setFlowActivationMessages(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading stored activation messages:', error)
      }
    }
  }, [])

  // Save activation messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flowActivationMessages', JSON.stringify(flowActivationMessages))
  }, [flowActivationMessages])

  // Auto-load flows when the app starts for WebhookSetup component
  useEffect(() => {
    const loadInitialFlows = async () => {
      try {
        await handleGetAllFlows()
      } catch (error) {
        console.log('Failed to auto-load flows on startup:', error)
      }
    }
    loadInitialFlows()
  }, [])

  const showToast = useCallback((type: ToastType, title: string, message: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: ToastData = { id, type, title, message, duration }
    setToasts(prev => [...prev, newToast])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const handleExport = () => {
    const json = buildFlowJson(screens)
    downloadText(JSON.stringify(json, null, 2), 'whatsapp-flow.json')
  }

  const handleCreateFlow = async () => {
    if (!flowName.trim()) {
      showToast('warning', 'Flow Name Required', 'Please enter a flow name')
      return
    }
    
    if (screens.length === 0) {
      showToast('warning', 'No Screens Found', 'Please create at least one screen before creating a flow')
      return
    }

    setIsCreatingFlow(true)
    try {
      const service = new WhatsAppService()
      
      // Convert builder screens to WhatsApp Flow JSON
      const builderJson = buildFlowJson(screens)
      console.log('� Creating flow with builder JSON:', JSON.stringify(builderJson, null, 2))
      
      // Create simple flow structure in DRAFT stage only (no asset upload)
      console.log('🆕 Creating flow structure only - no assets')
      
      const response = await fetch(`https://graph.facebook.com/v22.0/${import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID}/flows`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: flowName.trim(),
          categories: ["SIGN_UP"]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Flow creation failed:', errorData)
        throw new Error(`Flow creation failed: ${errorData.error?.message || 'Unknown error'}`)
      }

      const result = await response.json()
      console.log('✅ Flow structure created in DRAFT:', result)
      
      // Store the activation message for this flow
      if (result.id) {
        const activationMsg = customMessage.trim() || 'Please complete this form to continue.'
        setFlowActivationMessages(prev => ({
          ...prev,
          [result.id]: activationMsg
        }))
        console.log('💾 Stored activation message for flow:', result.id, activationMsg)

        // Auto-create webhook trigger for this flow
        try {
          await backendApiService.registerFlow(
            result.id,
            flowName.trim(),
            activationMsg,
            true // auto-create trigger
          )
          console.log('🎯 Auto-created webhook trigger for flow:', result.id)
          showToast('success', 'Webhook Trigger Created!', `Automatic trigger created for keyword: "${activationMsg}"`, 3000)
        } catch (triggerError) {
          console.error('Failed to auto-create trigger:', triggerError)
          const errorMsg = triggerError instanceof Error ? triggerError.message : 'Unknown error'
          showToast('warning', 'Trigger Creation Failed', `Flow created but couldn't create webhook trigger: ${errorMsg}`, 5000)
        }
      }
      
      showToast('success', 'Flow Created in DRAFT!', `Flow Name: ${flowName.trim()}\nFlow ID: ${result.id}\nStatus: DRAFT\nActivation Message: "${customMessage.trim() || 'Please complete this form to continue.'}"\n\n📋 Check console for generated JSON\n\n🔧 Next Steps:\n1. Copy JSON from console\n2. Go to WhatsApp Business Manager\n3. Upload JSON manually\n4. Test and publish!`, 10000)
      console.log('📋 Generated JSON:', JSON.stringify(builderJson, null, 2))
      
    } catch (error) {
      console.error('Create flow error:', error)
      const builderJson = buildFlowJson(screens)
      console.log('📋 Builder JSON:', JSON.stringify(builderJson, null, 2))
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      showToast('error', 'Flow Creation Failed', `${errorMsg}\n\nThis usually means:\n• Missing WhatsApp permissions\n• Access token needs permissions\n• Business account not configured\n\n📋 Check console for generated JSON`, 10000)
      
      if (false) {
        const builderJson = buildFlowJson(screens)
        const jsonWindow = window.open('', '_blank')
        if (jsonWindow) {
          jsonWindow!.document.write(`
            <html>
              <head><title>Builder JSON - ${flowName}</title></head>
              <body style="font-family: monospace; padding: 20px;">
                <h2>Flow: ${flowName}</h2>
                <h3>Builder JSON Output:</h3>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${JSON.stringify(builderJson, null, 2)}
                </pre>
                <p><strong>This is the exact JSON your builder created.</strong><br>
                Once you have proper WhatsApp Business permissions, this JSON will be sent to WhatsApp for approval.</p>
              </body>
            </html>
          `)
          jsonWindow!.document.close()
        }
      }
    } finally {
      setIsCreatingFlow(false)
    }
  }







  const handleSendFlow = async () => {
    if (!phoneNumber.trim()) {
      showToast('warning', 'Phone Number Required', 'Please enter a phone number')
      return
    }

    if (screens.length === 0) {
      showToast('warning', 'No Screens Found', 'Please create at least one screen with elements before sending')
      return
    }

    setIsSending(true)
    try {
      const service = new WhatsAppService()
      
      const result = await service.sendCustomFlowAfterHello(phoneNumber, screens, 'Lucky Draw Form')
      
      if (result.success) {
        const approvalSteps = Object.entries(result.approvalInstructions)
          .map(([key, value]) => `${key.replace('step', 'Step ')}: ${value}`)
          .join('\n')
        
        showToast('success', 'Flow Sent Successfully!', `${result.message}\n\n📋 TO MAKE FLOW LIVE:\n\n${approvalSteps}\n\n⏱️ Approval: 24-72 hours\n\n💡 Works now for:\n• Your number\n• Test numbers in Business Manager`, 10000)
        
        setShowSendDialog(false)
      } else {
        showToast('error', 'Send Flow Error', result.error || 'Unknown error', 8000)
      }
    } catch (error) {
      console.error('Send flow error:', error)
      showToast('error', 'Send Flow Failed', error instanceof Error ? error.message : 'Unknown error', 8000)
    } finally {
      setIsSending(false)
    }
  }

  const handleGetAllFlows = async () => {
    setIsLoadingFlows(true)
    try {
      const service = new WhatsAppService()
      
      const result = await service.getAllFlows()
      setAllFlows(result.data || [])
      setShowFlowsPanel(true)
      
      if (!result.data || result.data.length === 0) {
        showToast('info', 'No Flows Found', "This is normal if you haven't created any flows yet.", 5000)
      }
    } catch (error) {
      console.error('Error fetching flows:', error)
      showToast('error', 'Error Retrieving Flows', error instanceof Error ? error.message : 'Unknown error', 8000)
    } finally {
      setIsLoadingFlows(false)
    }
  }

  const handleCreateFlowFromJson = async () => {
    if (screens.length === 0) {
      showToast('warning', 'No Screens Found', 'Please create at least one screen before creating a flow')
      return
    }

    if (!flowName || !flowName.trim()) {
      showToast('warning', 'Flow Name Required', 'Please enter a flow name in the Flow Config section')
      return
    }

    setIsCreatingFlow(true)
    try {
      // STEP 1: Build the JSON from current screens
      const flowJson = buildFlowJson(screens)
      console.log('� Built Flow JSON from screens:', JSON.stringify(flowJson, null, 2))
      console.log('📊 Screens passed to buildFlowJson:', screens)

      const accessToken = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN
      const businessAccountId = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID

      console.log('🔑 Using Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING!')
      console.log('🏢 Using Business Account ID:', businessAccountId)

      // STEP 2: Create flow structure (DRAFT status)
      console.log('📝 Step 1: Creating flow structure...')
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
        console.error('❌ Flow creation failed:', errorData)
        throw new Error(errorData.error?.message || `HTTP ${createResponse.status}`)
      }

      const flowResult = await createResponse.json()
      console.log('✅ Flow structure created:', flowResult)
      console.log('🆔 Flow ID:', flowResult.id)

      // Store the activation message for this flow
      if (flowResult.id) {
        const activationMsg = customMessage.trim() || 'Please complete this form to continue.'
        setFlowActivationMessages(prev => ({
          ...prev,
          [flowResult.id]: activationMsg
        }))
        console.log('💾 Stored activation message for flow:', flowResult.id, activationMsg)

        // Auto-create webhook trigger for this flow
        try {
          await backendApiService.registerFlow(
            flowResult.id,
            flowName.trim(),
            activationMsg,
            true // auto-create trigger
          )
          console.log('🎯 Auto-created webhook trigger for flow:', flowResult.id)
          showToast('success', 'Webhook Trigger Created!', `Automatic trigger created for keyword: "${activationMsg}"`, 3000)
        } catch (triggerError) {
          console.error('Failed to auto-create trigger:', triggerError)
          const errorMsg = triggerError instanceof Error ? triggerError.message : 'Unknown error'
          showToast('warning', 'Trigger Creation Failed', `Flow created but couldn't create webhook trigger: ${errorMsg}`, 5000)
        }
      }

      // STEP 3: Try multiple upload methods to ensure success
      console.log('📤 Step 2: Uploading flow JSON as assets...')
      
      let uploadResponse
      let uploadResult
      let uploadSuccess = false
      
      // METHOD 1: Try FormData with Blob (official method)
      try {
        console.log('🔹 Method 1: FormData with Blob')
        const formData = new FormData()
        const flowBlob = new Blob([JSON.stringify(flowJson, null, 2)], { type: 'application/json' })
        formData.append('file', flowBlob, 'flow.json')
        formData.append('asset_type', 'FLOW_JSON')
        
        uploadResponse = await fetch(
          `https://graph.facebook.com/v22.0/${flowResult.id}/assets`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          }
        )
        
        uploadResult = await uploadResponse.json()
        
        if (uploadResponse.ok) {
          console.log('✅ Method 1 succeeded!')
          uploadSuccess = true
        } else {
          console.warn('⚠️ Method 1 failed:', uploadResult)
        }
      } catch (error) {
        console.error('❌ Method 1 error:', error)
      }
      
      // METHOD 2: Try with naming parameter
      if (!uploadSuccess) {
        try {
          console.log('🔹 Method 2: FormData with name parameter')
          const formData2 = new FormData()
          const flowBlob2 = new Blob([JSON.stringify(flowJson, null, 2)], { type: 'application/json' })
          formData2.append('file', flowBlob2, 'flow.json')
          formData2.append('name', 'flow.json')
          formData2.append('asset_type', 'FLOW_JSON')
          
          uploadResponse = await fetch(
            `https://graph.facebook.com/v22.0/${flowResult.id}/assets`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`
              },
              body: formData2
            }
          )
          
          uploadResult = await uploadResponse.json()
          
          if (uploadResponse.ok) {
            console.log('✅ Method 2 succeeded!')
            uploadSuccess = true
          } else {
            console.warn('⚠️ Method 2 failed:', uploadResult)
          }
        } catch (error) {
          console.error('❌ Method 2 error:', error)
        }
      }
      
      // Handle result
      if (!uploadSuccess) {
        console.error('⚠️ All upload methods failed')
        console.log('🔄 Trying WhatsAppService fallback...')
        
        // Try alternative method: Using WhatsAppService class method
        try {
          const service = new WhatsAppService()
          const altUploadResult = await service.uploadFlowAssets(flowResult.id, flowJson)
          console.log('Alternative upload succeeded:', altUploadResult)
          
          showToast('success', 'Flow Created & JSON Uploaded!', `Flow ID: ${flowResult.id}\nName: ${flowName}\nStatus: DRAFT\n\nYour flow is ready!\n\nNext Steps:\n1. Go to WhatsApp Business Manager\n2. Find your flow (ID: ${flowResult.id})\n3. Test the flow\n4. Publish when ready!`, 10000)
          
          return // Success via alternative method
          
        } catch (altError) {
          console.error('❌ Alternative upload also failed:', altError)
        }
        
        // Both methods failed - show JSON for manual upload
        const jsonStr = JSON.stringify(flowJson, null, 2)
        
        // Open popup with JSON
        const popup = window.open('', 'Flow JSON', 'width=800,height=600')
        if (popup) {
          popup.document.write(`
            <html>
              <head>
                <title>Flow JSON - ${flowName}</title>
                <style>
                  body { font-family: monospace; padding: 20px; background: #1e1e1e; color: #fff; }
                  pre { background: #2d2d2d; padding: 15px; border-radius: 5px; overflow: auto; }
                  button { padding: 10px 20px; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 0; }
                  button:hover { background: #1fa855; }
                  .info { background: #3a3a3a; padding: 15px; border-radius: 5px; margin: 10px 0; }
                </style>
              </head>
              <body>
                <h2>✅ Flow Created: ${flowName}</h2>
                <div class="info">
                  <p><strong>Flow ID:</strong> ${flowResult.id}</p>
                  <p><strong>Status:</strong> DRAFT</p>
                  <p><strong>Note:</strong> Asset upload requires additional permissions. Please upload manually in WhatsApp Business Manager.</p>
                </div>
                <button onclick="navigator.clipboard.writeText(document.getElementById('json').textContent)">📋 Copy JSON</button>
                <h3>Flow JSON:</h3>
                <pre id="json">${jsonStr}</pre>
              </body>
            </html>
          `)
        }
        
        showToast('warning', '✅ Flow Structure Created', `Flow ID: ${flowResult.id}\nName: ${flowName}\n\n⚠️ Asset upload requires special permissions.\nA popup window with your JSON has been opened.\n\n📋 Next Steps:\n1. Copy the JSON from the popup\n2. Go to WhatsApp Business Manager\n3. Find flow ID: ${flowResult.id}\n4. Upload the JSON manually`, 12000)
      }
      
    } catch (error) {
      console.error('❌ Error creating flow:', error)
      showToast('error', '❌ Error Creating Flow', `${error instanceof Error ? error.message : 'Unknown error'}\n\n${error instanceof Error && error.message.includes('OAuth') ? '💡 Tip: Check your access token in the .env file' : ''}`, 10000)
    } finally {
      setIsCreatingFlow(false)
    }
  }

  const handleApproveFlow = async (flowId: string) => {
    try {
      const service = new WhatsAppService()
      
      const result = await service.approveFlow(flowId)
      
      // Refresh the flows list to show updated status
      await handleGetAllFlows()
      
      if (result.success) {
        showToast('success', 'Flow Submitted for Approval', `${result.message}\n\nFlow ID: ${flowId}\n\n📋 What happens next:\n• WhatsApp will review (24-72 hours)\n• You'll get notified when approved\n• Once approved, can send activation messages\n• Check "View All Flows" for status`, 10000)
      } else {
        showToast('warning', 'Approval Request Issue', `${result.message}\n\nFlow ID: ${flowId}\n\nPlease check your flow in Facebook Business Manager for more details.`, 10000)
      }
    } catch (error) {
      console.error('Error submitting flow for approval:', error)
      showToast('error', 'Approval Submission Failed', `${error instanceof Error ? error.message : 'Unknown error'}\n\nTry checking your flow in Facebook Business Manager.`, 10000)
    }
  }

  const handleFlowDetails = async (flowId: string) => {
    try {
      const service = new WhatsAppService()
      
      const result = await service.getFlowDetails(flowId)
      setSelectedFlow(result)
      
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
      
      showToast('info', 'Flow Details', details, 10000)
    } catch (error) {
      console.error('Error fetching flow details:', error)
      showToast('error', 'Error Fetching Flow Details', error instanceof Error ? error.message : 'Unknown error', 8000)
    }
  }

  const handleUpdateExistingFlow = async () => {
    if (screens.length === 0) {
      showToast('warning', 'No Screens Found', 'Please create at least one screen before updating the flow')
      return
    }

    setIsCreatingFlow(true)
    try {
      const service = new WhatsAppService()
      
      // Convert builder screens to WhatsApp Flow JSON
      const builderJson = buildFlowJson(screens)
      console.log('🔄 Updating existing flow with builder JSON:', JSON.stringify(builderJson, null, 2))
      
      // Generate JSON for manual upload (no automatic upload)
      const result = await service.updateFlowWithBuilderJson('1317325209838011', builderJson, flowName.trim())
      
      // Show JSON in popup window for easy copying
      const jsonWindow = window.open('', '_blank')
      if (jsonWindow) {
        jsonWindow.document.write(`
          <html>
            <head>
              <title>Flow JSON - ${flowName.trim()}</title>
              <style>
                body { font-family: 'Segoe UI', sans-serif; padding: 30px; background: #f5f5f5; }
                h1 { color: #25D366; }
                .json-container { 
                  background: white; 
                  padding: 20px; 
                  border-radius: 8px; 
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  margin: 20px 0;
                }
                pre { 
                  background: #2d2d2d; 
                  color: #f8f8f2; 
                  padding: 20px; 
                  border-radius: 5px; 
                  overflow-x: auto;
                  font-size: 13px;
                  line-height: 1.5;
                }
                button {
                  background: #25D366;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                  font-weight: 600;
                }
                button:hover { background: #20BA5A; }
                .instructions {
                  background: #E3F2FD;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                  border-left: 4px solid #2196F3;
                }
              </style>
            </head>
            <body>
              <h1>✅ Flow JSON Generated!</h1>
              <div class="instructions">
                <h3>📋 Next Steps:</h3>
                <ol>
                  <li>Click "Copy JSON" button below</li>
                  <li>Go to <strong>WhatsApp Business Manager</strong></li>
                  <li>Find flow ID: <code>1317325209838011</code></li>
                  <li>Use the Flow Builder to upload this JSON</li>
                  <li>Test and publish your flow!</li>
                </ol>
              </div>
              <div class="json-container">
                <button onclick="navigator.clipboard.writeText(document.getElementById('json').textContent).then(() => { this.textContent = '✅ Copied!'; this.style.background = '#4CAF50'; setTimeout(() => { this.textContent = '📋 Copy JSON'; this.style.background = ''; }, 2000); })">
                  📋 Copy JSON
                </button>
                <pre id="json">${JSON.stringify(builderJson, null, 2)}</pre>
              </div>
            </body>
          </html>
        `)
      }
      
      showToast('success', 'Flow JSON Generated!', `Flow ID: 1317325209838011\nFlow Name: ${flowName.trim()}\n\n📋 A new window has opened with your JSON.\nCopy it and upload manually in WhatsApp Business Manager.\n\n✨ No asset upload errors - JSON ready for manual upload!`, 10000)
      
    } catch (error) {
      console.error('Update flow error:', error)
      showToast('error', 'Error Updating Flow', `${error instanceof Error ? error.message : 'Unknown error'}\n\nThe flow update failed. Your original flow is unchanged.`, 8000)
    } finally {
      setIsCreatingFlow(false)
    }
  }

  const handleSendFlowMessage = async (flowId: string) => {
    if (!phoneNumber.trim()) {
      showToast('warning', 'Phone Number Required', 'Please enter a phone number in the input field above')
      return
    }

    try {
      const service = new WhatsAppService()
      
      const result = await service.sendFlowActivationMessage(phoneNumber, flowId, customMessage.trim() || "Please complete this form to continue.")
      
      showToast('success', 'Flow Activation Message Sent!', `Message ID: ${result.messages[0].id}\nFlow ID: ${flowId}\nSent to: +${phoneNumber}\nMessage: "${customMessage.trim() || "Please complete this form to continue."}"\n\nThe user will receive your custom message and then can interact with your flow!`, 10000)
    } catch (error) {
      console.error('Error sending flow message:', error)
      
      let errorMessage = 'Unknown error'
      let errorTitle = 'Error Sending Flow Activation'
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.error?.code === 10) {
            errorTitle = '❌ Permission Error'
            errorMessage = `WhatsApp API Permission Issue\n\n${errorData.error.message}\n\nThis means:\n• Your access token lacks messaging permissions\n• Need to add 'whatsapp_business_messaging' scope\n• Contact your WhatsApp Business API provider\n• Or regenerate token with proper permissions`
          } else {
            errorMessage = errorData.error?.message || error.message
          }
        } catch {
          errorMessage = error.message
        }
      }
      
      showToast('error', errorTitle, `${errorMessage}\n\nMake sure:\n• The flow is approved/published\n• Phone number is correct\n• Flow ID exists\n• Access token has proper permissions`, 12000)
    }
  }

  const handleSendSelectedFlow = async (flowId: string, flowName: string) => {
    if (!phoneNumber.trim()) {
      showToast('warning', 'Phone Number Required', 'Please enter a phone number in the input field above')
      return
    }

    try {
      const service = new WhatsAppService()
      
      const result = await service.sendFlowActivationMessage(phoneNumber, flowId, customMessage.trim() || "Please complete this form to continue.")
      
      showToast('success', 'Flow Activation Message Sent!', `Flow: ${flowName}\nFlow ID: ${flowId}\nMessage ID: ${result.messages[0].id}\nSent to: +${phoneNumber}\n\nCustom Message: "${customMessage.trim() || "Please complete this form to continue."}"\n\nThe user will now receive your selected flow and can interact with it!`, 10000)
      
      setShowFlowSelectionDialog(false)
    } catch (error) {
      console.error('Error sending selected flow message:', error)
      
      let errorMessage = 'Unknown error'
      let errorTitle = 'Error Sending Flow Activation'
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.error?.code === 10) {
            errorTitle = '❌ Permission Error'
            errorMessage = `WhatsApp API Permission Issue\n\n${errorData.error.message}\n\nThis means:\n• Your access token lacks messaging permissions\n• Need to add 'whatsapp_business_messaging' scope\n• Contact your WhatsApp Business API provider\n• Or regenerate token with proper permissions`
          } else {
            errorMessage = errorData.error?.message || error.message
          }
        } catch {
          errorMessage = error.message
        }
      }
      
      showToast('error', errorTitle, `${errorMessage}\n\nMake sure:\n• The flow is approved/published\n• Phone number is correct\n• Flow ID exists\n• Access token has proper permissions`, 12000)
    }
  }

  // Helper function to send active flow activation
  const handleSendActiveFlow = async (customerPhoneNumber: string) => {
    if (!customerPhoneNumber.trim()) {
      showToast('warning', 'Phone Number Required', 'Please enter the customer\'s phone number')
      return
    }

    if (!activeFlowId) {
      showToast('warning', 'No Active Flow', 'Please select an active flow first in the QR Code panel')
      return
    }

    try {
      const service = new WhatsAppService()
      const activeFlow = allFlows.find(f => f.id === activeFlowId)
      
      const result = await service.sendFlowActivationMessage(
        customerPhoneNumber, 
        activeFlowId, 
        customMessage.trim() || "Thank you for contacting us! Please complete this form to continue."
      )
      
      showToast('success', 'Active Flow Sent!', `Flow: ${activeFlow?.name || 'Selected Flow'}\nFlow ID: ${activeFlowId}\nMessage ID: ${result.messages[0].id}\nSent to: +${customerPhoneNumber}\n\n✅ Customer will now receive the active flow and can interact with it!`, 10000)
      
    } catch (error) {
      console.error('Error sending active flow:', error)
      
      let errorMessage = 'Unknown error'
      let errorTitle = 'Error Sending Active Flow'
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          if (errorData.error?.code === 10) {
            errorTitle = '❌ Permission Error'
            errorMessage = `WhatsApp API Permission Issue\n\n${errorData.error.message}\n\nThis means:\n• Your access token lacks messaging permissions\n• Need to add 'whatsapp_business_messaging' scope\n• Contact your WhatsApp Business API provider\n• Or regenerate token with proper permissions`
          } else {
            errorMessage = errorData.error?.message || error.message
          }
        } catch {
          errorMessage = error.message
        }
      }
      
      showToast('error', errorTitle, `${errorMessage}\n\nMake sure:\n• The active flow is approved/published\n• Phone number is correct\n• Access token has proper permissions`, 12000)
    }
  }

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark')
  }, [])



  return (
    <div className="hypr-container">
      {/* Hyprland-inspired Header Bar */}
      <header className="hypr-header">
        <div className="flex items-center gap-4">
          {/* Workspace indicator */}
          <div className="flex items-center gap-2">
            <div className="hypr-status-dot hypr-status-active"></div>
            <span className="hypr-title">FLOW_BUILDER</span>
          </div>
          
          {/* Screen tabs */}
          <div className="flex">
            {screens.map((screen, idx) => (
              <button
                key={screen.id}
                onClick={() => selectScreen(screen.id)}
                className={`hypr-tab ${
                  screen.id === selectedScreenId ? 'hypr-tab-active' : 'hypr-tab-inactive'
                }`}
              >
                {screen.id}
              </button>
            ))}
            <button
              onClick={() => addScreen()}
              className="hypr-tab hypr-tab-inactive"
              title="Add Screen [Ctrl+N]"
            >
              +
            </button>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className={`hypr-btn ${showJsonPreview ? 'hypr-btn-primary' : ''}`}
            title="JSON Preview [Ctrl+J]"
          >
            JSON
          </button>
          
          <button
            onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
            className={`hypr-btn ${showWhatsAppPreview ? 'hypr-btn-primary' : ''}`}
            title="WhatsApp Preview [Ctrl+P]"
          >
            PREVIEW
          </button>
          
          <button
            onClick={() => setShowFlowXP(!showFlowXP)}
            className={`hypr-btn ${showFlowXP ? 'hypr-btn-primary' : ''}`}
            title="Flow Experience [Ctrl+E]"
          >
            FLOWXP
          </button>
          
          <button
            onClick={handleCreateFlowFromJson}
            className="hypr-btn-success"
            disabled={screens.length === 0 || isCreatingFlow}
            title="Create Flow [Ctrl+Enter]"
          >
            {isCreatingFlow ? 'CREATING...' : 'CREATE'}
          </button>
          
          <div className="hypr-divider-vertical"></div>
          
          <button
            onClick={handleGetAllFlows}
            className="hypr-btn"
            disabled={isLoadingFlows}
            title="Get All Flows [Ctrl+G]"
          >
            {isLoadingFlows ? 'LOADING...' : 'FLOWS'}
          </button>
          
          <button
            onClick={() => setShowQRCodePanel(!showQRCodePanel)}
            className={`hypr-btn ${showQRCodePanel ? 'hypr-btn-primary' : ''}`}
            title="QR Code [Ctrl+Q]"
          >
            QR
          </button>
          
          <button
            onClick={() => setShowWebhookSetup(!showWebhookSetup)}
            className={`hypr-btn ${showWebhookSetup ? 'hypr-btn-primary' : ''}`}
            title="Webhooks [Ctrl+W]"
          >
            HOOKS
          </button>
          
          <button
            onClick={() => setShowMessageLibrary(!showMessageLibrary)}
            className={`hypr-btn ${showMessageLibrary ? 'hypr-btn-primary' : ''}`}
            title="Message Library [Ctrl+M]"
          >
            MSGS
          </button>
        </div>
      </header>

      {/* Main tiled layout */}
      <div className="hypr-main">
        {/* Left rail - Screens + Components */}
        <div 
          className="hypr-sidebar tile-left"
          style={{ width: `${leftPanelWidth}px` }}
        >
          <HyprScreenDesigner 
            flowName={flowName}
            setFlowName={setFlowName}
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
          />
        </div>

        {/* Resizer */}
        <div 
          className="hypr-resizer"
          onMouseDown={(e) => {
            setIsResizing(true)
            const startX = e.clientX
            const startWidth = leftPanelWidth
            
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)))
              setLeftPanelWidth(newWidth)
            }
            
            const handleMouseUp = () => {
              setIsResizing(false)
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />

        {/* Center - Canvas */}
        <div className="hypr-content tile-center">
          <Canvas key={selectedScreenId} />
        </div>

        {/* Resizer */}
        <div 
          className="hypr-resizer"
          onMouseDown={(e) => {
            setIsResizing(true)
            const startX = e.clientX
            const startWidth = rightPanelWidth
            
            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(250, Math.min(600, startWidth - (e.clientX - startX)))
              setRightPanelWidth(newWidth)
            }
            
            const handleMouseUp = () => {
              setIsResizing(false)
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
        />

        {/* Right rail - Inspector */}
        <div 
          className="hypr-sidebar-right tile-right"
          style={{ width: `${rightPanelWidth}px` }}
        >
          <div className="hypr-panel h-full overflow-hidden">
            <ScreenSettings 
              flowName={flowName}
              setFlowName={setFlowName}
              customMessage={customMessage}
              setCustomMessage={setCustomMessage}
            />
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* WhatsApp Preview Panel */}
      <AnimatePresence>
        {showWhatsAppPreview && (
          <WhatsAppPreview 
            screens={screens} 
            onClose={() => setShowWhatsAppPreview(false)}
          />
        )}
      </AnimatePresence>

      {/* JSON Preview Panel */}
      <AnimatePresence>
        {showJsonPreview && (
          <JsonPreviewPanel 
            json={buildFlowJson(screens)} 
            onClose={() => setShowJsonPreview(false)}
          />
        )}
      </AnimatePresence>

      {/* Flows Management Panel */}
      <AnimatePresence>
        {showFlowsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFlowsPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">
                    WhatsApp Flows Management
                  </h3>
                  <button
                    onClick={() => setShowFlowsPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 80px)' }}>
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={handleGetAllFlows}
                      disabled={isLoadingFlows}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoadingFlows ? '⏳ Loading...' : '🔄 Refresh Flows'}
                    </button>
                  </div>
                  
                  {allFlows.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📋</div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">
                        No Flows Found
                      </h4>
                      <p className="text-gray-600 mb-4">
                        No flows have been created yet. Create your first flow using the builder above!
                      </p>
                      <button
                        onClick={handleGetAllFlows}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                      >
                        Refresh Flows
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        Found {allFlows.length} flow{allFlows.length !== 1 ? 's' : ''}
                      </div>
                      
                      {allFlows.map((flow, index) => (
                        <div
                          key={flow.id || index}
                          className="border border-gray-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-gray-800">
                                {flow.name || 'Unnamed Flow'}
                              </h5>
                              <p className="text-sm text-gray-600">
                                ID: {flow.id}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: <span className={`font-medium ${
                                  flow.status === 'PUBLISHED' ? 'text-green-600' :
                                  flow.status === 'DRAFT' ? 'text-yellow-600' :
                                  flow.status === 'DEPRECATED' ? 'text-red-600' :
                                  'text-gray-600'
                                }`}>
                                  {flow.status}
                                </span>
                              </p>
                              {flow.categories && (
                                <p className="text-sm text-gray-600">
                                  Categories: {flow.categories.join(', ')}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setPreviewFlowId(flow.id)
                                  setPreviewFlowName(flow.name || 'Unnamed Flow')
                                  setShowFlowPreview(true)
                                }}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded flex items-center gap-1"
                                title="Preview flow screens"
                              >
                                👁️ Preview
                              </button>
                              
                              <button
                                onClick={() => handleFlowDetails(flow.id)}
                                className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                                title="View flow details"
                              >
                                📝 Details
                              </button>
                              
                              {flow.status !== 'PUBLISHED' && (
                                <button
                                  onClick={() => handleApproveFlow(flow.id)}
                                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
                                  title="Submit for approval"
                                >
                                  ✅ Approve
                                </button>
                              )}
                              
                              {flow.preview_url && (
                                <a
                                  href={flow.preview_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                                  title="Open preview"
                                >
                                  👁️ Preview
                                </a>
                              )}
                              
                              {flow.status === 'PUBLISHED' && (
                                <button
                                  onClick={() => handleSendFlowMessage(flow.id)}
                                  className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded"
                                  title="Send message to activate this flow"
                                >
                                  📤 Send Message
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {flow.created_time && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 border-t pt-2">
                              Created: {new Date(flow.created_time * 1000).toLocaleString()}
                              {flow.updated_time && flow.updated_time !== flow.created_time && (
                                <span className="ml-4">
                                  Updated: {new Date(flow.updated_time * 1000).toLocaleString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Generator Panel */}
      <AnimatePresence>
        {showQRCodePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowQRCodePanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <QrCode className="w-6 h-6 text-white" />
                    </div>
                    WhatsApp Flow QR Code Generator
                  </h3>
                  <button
                    onClick={() => setShowQRCodePanel(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="max-w-2xl mx-auto">
                    <QRFlowInitiator 
                      businessPhoneNumber={businessPhoneNumber}
                      activeFlowId={activeFlowId}
                      allFlows={allFlows}
                      flowActivationMessages={flowActivationMessages}
                      onFlowTrigger={handleSendActiveFlow}
                      onCopySuccess={() => showToast('success', 'Copied!', 'WhatsApp link copied to clipboard', 3000)}
                    />
                    
                    {/* Active Flow Selection */}
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-primary-600" />
                        QR Code Flow Configuration
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Configure which flow will be automatically activated when customers scan your QR code. 
                        QR codes will use the exact activation message you configured when creating each flow.
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Flow for QR Code
                          </label>
                          <select
                            value={activeFlowId}
                            onChange={(e) => setActiveFlowId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          >
                            <option value="">No active flow selected</option>
                            {allFlows.map(flow => (
                              <option key={flow.id} value={flow.id}>
                                {flow.name || 'Unnamed Flow'} ({flow.id}) - {flow.status}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            This flow will be automatically activated when users scan the QR code
                          </p>
                        </div>
                        
                        {activeFlowId && (
                          <div className="bg-primary-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                              <span className="text-sm font-medium text-primary-800">
                                Active Flow Selected
                              </span>
                            </div>
                            {(() => {
                              const selectedFlow = allFlows.find(f => f.id === activeFlowId)
                              return selectedFlow ? (
                                <div className="text-xs text-primary-700 space-y-1">
                                  <p><strong>Name:</strong> {selectedFlow.name || 'Unnamed'}</p>
                                  <p><strong>ID:</strong> {selectedFlow.id}</p>
                                  <p><strong>Status:</strong> {selectedFlow.status}</p>
                                  <p><strong>Categories:</strong> {selectedFlow.categories?.join(', ') || 'None'}</p>
                                  {selectedFlow.created_time && (
                                    <p><strong>Created:</strong> {new Date(selectedFlow.created_time * 1000).toLocaleDateString()}</p>
                                  )}
                                </div>
                              ) : null
                            })()} 
                            <div className="mt-3 p-3 bg-white dark:bg-slate-700 rounded border">
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mb-1">Smart Activation:</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400">
                                QR codes automatically generate contextual activation messages based on your flow name. 
                                The flow activates immediately when customers scan the code - no manual intervention needed!
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleGetAllFlows}
                            disabled={isLoadingFlows}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 text-sm"
                          >
                            {isLoadingFlows ? 'Loading...' : 'Refresh Flows'}
                          </button>
                          
                          {activeFlowId && (
                            <button
                              onClick={() => handleFlowDetails(activeFlowId)}
                              className="px-4 py-2 bg-whatsapp-500 hover:bg-whatsapp-600 text-white rounded-lg flex items-center gap-2 text-sm"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flow Debugging Section */}
                    {activeFlowId && (
                      <div className="mt-8 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-900 dark:text-red-200 mb-4 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Flow Not Working? Debug Information
                        </h4>
                        
                        {(() => {
                          const selectedFlow = allFlows.find(f => f.id === activeFlowId)
                          if (!selectedFlow) return null
                          
                          const isPublished = selectedFlow.status === 'PUBLISHED'
                          const isDraft = selectedFlow.status === 'DRAFT'
                          
                          return (
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${isPublished ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                  <p className="font-medium text-red-800 dark:text-red-200">
                                    Flow Status: <span className={isPublished ? 'text-green-600' : 'text-red-600'}>{selectedFlow.status}</span>
                                  </p>
                                  {isDraft && (
                                    <p className="text-red-700 dark:text-red-300 mt-1">
                                      ❌ <strong>Issue:</strong> Flow is in DRAFT mode. DRAFT flows only work for test numbers and the business owner.
                                    </p>
                                  )}
                                  {isPublished && (
                                    <p className="text-green-700 dark:text-green-300 mt-1">
                                      ✅ Flow is PUBLISHED and should work for all users.
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded border border-yellow-200 dark:border-yellow-700">
                                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Common Flow Issues:</p>
                                <ul className="text-yellow-700 dark:text-yellow-300 space-y-1 text-xs">
                                  <li>• <strong>DRAFT Status:</strong> Only works for business owner and test numbers</li>
                                  <li>• <strong>Missing Approval:</strong> Flow needs WhatsApp/Facebook approval to work for all users</li>
                                  <li>• <strong>Token Permissions:</strong> Access token needs 'whatsapp_business_messaging' scope</li>
                                  <li>• <strong>24-Hour Rule:</strong> Need template message or user-initiated conversation</li>
                                  <li>• <strong>Flow Configuration:</strong> Flow JSON might have validation errors</li>
                                </ul>
                              </div>
                              
                              <div className="flex gap-2 mt-4">
                                <button
                                  onClick={async () => {
                                    try {
                                      const service = new WhatsAppService()
                                      const result = await service.sendFlowActivationMessage(
                                        phoneNumber || '1234567890', 
                                        activeFlowId, 
                                        "🔧 DEBUG TEST: This is a test message to check if flow sending works."
                                      )
                                      showToast('success', 'Debug Test Sent!', `Test message sent successfully!\nMessage ID: ${result.messages?.[0]?.id}\nIf you received this, the flow system is working.`, 8000)
                                    } catch (error: any) {
                                      console.error('Debug test error:', error)
                                      showToast('error', 'Debug Test Failed', `Error details:\n${error.message}\n\nThis shows what's wrong with your flow configuration.`, 10000)
                                    }
                                  }}
                                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium"
                                  disabled={!phoneNumber}
                                >
                                  🔧 Debug Test Flow
                                </button>
                                
                                {isDraft && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const service = new WhatsAppService()
                                        await service.publishFlow(activeFlowId)
                                        showToast('success', 'Flow Published!', 'Flow has been published successfully! It will now work for all users (may take a few minutes to activate).', 8000)
                                        // Refresh flows to update status
                                        handleGetAllFlows()
                                      } catch (error: any) {
                                        console.error('Publish error:', error)
                                        showToast('error', 'Publish Failed', `Failed to publish flow:\n${error.message}\n\nMake sure your flow has no validation errors and meets WhatsApp's requirements.`, 10000)
                                      }
                                    }}
                                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium"
                                  >
                                    🚀 Publish Flow
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => {
                                    const debugInfo = {
                                      flowId: activeFlowId,
                                      flowStatus: selectedFlow.status,
                                      phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
                                      hasAccessToken: !!import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN,
                                      businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID
                                    }
                                    console.log('🔧 Flow Debug Info:', debugInfo)
                                    showToast('info', 'Debug Info Logged', 'Check browser console (F12) for technical details', 5000)
                                  }}
                                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
                                >
                                  📋 Log Debug Info
                                </button>
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webhook Setup Panel */}
      <AnimatePresence>
        {showWebhookSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowWebhookSetup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    Webhook Setup & Backend Integration
                  </h3>
                  <button
                    onClick={() => setShowWebhookSetup(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>
                
                <div className="p-6">
                  <WebhookSetup flows={allFlows} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Library Panel */}
      <AnimatePresence>
        {showMessageLibrary && (
          <MessageLibrary 
            onClose={() => setShowMessageLibrary(false)}
          />
        )}
      </AnimatePresence>


      {/* Send Flow Dialog */}
      <AnimatePresence>
        {showSendDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSendDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Send Custom Flow to WhatsApp
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flow Name
                  </label>
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    placeholder="e.g., Lucky Draw Registration"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    disabled={isSending}
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {flowName.length}/60 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp Phone Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 918281348343"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-slate-700 dark:text-white"
                    disabled={isSending}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter phone number without + sign (e.g., 918281348343 for +91 8281348343)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    QR Code Activation Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="This message will be sent when users scan your QR code..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                    disabled={isSending}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 This message will automatically activate your selected flow when customers scan the QR code
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      onClick={() => setCustomMessage('🎉 Welcome to our Lucky Draw! Please complete this form to participate and win exciting prizes!')}
                      className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      Lucky Draw
                    </button>
                    <button
                      onClick={() => setCustomMessage('📝 Please fill out this registration form to get started.')}
                      className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                    >
                      Registration
                    </button>
                    <button
                      onClick={() => setCustomMessage('📋 Complete this quick survey to help us serve you better!')}
                      className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800"
                    >
                      Survey
                    </button>
                    <button
                      onClick={() => setCustomMessage('📞 Please provide your contact details for further assistance.')}
                      className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-200 dark:hover:bg-orange-800"
                    >
                      Contact
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This message will be sent to activate your flow. Click preset buttons above for quick options.
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>⚡ Quick Process (5 steps):</strong>
                  </p>
                  <ul className="text-xs text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                    <li>1. 📱 Send "hello" template message</li>
                    <li>2. 🔧 Create flow on WhatsApp Business</li>
                    <li>3. 📤 Upload your form structure</li>
                    <li>4. 📨 Send flow message to you</li>
                    <li>5. ✅ Test in draft mode (approval needed for public)</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSendDialog(false)}
                    className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    disabled={isSending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendFlow}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={isSending || !phoneNumber.trim()}
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Flow
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow Selection Dialog */}
      <AnimatePresence>
        {showFlowSelectionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFlowSelectionDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 max-h-[70vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Select Flow to Send</h3>
                <button
                  onClick={() => setShowFlowSelectionDialog(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-sm text-slate-400 mb-4">
                Choose a flow to send to: <span className="text-whatsapp-400">+{phoneNumber}</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {allFlows.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-4">No flows found</p>
                    <button
                      onClick={async () => {
                        setShowFlowSelectionDialog(false)
                        await handleGetAllFlows()
                        setShowFlowSelectionDialog(true)
                      }}
                      className="btn-secondary"
                    >
                      Load Flows
                    </button>
                  </div>
                ) : (
                  allFlows.map((flow) => (
                    <div
                      key={flow.id}
                      className="border border-slate-700 rounded-lg p-4 hover:border-whatsapp-500/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{flow.name || 'Unnamed Flow'}</h4>
                          <p className="text-sm text-slate-400">ID: {flow.id}</p>
                          <p className="text-xs text-slate-500">
                            Status: <span className={flow.status === 'PUBLISHED' ? 'text-green-400' : 'text-yellow-400'}>
                              {flow.status || 'DRAFT'}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendSelectedFlow(flow.id, flow.name || 'Unnamed Flow')}
                          className="btn-primary text-sm px-3 py-1"
                          disabled={isSending}
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                      </div>
                      {flow.categories && (
                        <div className="text-xs text-slate-500">
                          Categories: {flow.categories.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-500 text-center">
                  Custom Message: "{customMessage || 'Please complete this form to continue.'}"
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FlowXP Modal */}
      <AnimatePresence>
        {showFlowXP && (
          <FlowXPPanel 
            onClose={() => setShowFlowXP(false)} 
            availableFlows={allFlows}
            availableMessages={messages}
          />
        )}
      </AnimatePresence>

      {/* Flow Preview Pane */}
      <AnimatePresence>
        {showFlowPreview && previewFlowId && (
          <FlowPreviewPane
            flowId={previewFlowId}
            flowName={previewFlowName}
            onClose={() => {
              setShowFlowPreview(false)
              setPreviewFlowId('')
              setPreviewFlowName('')
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <p>Built with React + TypeScript + Tailwind CSS • dnd-kit • Framer Motion</p>
        </div>
      </footer>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
