import { useReducer, useCallback } from 'react'
import { ToastData } from '../components/Toast'

// Consolidated app state interface
export interface AppState {
  // UI Panel States
  panels: {
    showJsonPreview: boolean
    showWhatsAppPreview: boolean
    showFlowXP: boolean
    showFlowPreview: boolean
    showSendDialog: boolean
    showFlowsPanel: boolean
    showFlowSelectionDialog: boolean
    showQRCodePanel: boolean
    showWebhookSetup: boolean
    showMessageLibrary: boolean
    showAnalytics: boolean
  }
  
  // Flow Management
  flows: {
    allFlows: any[]
    selectedFlow: any | null
    activeFlowId: string
    previewFlowId: string
    previewFlowName: string
    flowActivationMessages: Record<string, string>
  }
  
  // Form Data
  form: {
    phoneNumber: string
    flowName: string
    customMessage: string
  }
  
  // Loading States
  loading: {
    isSending: boolean
    isTestingSms: boolean
    isCreatingFlow: boolean
    isLoadingFlows: boolean
  }
  
  // Layout
  layout: {
    leftPanelWidth: number
    rightPanelWidth: number
    isResizing: boolean
  }
  
  // Notifications
  toasts: ToastData[]
}

// Action types
export type AppAction =
  | { type: 'TOGGLE_PANEL'; panel: keyof AppState['panels'] }
  | { type: 'SET_PANEL'; panel: keyof AppState['panels']; value: boolean }
  | { type: 'SET_FLOWS'; flows: any[] }
  | { type: 'SET_SELECTED_FLOW'; flow: any | null }
  | { type: 'SET_ACTIVE_FLOW_ID'; flowId: string }
  | { type: 'SET_PREVIEW_FLOW'; flowId: string; flowName: string }
  | { type: 'SET_FLOW_ACTIVATION_MESSAGES'; messages: Record<string, string> }
  | { type: 'UPDATE_FORM'; field: keyof AppState['form']; value: string }
  | { type: 'SET_LOADING'; field: keyof AppState['loading']; value: boolean }
  | { type: 'SET_LAYOUT'; field: keyof AppState['layout']; value: number | boolean }
  | { type: 'ADD_TOAST'; toast: ToastData }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'RESET_PANELS' }

// Initial state
export const initialAppState: AppState = {
  panels: {
    showJsonPreview: false,
    showWhatsAppPreview: false,
    showFlowXP: false,
    showFlowPreview: false,
    showSendDialog: false,
    showFlowsPanel: false,
    showFlowSelectionDialog: false,
    showQRCodePanel: false,
    showWebhookSetup: false,
    showMessageLibrary: false,
    showAnalytics: false,
  },
  flows: {
    allFlows: [],
    selectedFlow: null,
    activeFlowId: '',
    previewFlowId: '',
    previewFlowName: '',
    flowActivationMessages: {},
  },
  form: {
    phoneNumber: '918281348343',
    flowName: 'Lucky Draw Registration',
    customMessage: 'Please complete this form to continue with your lucky draw registration.',
  },
  loading: {
    isSending: false,
    isTestingSms: false,
    isCreatingFlow: false,
    isLoadingFlows: false,
  },
  layout: {
    leftPanelWidth: 300,
    rightPanelWidth: 350,
    isResizing: false,
  },
  toasts: [],
}

// Reducer function
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_PANEL':
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panel]: !state.panels[action.panel],
        },
      }
    
    case 'SET_PANEL':
      return {
        ...state,
        panels: {
          ...state.panels,
          [action.panel]: action.value,
        },
      }
    
    case 'SET_FLOWS':
      return {
        ...state,
        flows: {
          ...state.flows,
          allFlows: action.flows,
        },
      }
    
    case 'SET_SELECTED_FLOW':
      return {
        ...state,
        flows: {
          ...state.flows,
          selectedFlow: action.flow,
        },
      }
    
    case 'SET_ACTIVE_FLOW_ID':
      return {
        ...state,
        flows: {
          ...state.flows,
          activeFlowId: action.flowId,
        },
      }
    
    case 'SET_PREVIEW_FLOW':
      return {
        ...state,
        flows: {
          ...state.flows,
          previewFlowId: action.flowId,
          previewFlowName: action.flowName,
        },
      }
    
    case 'SET_FLOW_ACTIVATION_MESSAGES':
      return {
        ...state,
        flows: {
          ...state.flows,
          flowActivationMessages: action.messages,
        },
      }
    
    case 'UPDATE_FORM':
      return {
        ...state,
        form: {
          ...state.form,
          [action.field]: action.value,
        },
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.field]: action.value,
        },
      }
    
    case 'SET_LAYOUT':
      return {
        ...state,
        layout: {
          ...state.layout,
          [action.field]: action.value,
        },
      }
    
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      }
    
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.id),
      }
    
    case 'RESET_PANELS':
      return {
        ...state,
        panels: initialAppState.panels,
      }
    
    default:
      return state
  }
}

// Custom hook for app state management
export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialAppState)
  
  // Memoized action creators
  const actions = {
    togglePanel: useCallback((panel: keyof AppState['panels']) => {
      dispatch({ type: 'TOGGLE_PANEL', panel })
    }, []),
    
    setPanel: useCallback((panel: keyof AppState['panels'], value: boolean) => {
      dispatch({ type: 'SET_PANEL', panel, value })
    }, []),
    
    setFlows: useCallback((flows: any[]) => {
      dispatch({ type: 'SET_FLOWS', flows })
    }, []),
    
    setSelectedFlow: useCallback((flow: any | null) => {
      dispatch({ type: 'SET_SELECTED_FLOW', flow })
    }, []),
    
    setActiveFlowId: useCallback((flowId: string) => {
      dispatch({ type: 'SET_ACTIVE_FLOW_ID', flowId })
    }, []),
    
    setPreviewFlow: useCallback((flowId: string, flowName: string) => {
      dispatch({ type: 'SET_PREVIEW_FLOW', flowId, flowName })
    }, []),
    
    setFlowActivationMessages: useCallback((messages: Record<string, string>) => {
      dispatch({ type: 'SET_FLOW_ACTIVATION_MESSAGES', messages })
    }, []),
    
    updateForm: useCallback((field: keyof AppState['form'], value: string) => {
      dispatch({ type: 'UPDATE_FORM', field, value })
    }, []),
    
    setLoading: useCallback((field: keyof AppState['loading'], value: boolean) => {
      dispatch({ type: 'SET_LOADING', field, value })
    }, []),
    
    setLayout: useCallback((field: keyof AppState['layout'], value: number | boolean) => {
      dispatch({ type: 'SET_LAYOUT', field, value })
    }, []),
    
    addToast: useCallback((toast: ToastData) => {
      dispatch({ type: 'ADD_TOAST', toast })
    }, []),
    
    removeToast: useCallback((id: string) => {
      dispatch({ type: 'REMOVE_TOAST', id })
    }, []),
    
    resetPanels: useCallback(() => {
      dispatch({ type: 'RESET_PANELS' })
    }, []),
  }
  
  return { state, actions }
}