import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Hash, Globe, MessageCircle, Save } from 'lucide-react'
import { useMessageLibraryStore } from '../../state/messageLibraryStore'
import type { TriggerType, NextAction, TriggerConfiguration } from '../../types'

type TriggerEditorProps = {
  messageId?: string
}

const triggerTypeOptions = [
  { 
    value: 'keyword_match', 
    label: 'Keyword Match', 
    icon: Hash,
    description: 'Trigger when user sends specific keywords'
  },
  { 
    value: 'api_call', 
    label: 'API Call', 
    icon: Globe,
    description: 'Trigger via external API endpoint'
  },
  { 
    value: 'flow_response', 
    label: 'Flow Response', 
    icon: MessageCircle,
    description: 'Trigger when user responds to interactive message'
  }
]

const nextActionOptions = [
  { value: 'send_message', label: 'Send Message' },
  { value: 'start_flow', label: 'Start Flow' }
]

export default function TriggerEditor({ messageId }: TriggerEditorProps) {
  const { 
    getTriggersByMessageId, 
    addTrigger, 
    updateTrigger, 
    deleteTrigger,
    messages
  } = useMessageLibraryStore()

  const [triggers, setTriggers] = useState<TriggerConfiguration[]>([])
  const [editingTrigger, setEditingTrigger] = useState<Partial<TriggerConfiguration> | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Load triggers when messageId changes
  useEffect(() => {
    if (messageId) {
      const messageTriggers = getTriggersByMessageId(messageId)
      setTriggers(messageTriggers)
    } else {
      setTriggers([])
    }
  }, [messageId, getTriggersByMessageId])

  const handleCreateTrigger = () => {
    if (!messageId) return
    
    setEditingTrigger({
      triggerType: 'keyword_match',
      triggerValue: '',
      nextAction: 'send_message',
      targetId: messageId,
      messageId
    })
    setIsCreating(true)
  }

  const handleEditTrigger = (trigger: TriggerConfiguration) => {
    setEditingTrigger(trigger)
    setIsCreating(false)
  }

  const handleSaveTrigger = () => {
    if (!editingTrigger || !messageId) return

    if (isCreating) {
      addTrigger({
        triggerType: editingTrigger.triggerType as TriggerType,
        triggerValue: editingTrigger.triggerValue as string | string[],
        nextAction: editingTrigger.nextAction as NextAction,
        targetId: editingTrigger.targetId as string,
        messageId
      })
    } else if (editingTrigger.triggerId) {
      updateTrigger(editingTrigger.triggerId, editingTrigger)
    }

    // Refresh triggers list
    const updatedTriggers = getTriggersByMessageId(messageId)
    setTriggers(updatedTriggers)
    
    setEditingTrigger(null)
    setIsCreating(false)
  }

  const handleDeleteTrigger = (triggerId: string) => {
    if (confirm('Are you sure you want to delete this trigger?')) {
      deleteTrigger(triggerId)
      
      // Refresh triggers list
      if (messageId) {
        const updatedTriggers = getTriggersByMessageId(messageId)
        setTriggers(updatedTriggers)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingTrigger(null)
    setIsCreating(false)
  }

  const renderTriggerValueEditor = () => {
    if (!editingTrigger) return null

    switch (editingTrigger.triggerType) {
      case 'keyword_match':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Keywords (comma-separated)
            </label>
            <textarea
              value={Array.isArray(editingTrigger.triggerValue) 
                ? editingTrigger.triggerValue.join(', ') 
                : editingTrigger.triggerValue || ''
              }
              onChange={(e) => {
                const keywords = e.target.value.split(',').map(k => k.trim()).filter(k => k)
                setEditingTrigger({ 
                  ...editingTrigger, 
                  triggerValue: keywords 
                })
              }}
              placeholder="hello, hi, start, help"
              rows={3}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter keywords that will trigger this message. Case-insensitive matching.
            </p>
          </div>
        )

      case 'api_call':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Endpoint Identifier
            </label>
            <input
              type="text"
              value={editingTrigger.triggerValue as string || ''}
              onChange={(e) => setEditingTrigger({ 
                ...editingTrigger, 
                triggerValue: e.target.value 
              })}
              placeholder="unique-endpoint-id"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              A unique identifier that your backend can use to trigger this message via API.
            </p>
          </div>
        )

      case 'flow_response':
        return (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Response Button/Row ID
            </label>
            <input
              type="text"
              value={editingTrigger.triggerValue as string || ''}
              onChange={(e) => setEditingTrigger({ 
                ...editingTrigger, 
                triggerValue: e.target.value 
              })}
              placeholder="button_id or row_id"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              The button ID or row ID from an interactive message that triggers this response.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  if (!messageId) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No Message Selected</h3>
        <p className="text-slate-500 text-sm">
          Please save the message first to configure triggers
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Trigger Configuration</h3>
          <p className="text-sm text-slate-400">
            Configure when and how this message should be triggered
          </p>
        </div>
        
        <button
          onClick={handleCreateTrigger}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Trigger
        </button>
      </div>

      {/* Existing Triggers */}
      {triggers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Existing Triggers</h4>
          {triggers.map((trigger) => {
            const triggerTypeOption = triggerTypeOptions.find(opt => opt.value === trigger.triggerType)
            const IconComponent = triggerTypeOption?.icon || Hash

            return (
              <div
                key={trigger.triggerId}
                className="border border-slate-600 rounded-lg p-4 bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-slate-300" />
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-white">{triggerTypeOption?.label}</h5>
                      <p className="text-sm text-slate-400 mb-2">{triggerTypeOption?.description}</p>
                      
                      <div className="text-xs text-slate-500">
                        <p><strong>Trigger Value:</strong> {
                          Array.isArray(trigger.triggerValue) 
                            ? trigger.triggerValue.join(', ') 
                            : trigger.triggerValue
                        }</p>
                        <p><strong>Action:</strong> {trigger.nextAction.replace('_', ' ')}</p>
                        <p><strong>Target:</strong> {trigger.targetId}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditTrigger(trigger)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Edit trigger"
                    >
                      <Hash className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteTrigger(trigger.triggerId)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete trigger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Trigger Editor Form */}
      {editingTrigger && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-blue-500/30 rounded-lg p-4 bg-blue-500/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-white">
              {isCreating ? 'Create New Trigger' : 'Edit Trigger'}
            </h4>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveTrigger}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              
              <button
                onClick={handleCancelEdit}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Trigger Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Trigger Type
              </label>
              <select
                value={editingTrigger.triggerType}
                onChange={(e) => setEditingTrigger({ 
                  ...editingTrigger, 
                  triggerType: e.target.value as TriggerType,
                  triggerValue: '' // Reset value when type changes
                })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {triggerTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger Value */}
            {renderTriggerValueEditor()}

            {/* Next Action */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Next Action
              </label>
              <select
                value={editingTrigger.nextAction}
                onChange={(e) => setEditingTrigger({ 
                  ...editingTrigger, 
                  nextAction: e.target.value as NextAction 
                })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {nextActionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target ID */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target ID
              </label>
              <input
                type="text"
                value={editingTrigger.targetId || ''}
                onChange={(e) => setEditingTrigger({ 
                  ...editingTrigger, 
                  targetId: e.target.value 
                })}
                placeholder="Message ID or Flow ID"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                {editingTrigger.nextAction === 'send_message' 
                  ? 'The ID of the message to send when triggered'
                  : 'The ID of the flow to start when triggered'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {triggers.length === 0 && !editingTrigger && (
        <div className="text-center py-12">
          <Hash className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-400 mb-2">No Triggers Configured</h3>
          <p className="text-slate-500 text-sm mb-4">
            Add triggers to define when this message should be sent
          </p>
          <button
            onClick={handleCreateTrigger}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create First Trigger
          </button>
        </div>
      )}
    </div>
  )
}
