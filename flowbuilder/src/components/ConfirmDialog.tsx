import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({ 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmDialogProps) {
  const iconColor = type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
  const bgColor = type === 'danger' ? 'bg-red-500/20' : type === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
  const buttonClass = type === 'danger' ? 'btn-danger' : type === 'warning' ? 'btn-warning' : 'btn-primary'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-slate-800 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-300 text-sm leading-relaxed mb-6">{message}</p>
            
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={onCancel} 
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : type === 'warning'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
