import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, MessageSquare, MousePointer, List, Play, Settings } from 'lucide-react'
import { useMessageLibraryStore, createNewMessage } from '../../state/messageLibraryStore'
import type { MessageType, MessageStatus, MessageLibraryEntry } from '../../types'
import StandardTextEditor from './MessageEditor/StandardTextEditor'
import InteractiveButtonEditor from './MessageEditor/InteractiveButtonEditor'
import InteractiveListEditor from './MessageEditor/InteractiveListEditor'
import FlowStarterEditor from './MessageEditor/FlowStarterEditor'
import TriggerEditor from './TriggerEditor'

type MessageEditorProps = {
  messageId?: string
  onClose: () => void
}

const messageTypeOptions = [
  { value: 'standard_text', label: 'Standard Text', icon: MessageSquare },
  { value: 'interactive_button', label: 'Interactive Buttons', icon: MousePointer },
  { value: 'interactive_list', label: 'Interactive List', icon: List },
  { value: 'flow_starter', label: 'Flow Starter', icon: Play }
]

export default function MessageEditor({ messageId, onClose }: MessageEditorProps) {
  const { 
    getMessageById, 
    addMessage, 
    updateMessage,
    getTriggersByMessageId
  } = useMessageLibraryStore()

  const [activeTab, setActiveTab] = useState<'message' | 'triggers'>('message')
  const [formData, setFormData] = useState<Partial<MessageLibraryEntry>>({
    name: '',
    type: 'standard_text',
    status: 'draft',
    contentPayload: { body: '' }
  })

  // Removed send after save feature - messages should be triggered by user interactions

  const isEditing = !!messageId
  const existingMessage = messageId ? getMessageById(messageId) : null
  const triggers = messageId ? getTriggersByMessageId(messageId) : []

  // Load existing message data
  useEffect(() => {
    if (existingMessage) {
      setFormData(existingMessage)
    } else {
      // Reset form for new message
      setFormData({
        name: '',
        type: 'standard_text',
        status: 'draft',
        contentPayload: { body: '' }
      })
    }
  }, [existingMessage])

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert('Please enter a message name')
      return
    }

    if (isEditing && messageId) {
      updateMessage(messageId, formData)
    } else {
      const newMessageData = createNewMessage(
        formData.type as MessageType,
        formData.name
      )
      addMessage({
        ...newMessageData,
        ...formData
      })
    }

    onClose()
  }

  const handleTypeChange = (newType: MessageType) => {
    const newMessage = createNewMessage(newType, formData.name || '')
    setFormData({
      ...formData,
      type: newType,
      contentPayload: newMessage.contentPayload
    })
  }

  const handleContentChange = (newContent: any) => {
    setFormData({
      ...formData,
      contentPayload: newContent
    })
  }

  const renderContentEditor = () => {
    switch (formData.type) {
      case 'standard_text':
        return (
          <StandardTextEditor
            content={formData.contentPayload as any}
            onChange={handleContentChange}
          />
        )
      case 'interactive_button':
        return (
          <InteractiveButtonEditor
            content={formData.contentPayload as any}
            onChange={handleContentChange}
          />
        )
      case 'interactive_list':
        return (
          <InteractiveListEditor
            content={formData.contentPayload as any}
            onChange={handleContentChange}
          />
        )
      case 'flow_starter':
        return (
          <FlowStarterEditor
            content={formData.contentPayload as any}
            onChange={handleContentChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">
          {isEditing ? 'Edit Message' : 'New Message'}
        </h2>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <button
            onClick={onClose}
            className="btn-secondary p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('message')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'message'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Message Content
        </button>
        
        <button
          onClick={() => setActiveTab('triggers')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'triggers'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Trigger Configuration
          {triggers.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
              {triggers.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'message' ? (
          <div className="p-4 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter a descriptive name for this message"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Message Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as MessageType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {messageTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as MessageStatus })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-4">Message Content</h3>
              {renderContentEditor()}
            </div>

            {/* Messages are sent automatically when triggers match incoming messages */}
          </div>
        ) : (
          <TriggerEditor messageId={messageId} />
        )}
      </div>
    </div>
  )
}
