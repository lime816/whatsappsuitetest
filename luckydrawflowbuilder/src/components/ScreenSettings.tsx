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

  // Auto-save on change
  const updateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    if (screen) {
      updateScreen(screen.id, { [field]: value })
    }
  }

  if (!screen) return (
    <div className="hypr-panel flex items-center justify-center">
      <div className="text-center">
        <div className="hypr-status-dot hypr-status-inactive mb-2"></div>
        <p className="hypr-text-muted">NO_SCREEN_SELECTED</p>
      </div>
    </div>
  )

  return (
    <div className="hypr-panel h-full flex flex-col">
      {/* Header */}
      <div className="hypr-section-header">
        <span className="hypr-section-title">INSPECTOR</span>
      </div>

      {/* Screen Tabs */}
      <div className="hypr-tabs">
        {screens.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              const { selectScreen } = useFlowStore.getState()
              selectScreen(s.id)
            }}
            className={`hypr-tab ${
              s.id === selectedScreenId ? 'hypr-tab-active' : 'hypr-tab-inactive'
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>

      <div className="hypr-divider"></div>

      {/* Screen Properties */}
      <div className="hypr-section">
        <div className="hypr-section-header">
          <span className="hypr-section-title">SCREEN_PROPS</span>
        </div>
        
        <div className="hypr-section-content space-y-3">
          <div>
            <label className="hypr-label">SCREEN_ID</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => updateField('id', e.target.value)}
              className="hypr-input"
              placeholder="e.g., RECOMMEND"
            />
          </div>

          <div>
            <label className="hypr-label">TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="hypr-input"
              placeholder="e.g., Feedback 1 of 2"
            />
          </div>
        </div>
      </div>

      <div className="hypr-divider"></div>

      {/* Flow Configuration */}
      <div className="hypr-section flex-1">
        <div className="hypr-section-header">
          <span className="hypr-section-title">FLOW_CONFIG</span>
        </div>
        
        <div className="hypr-section-content space-y-3">
          <div>
            <label className="hypr-label">FLOW_NAME</label>
            <input
              type="text"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              className="hypr-input"
              placeholder="Enter flow name..."
            />
            <p className="hypr-help-text">WhatsApp Flow identifier</p>
          </div>

          <div>
            <label className="hypr-label">ACTIVATION_MSG</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="hypr-textarea"
              rows={3}
              placeholder="Enter activation message..."
            />
            <p className="hypr-help-text">Message sent to activate flow</p>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="hypr-label">PRESETS</label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCustomMessage('Please complete this form to continue with your registration.')}
                className="hypr-preset-btn"
              >
                REG
              </button>
              <button
                onClick={() => setCustomMessage('Fill out this survey to share your feedback with us.')}
                className="hypr-preset-btn"
              >
                SURVEY
              </button>
              <button
                onClick={() => setCustomMessage('Complete this application form to get started.')}
                className="hypr-preset-btn"
              >
                APP
              </button>
            </div>
          </div>

          {/* Status Display */}
          <div className="hypr-status-panel">
            <div className="hypr-status-row">
              <span className="hypr-status-label">FLOW:</span>
              <span className="hypr-status-value">{flowName || 'UNNAMED'}</span>
            </div>
            <div className="hypr-status-row">
              <span className="hypr-status-label">MSG:</span>
              <span className="hypr-status-value truncate">{customMessage || 'NO_MESSAGE'}</span>
            </div>
            <div className="hypr-status-row">
              <span className="hypr-status-label">COMPONENTS:</span>
              <span className="hypr-status-value">{screen.elements.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
