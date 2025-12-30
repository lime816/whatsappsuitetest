import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, GripVertical, Eye, Send, MessageSquare, Workflow } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface FlowXPPanelProps {
  onClose: () => void
  availableFlows?: any[]
  availableMessages?: any[]
}

interface MessageStep {
  id: string
  type: 'flow' | 'message'
  name: string
  content: string
  delay?: number // delay in seconds before sending
}

function SortableMessageStep({ step, onRemove, onEdit }: { step: MessageStep; onRemove: () => void; onEdit: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-cyan-500 transition-all"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-300"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {step.type === 'flow' ? (
              <Workflow className="w-4 h-4 text-cyan-400" />
            ) : (
              <MessageSquare className="w-4 h-4 text-whatsapp-500" />
            )}
            <span className="text-xs font-semibold text-slate-400 uppercase">
              {step.type === 'flow' ? 'WhatsApp Flow' : 'Message'}
            </span>
          </div>
          <h4 className="font-semibold text-slate-200 mb-1">{step.name}</h4>
          <p className="text-sm text-slate-400 line-clamp-2">{step.content}</p>
          {step.delay && step.delay > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              ⏱️ Delay: {step.delay}s after previous message
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FlowXPPanel({ onClose, availableFlows = [], availableMessages = [] }: FlowXPPanelProps) {
  const [messageSteps, setMessageSteps] = useState<MessageStep[]>([])
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showFlowSelector, setShowFlowSelector] = useState(false)
  const [showMessageSelector, setShowMessageSelector] = useState(false)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = messageSteps.findIndex(s => s.id === active.id)
    const newIndex = messageSteps.findIndex(s => s.id === over.id)

    const newSteps = [...messageSteps]
    const [movedItem] = newSteps.splice(oldIndex, 1)
    newSteps.splice(newIndex, 0, movedItem)
    setMessageSteps(newSteps)
  }

  const addMessageStep = (type: 'flow' | 'message') => {
    if (type === 'flow') {
      setShowFlowSelector(true)
    } else {
      setShowMessageSelector(true)
    }
    setShowAddMenu(false)
  }

  const addFlow = (flow: any) => {
    const newStep: MessageStep = {
      id: Date.now().toString(),
      type: 'flow',
      name: flow.name || flow.title || 'Flow',
      content: flow.description || 'Interactive WhatsApp Flow',
      delay: 0
    }
    setMessageSteps([...messageSteps, newStep])
    setShowFlowSelector(false)
  }

  const addMessage = (message: any) => {
    // Extract content based on message type
    let content = 'Message content'
    if (message.contentPayload) {
      if (message.contentPayload.body) {
        content = message.contentPayload.body
      } else if (message.contentPayload.message) {
        content = message.contentPayload.message
      }
    }
    
    const newStep: MessageStep = {
      id: Date.now().toString(),
      type: 'message',
      name: message.name || 'Message',
      content: content,
      delay: 0
    }
    setMessageSteps([...messageSteps, newStep])
    setShowMessageSelector(false)
  }

  const removeStep = (id: string) => {
    setMessageSteps(messageSteps.filter(s => s.id !== id))
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
        className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-slate-800 border-l border-slate-600 shadow-2xl z-[9999] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-600 bg-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-200">Flow Experience (FlowXP)</h2>
            <p className="text-sm text-slate-400">Configure message sending sequence</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 border border-slate-500 text-slate-200 rounded-lg hover:bg-slate-500 hover:border-cyan-500 transition-all shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">{showPreview ? 'Hide' : 'Show'} Preview</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Sequence Builder */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-200">Message Sequence</h3>
                <div className="relative">
                  <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Step</span>
                  </button>

                  {showAddMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-600 py-2 z-10">
                      <button
                        onClick={() => addMessageStep('message')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-whatsapp-500" />
                        <span className="text-sm font-medium text-slate-200">Add Message</span>
                      </button>
                      <button
                        onClick={() => addMessageStep('flow')}
                        className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Workflow className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium text-slate-200">Add Flow</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={messageSteps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {messageSteps.map((step, index) => (
                      <div key={step.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-cyan-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div className="h-px flex-1 bg-slate-600"></div>
                        </div>
                        <SortableMessageStep
                          step={step}
                          onRemove={() => removeStep(step.id)}
                          onEdit={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {messageSteps.length === 0 && (
                <div className="text-center py-12 bg-slate-800 rounded-lg border-2 border-dashed border-slate-600">
                  <Send className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-300 font-medium">No messages added yet</p>
                  <p className="text-sm text-slate-500">Click "Add Step" to get started</p>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {showPreview && (
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">WhatsApp Preview</h3>
                <div className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl p-4 shadow-inner">
                  <div className="bg-slate-600 rounded-lg p-4 min-h-[500px] max-h-[600px] overflow-y-auto">
                    {messageSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="mb-3"
                      >
                        <div className="bg-slate-800 rounded-lg rounded-tl-none p-3 shadow-sm max-w-[80%]">
                          <div className="flex items-center gap-2 mb-1">
                            {step.type === 'flow' ? (
                              <Workflow className="w-3 h-3 text-cyan-400" />
                            ) : (
                              <MessageSquare className="w-3 h-3 text-whatsapp-500" />
                            )}
                            <span className="text-xs font-semibold text-slate-400">
                              {step.type === 'flow' ? 'Interactive Flow' : 'Message'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-200">{step.content}</p>
                          {step.type === 'flow' && (
                            <button className="mt-2 w-full bg-cyan-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                              Open {step.name}
                            </button>
                          )}
                          <div className="text-xs text-slate-500 mt-1 text-right">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Flow Selector Modal */}
        <AnimatePresence>
          {showFlowSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-600"
              >
                <div className="p-5 border-b border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-200">Select a Flow</h3>
                    <button
                      onClick={() => setShowFlowSelector(false)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                  {availableFlows.length === 0 ? (
                    <div className="text-center py-12">
                      <Workflow className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">No flows available</p>
                      <p className="text-sm text-slate-500">Create a flow first in Manage Flows</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {availableFlows.map((flow) => (
                        <button
                          key={flow.id}
                          onClick={() => addFlow(flow)}
                          className="text-left p-4 border-2 border-slate-600 rounded-lg hover:border-cyan-500 hover:bg-slate-700 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <Workflow className="w-5 h-5 text-cyan-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-200">{flow.name || flow.title}</h4>
                              <p className="text-sm text-slate-400 mt-1">{flow.description || 'WhatsApp Flow'}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Message Selector Modal */}
        <AnimatePresence>
          {showMessageSelector && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000] p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-600"
              >
                <div className="p-5 border-b border-slate-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-200">Select a Message</h3>
                    <button
                      onClick={() => setShowMessageSelector(false)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                  {availableMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-300 font-medium">No messages available</p>
                      <p className="text-sm text-slate-500">Create a message first in Message Library</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {availableMessages.map((message) => {
                        const content = message.contentPayload?.body || message.contentPayload?.message || 'No content'
                        const typeLabel = message.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Message'
                        
                        return (
                          <button
                            key={message.messageId}
                            onClick={() => addMessage(message)}
                            className="text-left p-4 border-2 border-slate-600 rounded-lg hover:border-whatsapp-500 hover:bg-slate-700 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <MessageSquare className="w-5 h-5 text-whatsapp-500 mt-1" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-200">{message.name || 'Message'}</h4>
                                  <span className="text-xs px-2 py-0.5 bg-whatsapp-600 text-whatsapp-100 rounded-full">
                                    {typeLabel}
                                  </span>
                                  {message.status === 'published' && (
                                    <span className="text-xs px-2 py-0.5 bg-cyan-600 text-cyan-100 rounded-full">
                                      Published
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{content}</p>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="p-5 border-t border-slate-600 bg-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <span className="font-semibold">{messageSteps.length}</span> message{messageSteps.length !== 1 ? 's' : ''} in sequence
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-600 text-slate-200 rounded-lg hover:bg-slate-500 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all shadow-md font-medium"
              >
                Save Sequence
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
