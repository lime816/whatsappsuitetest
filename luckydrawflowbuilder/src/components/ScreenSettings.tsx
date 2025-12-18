import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, MessageCircle } from 'lucide-react'
import { useFlowStore } from '../state/store'

interface ScreenSettingsProps {
  flowName: string
  setFlowName: (name: string) => void
  customMessage: string
  setCustomMessage: (message: string) => void
}

export default function ScreenSettings({ flowName, setFlowName, customMessage, setCustomMessage }: ScreenSettingsProps) {
  const { screens, selectedScreenId, updateScreen } = useFlowStore()
  const [isOpen, setIsOpen] = useState(false)
  const screen = screens.find(s => s.id === selectedScreenId)
  
  const [formData, setFormData] = useState({
    id: screen?.id || '',
    title: screen?.title || '',
  })

  React.useEffect(() => {
    if (screen) {
      setFormData({
        id: screen.id,
        title: screen.title,
      })
    }
  }, [screen])

  const handleSave = () => {
    if (!screen) return
    updateScreen(screen.id, formData)
  }

  // Auto-save on change
  const updateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    if (screen) {
      updateScreen(screen.id, { [field]: value })
    }
  }

  if (!screen) return null

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <Settings className="w-5 h-5 text-primary-600" />
        <h3 className="text-base font-semibold text-gray-800">Screen Settings</h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {screens.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                const { selectScreen } = useFlowStore.getState()
                selectScreen(s.id)
              }}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                s.id === selectedScreenId
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {s.id}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Screen ID
          </label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => updateField('id', e.target.value)}
            className="input-field text-sm"
            placeholder="e.g., RECOMMEND"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input-field text-sm"
            placeholder="e.g., Feedback 1 of 2"
          />
        </div>

        {/* Flow Configuration Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4 text-primary-600" />
            <h4 className="text-sm font-semibold text-gray-800">Flow Configuration</h4>
          </div>
          
          <div className="space-y-4">
            {/* Flow Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Flow Name
              </label>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="input-field text-sm"
                placeholder="Enter your flow name..."
              />
              <p className="text-xs text-gray-500 mt-1">This will be the name of your WhatsApp Flow</p>
            </div>

            {/* Activation Message */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Activation Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="input-field text-sm resize-none"
                rows={3}
                placeholder="Enter the message that will activate your flow..."
              />
              <p className="text-xs text-gray-500 mt-1">This message will be sent to activate your flow</p>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Quick Presets</label>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setCustomMessage('Please complete this form to continue with your registration.')}
                  className="text-xs px-2 py-1 bg-blue-600 text-blue-100 rounded hover:bg-blue-500 transition-colors"
                >
                  Registration
                </button>
                <button
                  onClick={() => setCustomMessage('Fill out this survey to share your feedback with us.')}
                  className="text-xs px-2 py-1 bg-green-600 text-green-100 rounded hover:bg-green-500 transition-colors"
                >
                  Survey
                </button>
                <button
                  onClick={() => setCustomMessage('Complete this application form to get started.')}
                  className="text-xs px-2 py-1 bg-purple-600 text-purple-100 rounded hover:bg-purple-500 transition-colors"
                >
                  Application
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-2">Preview:</h5>
              <div className="text-xs text-gray-600 space-y-1">
                <p><span className="text-gray-800">Flow:</span> {flowName || 'Unnamed Flow'}</p>
                <p><span className="text-gray-800">Message:</span> {customMessage || 'No activation message set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
