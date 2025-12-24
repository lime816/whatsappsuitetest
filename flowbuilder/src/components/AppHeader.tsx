import React from 'react'
import { Plus } from 'lucide-react'
import { useFlowStore } from '../state/store'
import { AppState } from '../state/appState'
import { autoSaveService } from '../utils/autoSave'

interface AppHeaderProps {
  state: AppState
  onTogglePanel: (panel: keyof AppState['panels']) => void
  onCreateFlow: () => void
  onGetAllFlows: () => void
}

export default function AppHeader({ state, onTogglePanel, onCreateFlow, onGetAllFlows }: AppHeaderProps) {
  const { screens, addScreen, selectScreen, selectedScreenId } = useFlowStore()
  const { panels, loading, form } = state

  const handleManualSave = () => {
    autoSaveService.save(screens, form.flowName)
  }

  return (
    <header className="hypr-header">
      <div className="flex items-center gap-4">
        {/* Workspace indicator */}
        <div className="flex items-center gap-2">
          <div className="hypr-status-dot hypr-status-active"></div>
          <span className="hypr-title">FLOW_BUILDER</span>
        </div>
        
        {/* Screen tabs */}
        <div className="flex">
          {screens.map((screen) => (
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
          onClick={() => onTogglePanel('showJsonPreview')}
          className={`hypr-btn ${panels.showJsonPreview ? 'hypr-btn-primary' : ''}`}
          title="JSON Preview [Ctrl+J]"
        >
          JSON
        </button>
        
        <button
          onClick={() => onTogglePanel('showWhatsAppPreview')}
          className={`hypr-btn ${panels.showWhatsAppPreview ? 'hypr-btn-primary' : ''}`}
          title="WhatsApp Preview [Ctrl+P]"
        >
          PREVIEW
        </button>
        
        <button
          onClick={() => onTogglePanel('showFlowXP')}
          className={`hypr-btn ${panels.showFlowXP ? 'hypr-btn-primary' : ''}`}
          title="Flow Experience [Ctrl+E]"
        >
          FLOWXP
        </button>
        
        <button
          onClick={handleManualSave}
          className="hypr-btn"
          title="Save Now [Ctrl+S]"
          disabled={screens.length === 0}
        >
          SAVE
        </button>
        
        <button
          onClick={onCreateFlow}
          className="hypr-btn-success"
          disabled={screens.length === 0 || loading.isCreatingFlow}
          title="Create Flow [Ctrl+Enter]"
        >
          {loading.isCreatingFlow ? 'CREATING...' : 'CREATE'}
        </button>
        
        <div className="hypr-divider-vertical"></div>
        
        <button
          onClick={onGetAllFlows}
          className="hypr-btn"
          disabled={loading.isLoadingFlows}
          title="Get All Flows [Ctrl+G]"
        >
          {loading.isLoadingFlows ? 'LOADING...' : 'FLOWS'}
        </button>
        
        <button
          onClick={() => onTogglePanel('showQRCodePanel')}
          className={`hypr-btn ${panels.showQRCodePanel ? 'hypr-btn-primary' : ''}`}
          title="QR Code [Ctrl+Q]"
        >
          QR
        </button>
        
        <button
          onClick={() => onTogglePanel('showWebhookSetup')}
          className={`hypr-btn ${panels.showWebhookSetup ? 'hypr-btn-primary' : ''}`}
          title="Webhooks [Ctrl+W]"
        >
          HOOKS
        </button>
        
        <button
          onClick={() => onTogglePanel('showMessageLibrary')}
          className={`hypr-btn ${panels.showMessageLibrary ? 'hypr-btn-primary' : ''}`}
          title="Message Library [Ctrl+M]"
        >
          MSGS
        </button>
        
        <button
          onClick={() => onTogglePanel('showAnalytics')}
          className={`hypr-btn ${panels.showAnalytics ? 'hypr-btn-primary' : ''}`}
          title="Analytics Dashboard [Ctrl+A]"
        >
          STATS
        </button>
      </div>
    </header>
  )
}