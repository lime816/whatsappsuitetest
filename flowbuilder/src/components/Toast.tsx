import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message: string
  duration?: number
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      border: 'border-green-400',
      icon: 'text-green-100'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-600',
      border: 'border-red-400',
      icon: 'text-red-100'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
      border: 'border-amber-400',
      icon: 'text-amber-100'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      border: 'border-blue-400',
      icon: 'text-blue-100'
    }
  }

  const Icon = icons[type]
  const colorScheme = colors[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${colorScheme.bg} ${colorScheme.border} border-2 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm mb-1">
            {title}
          </h4>
          <p className="text-white/90 text-xs whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>

        <button
          onClick={() => onClose(id)}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0 ml-2"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

export default Toast
