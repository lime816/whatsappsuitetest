import { useCallback, useEffect } from 'react'
import AppHeader from './components/AppHeader'
import AppLayout from './components/AppLayout'
import AppModals from './components/AppModals'
import ToastContainer from './components/ToastContainer'
import { useAppState } from './state/appState'
import { createErrorHandler } from './utils/errorHandler'
import { FlowService } from './utils/flowService'
import { useFlowStore } from './state/store'
import { ToastData, ToastType } from './components/Toast'

export default function App() {
  const { screens } = useFlowStore()
  const { state, actions } = useAppState()

  // Create toast handler
  const showToast = useCallback((type: ToastType, title: string, message: string, duration?: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11)
    const newToast: ToastData = { id, type, title, message, duration }
    actions.addToast(newToast)
  }, [actions])

  // Create error handler and flow service
  const errorHandler = createErrorHandler(showToast)
  const flowService = new FlowService(errorHandler)

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

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <p>Built with React + TypeScript + Tailwind CSS • dnd-kit • Framer Motion</p>
        </div>
      </footer>
    </div>
  )
}