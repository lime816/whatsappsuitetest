import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageSquare, Settings, X, TestTube } from 'lucide-react'
import { useMessageLibraryStore } from '../state/messageLibraryStore'
import MessageList from './MessageLibrary/MessageList'
import MessageEditor from './MessageLibrary/MessageEditor'
import { testSendMessage, debugEnvironment, testWhatsAppAPI } from '../utils/testMessageSender'

type MessageLibraryProps = {
  onClose: () => void
}

export default function MessageLibrary({ onClose }: MessageLibraryProps) {
  const { 
    isEditing, 
    editingMessageId, 
    isLoading,
    loadData,
    startEditing, 
    stopEditing 
  } = useMessageLibraryStore()

  // Load data when component mounts
  useEffect(() => {
    loadData().catch(error => {
      console.error('Failed to load message library data:', error)
    })
  }, [loadData])

  const handleNewMessage = () => {
    startEditing() // Start editing without a specific message ID (new message)
  }

  const handleEditMessage = (messageId: string) => {
    startEditing(messageId)
  }

  const handleCloseEditor = () => {
    stopEditing()
  }

  const handleTestMessage = async () => {
    const phone = prompt('Enter phone number to test (e.g., 918281348343):')
    if (phone) {
      await testSendMessage(phone)
    }
  }

  const handleDebugEnvironment = () => {
    debugEnvironment()
  }

  const handleTestAPI = async () => {
    await testWhatsAppAPI()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex bg-slate-900/95 backdrop-blur-sm"
    >
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Message & Trigger Library</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestMessage}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Test message sending"
            >
              <TestTube className="w-4 h-4" />
              Test Send
            </button>
            
            <button
              onClick={handleTestAPI}
              className="btn-secondary flex items-center gap-2 text-sm"
              title="Test WhatsApp API connection"
            >
              <Settings className="w-4 h-4" />
              Test API
            </button>
            
            <button
              onClick={handleNewMessage}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Message
            </button>
            
            <button
              onClick={onClose}
              className="btn-secondary p-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Message List Panel */}
          <div className={`${isEditing ? 'w-1/2' : 'w-full'} transition-all duration-300 border-r border-slate-700`}>
            <MessageList onEditMessage={handleEditMessage} />
          </div>

          {/* Message Editor Panel */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '50%', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-slate-800 overflow-hidden"
              >
                <MessageEditor 
                  messageId={editingMessageId}
                  onClose={handleCloseEditor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
