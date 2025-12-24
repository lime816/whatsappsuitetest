import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import JsonPreviewPanel from './JsonPreviewPanel'
import WhatsAppPreview from './WhatsAppPreview'
import FlowXPPanel from './FlowXPPanel'
import FlowPreviewPane from './FlowPreviewPane'
import QRFlowInitiator from './QRFlowInitiator'
import WebhookSetup from './WebhookSetup'
import MessageLibrary from './MessageLibrary'
import Analytics from './Analytics'
import { useFlowStore } from '../state/store'
import { useMessageLibraryStore } from '../state/messageLibraryStore'
import { buildFlowJson } from '../utils/jsonBuilder'
import { AppState } from '../state/appState'
import { FlowService } from '../utils/flowService'
import { QrCode, Globe, BarChart3 } from 'lucide-react'

interface AppModalsProps {
  state: AppState
  flowService: FlowService
  onSetPanel: (panel: keyof AppState['panels'], value: boolean) => void
  onSetPreviewFlow: (flowId: string, flowName: string) => void
}

export default function AppModals({ state, flowService, onSetPanel, onSetPreviewFlow }: AppModalsProps) {
  const { screens } = useFlowStore()
  const { messages } = useMessageLibraryStore()
  const { panels, flows, form } = state

  const businessPhoneNumber = import.meta.env.VITE_WHATSAPP_BUSINESS_NUMBER || '15550617327'

  const handleSendActiveFlow = async (customerPhoneNumber: string) => {
    if (!flows.activeFlowId) {
      return false
    }

    return await flowService.sendFlowToUser({
      phoneNumber: customerPhoneNumber,
      flowId: flows.activeFlowId,
      message: form.customMessage || 'Thank you for contacting us! Please complete this form to continue.'
    })
  }

  return (
    <>
      {/* JSON Preview Panel */}
      <AnimatePresence>
        {panels.showJsonPreview && (
          <JsonPreviewPanel 
            json={buildFlowJson(screens)} 
            onClose={() => onSetPanel('showJsonPreview', false)}
          />
        )}
      </AnimatePresence>

      {/* WhatsApp Preview Panel */}
      <AnimatePresence>
        {panels.showWhatsAppPreview && (
          <WhatsAppPreview 
            screens={screens} 
            onClose={() => onSetPanel('showWhatsAppPreview', false)}
          />
        )}
      </AnimatePresence>

      {/* FlowXP Modal */}
      <AnimatePresence>
        {panels.showFlowXP && (
          <FlowXPPanel 
            onClose={() => onSetPanel('showFlowXP', false)} 
            availableFlows={flows.allFlows}
            availableMessages={messages}
          />
        )}
      </AnimatePresence>

      {/* Flow Preview Pane */}
      <AnimatePresence>
        {panels.showFlowPreview && flows.previewFlowId && (
          <FlowPreviewPane
            flowId={flows.previewFlowId}
            flowName={flows.previewFlowName}
            onClose={() => {
              onSetPanel('showFlowPreview', false)
              onSetPreviewFlow('', '')
            }}
          />
        )}
      </AnimatePresence>

      {/* QR Code Generator Panel */}
      <AnimatePresence>
        {panels.showQRCodePanel && (
          <QRCodePanel
            businessPhoneNumber={businessPhoneNumber}
            activeFlowId={flows.activeFlowId}
            allFlows={flows.allFlows}
            flowActivationMessages={flows.flowActivationMessages}
            onFlowTrigger={handleSendActiveFlow}
            onClose={() => onSetPanel('showQRCodePanel', false)}
          />
        )}
      </AnimatePresence>

      {/* Webhook Setup Panel */}
      <AnimatePresence>
        {panels.showWebhookSetup && (
          <WebhookPanel
            flows={flows.allFlows}
            onClose={() => onSetPanel('showWebhookSetup', false)}
          />
        )}
      </AnimatePresence>

      {/* Message Library Panel */}
      <AnimatePresence>
        {panels.showMessageLibrary && (
          <MessageLibrary 
            onClose={() => onSetPanel('showMessageLibrary', false)}
          />
        )}
      </AnimatePresence>

      {/* Analytics Panel */}
      <AnimatePresence>
        {panels.showAnalytics && (
          <Analytics 
            onClose={() => onSetPanel('showAnalytics', false)}
          />
        )}
      </AnimatePresence>

      {/* Flows Management Panel */}
      <AnimatePresence>
        {panels.showFlowsPanel && (
          <FlowsPanel
            flows={flows.allFlows}
            flowService={flowService}
            onClose={() => onSetPanel('showFlowsPanel', false)}
            onPreviewFlow={onSetPreviewFlow}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// Wrapper components for cleaner modal management
function QRCodePanel({ businessPhoneNumber, activeFlowId, allFlows, flowActivationMessages, onFlowTrigger, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              WhatsApp Flow QR Code Generator
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <QRFlowInitiator 
              businessPhoneNumber={businessPhoneNumber}
              activeFlowId={activeFlowId}
              allFlows={allFlows}
              flowActivationMessages={flowActivationMessages}
              onFlowTrigger={onFlowTrigger}
              onCopySuccess={() => {}} // Handle in parent
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function WebhookPanel({ flows, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              Webhook Setup & Backend Integration
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6">
            <WebhookSetup flows={flows} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function FlowsPanel({ flows, flowService, onClose, onPreviewFlow }: any) {
  const handleApproveFlow = async (flowId: string) => {
    await flowService.approveFlow(flowId)
  }

  const handleFlowDetails = async (flowId: string) => {
    await flowService.getFlowDetails(flowId)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full max-h-[80vh]">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">
              WhatsApp Flows Management
            </h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {flows.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  No Flows Found
                </h4>
                <p className="text-gray-600">
                  No flows have been created yet. Create your first flow using the builder above!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Found {flows.length} flow{flows.length !== 1 ? 's' : ''}
                </div>
                
                {flows.map((flow: any, index: number) => (
                  <div
                    key={flow.id || index}
                    className="border border-gray-200 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-semibold text-gray-800">
                          {flow.name || 'Unnamed Flow'}
                        </h5>
                        <p className="text-sm text-gray-600">ID: {flow.id}</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={`font-medium ${
                            flow.status === 'PUBLISHED' ? 'text-green-600' :
                            flow.status === 'DRAFT' ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {flow.status}
                          </span>
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => onPreviewFlow(flow.id, flow.name || 'Unnamed Flow')}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                          👁️ Preview
                        </button>
                        
                        <button
                          onClick={() => handleFlowDetails(flow.id)}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
                        >
                          📝 Details
                        </button>
                        
                        {flow.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleApproveFlow(flow.id)}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
                          >
                            ✅ Approve
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {flow.created_time && (
                      <div className="text-xs text-gray-500 border-t pt-2">
                        Created: {new Date(flow.created_time * 1000).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}