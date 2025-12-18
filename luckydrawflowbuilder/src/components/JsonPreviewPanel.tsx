import React from 'react'
import { motion } from 'framer-motion'
import { X, Copy, Check } from 'lucide-react'

interface JsonPreviewPanelProps {
  json: any
  onClose: () => void
}

export default function JsonPreviewPanel({ json, onClose }: JsonPreviewPanelProps) {
  const [copied, setCopied] = React.useState(false)
  const jsonString = JSON.stringify(json, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 glass-panel border-l border-slate-700 z-[9999] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">JSON Preview</h2>
            <p className="text-sm text-slate-400">WhatsApp Flow API v7.2</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary p-2"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Content */}
        <div className="flex-1 overflow-auto p-4">
          <pre className="json-preview bg-slate-950/50 rounded-lg p-4 text-sm overflow-x-auto">
            <code>{jsonString}</code>
          </pre>
        </div>
      </motion.div>
    </>
  )
}
