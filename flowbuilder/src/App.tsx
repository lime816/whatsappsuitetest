import { useCallback, useEffect, useState } from 'react'
import AppHeader from './components/AppHeader'
import AppLayout from './components/AppLayout'
import AppModals from './components/AppModals'
import ToastContainer from './components/ToastContainer'
import AutoSaveStatus from './components/AutoSaveStatus'
import AutoSaveRecovery from './components/AutoSaveRecovery'
import { useAppState } from './state/appState'
import { createErrorHandler } from './utils/errorHandler'
import { FlowService } from './utils/flowService'
import { autoSaveService, AutoSaveData } from './utils/autoSave'
import { useFlowStore } from './state/store'
import { ToastData, ToastType } from './components/Toast'

export default function App() {
  const { screens, loadScreens, clearScreens } = useFlowStore()
  const { state, actions } = useAppState()
  const [showAutoSaveRecovery, setShowAutoSaveRecovery] = useState(false)
  const [autoSaveData, setAutoSaveData] = useState<AutoSaveData | null>(null)

  // Create toast handler
  const showToast = useCallback((type: ToastType, title: string, message: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11)
    const newToast: ToastData = { id, type, title, message, duration }
    actions.addToast(newToast)
  }, [actions])

  // Create error handler and flow service
  const errorHandler = createErrorHandler(showToast)
  const flowService = new FlowService(errorHandler)

  // Check for auto-save on app load
  useEffect(() => {
    const checkAutoSave = () => {
      if (autoSaveService.hasAutoSave()) {
        const savedData = autoSaveService.load()
        if (savedData && savedData.screens.length > 0) {
          // Only show recovery if there are screens and it's recent (within 24 hours)
          const isRecent = Date.now() - savedData.timestamp < 24 * 60 * 60 * 1000
          if (isRecent) {
            setAutoSaveData(savedData)
            setShowAutoSaveRecovery(true)
          }
        }
      }
    }

    // Check after a short delay to ensure store is initialized
    const timer = setTimeout(checkAutoSave, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Start auto-save when screens change
  useEffect(() => {
    const getCurrentState = () => ({
      screens,
      flowName: state.form.flowName
    })

    autoSaveService.startAutoSave(getCurrentState)

    return () => {
      autoSaveService.stopAutoSave()
    }
  }, [screens, state.form.flowName])

  // Listen for auto-save load events
  useEffect(() => {
    const handleLoadAutoSave = (event: CustomEvent<AutoSaveData>) => {
      const data = event.detail
      
      // Load screens into the store
      loadScreens(data.screens)
      
      // Update form name if available
      if (data.flowName) {
        actions.updateForm('flowName', data.flowName)
      }
      
      showToast('success', 'Auto-save Loaded', `Restored ${data.screens.length} screens from ${new Date(data.timestamp).toLocaleString()}`)
    }

    window.addEventListener('loadAutoSave', handleLoadAutoSave as EventListener)
    return () => {
      window.removeEventListener('loadAutoSave', handleLoadAutoSave as EventListener)
    }
  }, [loadScreens, actions, showToast])

  // Auto-save recovery handlers
  const handleRestoreAutoSave = useCallback(() => {
    if (autoSaveData) {
      // Load the auto-saved data
      loadScreens(autoSaveData.screens)
      
      // Update form name if available
      if (autoSaveData.flowName) {
        actions.updateForm('flowName', autoSaveData.flowName)
      }
      
      showToast('success', 'Work Restored', `Restored ${autoSaveData.screens.length} screens from auto-save`)
      setShowAutoSaveRecovery(false)
      setAutoSaveData(null)
    }
  }, [autoSaveData, loadScreens, actions, showToast])

  const handleDiscardAutoSave = useCallback(() => {
    autoSaveService.clear()
    clearScreens() // Start with empty screens
    showToast('info', 'Auto-save Cleared', 'Starting with a fresh flow')
    setShowAutoSaveRecovery(false)
    setAutoSaveData(null)
  }, [clearScreens, showToast])

  const handleCancelAutoSaveRecovery = useCallback(() => {
    setShowAutoSaveRecovery(false)
    setAutoSaveData(null)
    // Keep the auto-save for later
  }, [])
  // Load stored activation messages from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem('flowActivationMessages')
    if (stored) {
      try {
        actions.setFlowActivationMessages(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading stored activation messages:', error)
      }
    }
  }, [actions])

  // Save activation messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('flowActivationMessages', JSON.stringify(state.flows.flowActivationMessages))
  }, [state.flows.flowActivationMessages])

  // Auto-load flows when the app starts
  useEffect(() => {
    handleGetAllFlows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S for manual save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (screens.length > 0) {
          autoSaveService.save(screens, state.form.flowName)
          showToast('success', 'Saved', 'Flow saved manually')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [screens, state.form.flowName, showToast])

  // Handler functions
  const handleCreateFlow = async () => {
    actions.setLoading('isCreatingFlow', true)
    
    const result = await flowService.createFlow({
      flowName: state.form.flowName,
      screens,
      customMessage: state.form.customMessage,
      autoCreateTrigger: true
    })

    if (result.success && result.flowId) {
      // Store activation message for this flow
      const newMessages = {
        ...state.flows.flowActivationMessages,
        [result.flowId]: state.form.customMessage.trim() || 'Please complete this form to continue.'
      }
      actions.setFlowActivationMessages(newMessages)
    }

    actions.setLoading('isCreatingFlow', false)
  }

  const handleGetAllFlows = async () => {
    actions.setLoading('isLoadingFlows', true)
    const flows = await flowService.getAllFlows()
    actions.setFlows(flows)
    actions.setLoading('isLoadingFlows', false)
    
    if (flows.length > 0) {
      actions.setPanel('showFlowsPanel', true)
    }
  }

  return (
    <div className="hypr-container">
      <AppHeader 
        state={state}
        onTogglePanel={actions.togglePanel}
        onCreateFlow={handleCreateFlow}
        onGetAllFlows={handleGetAllFlows}
      />
      
      <AppLayout 
        state={state}
        onLayoutChange={actions.setLayout}
        onFormUpdate={actions.updateForm}
      />

      <AppModals 
        state={state}
        flowService={flowService}
        onSetPanel={actions.setPanel}
        onSetPreviewFlow={actions.setPreviewFlow}
      />

      <ToastContainer 
        toasts={state.toasts} 
        onClose={actions.removeToast} 
      />

      {/* Auto-save Recovery Modal */}
      {showAutoSaveRecovery && autoSaveData && (
        <AutoSaveRecovery
          autoSaveData={autoSaveData}
          onRestore={handleRestoreAutoSave}
          onDiscard={handleDiscardAutoSave}
          onCancel={handleCancelAutoSaveRecovery}
        />
      )}

      {/* Footer with Auto-save Status */}
      <footer className="border-t border-slate-800/50 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            <p>Built with React + TypeScript + Tailwind CSS • dnd-kit • Framer Motion</p>
          </div>
          <AutoSaveStatus />
        </div>
      </footer>
    </div>
  )
}