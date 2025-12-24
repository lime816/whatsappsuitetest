import { ToastType } from '../components/Toast'

export interface ErrorContext {
  operation: string
  fallbackMessage?: string
  duration?: number
}

export class AppError extends Error {
  constructor(
    message: string,
    public context?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error occurred'
}

export function createErrorHandler(showToast: (type: ToastType, title: string, message: string, duration?: number) => void) {
  return {
    handleApiError: (error: unknown, context: ErrorContext) => {
      const errorMsg = extractErrorMessage(error)
      console.error(`${context.operation} error:`, error)
      
      let title = `${context.operation} Failed`
      let message = errorMsg
      
      // Add context-specific guidance
      if (context.operation.includes('Flow')) {
        message += '\n\nCommon causes:\n• Missing WhatsApp permissions\n• Invalid access token\n• Network connectivity issues'
      }
      
      if (context.fallbackMessage) {
        message += `\n\n${context.fallbackMessage}`
      }
      
      showToast('error', title, message, context.duration || 8000)
    },

    handleWarning: (message: string, title: string = 'Warning', duration: number = 5000) => {
      showToast('warning', title, message, duration)
    },

    handleSuccess: (message: string, title: string = 'Success', duration: number = 3000) => {
      showToast('success', title, message, duration)
    },

    handleInfo: (message: string, title: string = 'Info', duration: number = 5000) => {
      showToast('info', title, message, duration)
    }
  }
}

export type ErrorHandler = ReturnType<typeof createErrorHandler>