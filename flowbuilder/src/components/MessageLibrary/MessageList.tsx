import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Edit3, 
  Copy, 
  Trash2, 
  MessageSquare, 
  List, 
  Zap, 
  Play, 
  CheckCircle, 
  XCircle,
  MousePointer
} from 'lucide-react'
import { useMessageLibraryStore } from '../../state/messageLibraryStore'
import type { MessageType, MessageStatus } from '../../types'

type MessageListProps = {
  onEditMessage: (messageId: string) => void
}

const messageTypeIcons = {
  standard_text: MessageSquare,
  interactive_button: MousePointer,
  interactive_list: List,
  flow_starter: Play
}

const messageTypeLabels = {
  standard_text: 'Standard Text',
  interactive_button: 'Interactive Buttons',
  interactive_list: 'Interactive List',
  flow_starter: 'Flow Starter'
}

const statusColors = {
  draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30'
}
export default function MessageList({ onEditMessage }: MessageListProps) {
  const { 
    messages, 
    selectedMessageId,
    deleteMessage, 
    duplicateMessage, 
    selectMessage,
    publishMessage,
    unpublishMessage,
    getTriggersByMessageId 
  } = useMessageLibraryStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<MessageType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter messages based on search and filters
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         messageTypeLabels[message.type].toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || message.type === filterType
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleDelete = (messageId: string, messageName: string) => {
    if (confirm(`Are you sure you want to delete "${messageName}"? This action cannot be undone.`)) {
      deleteMessage(messageId)
    }
  }

  const handleDuplicate = (messageId: string) => {
    duplicateMessage(messageId)
  }

  const handleEdit = (messageId: string) => {
    selectMessage(messageId)
    onEditMessage(messageId)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search and Filters */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-3"
          >
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as MessageType | 'all')}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="standard_text">Standard Text</option>
              <option value="interactive_button">Interactive Buttons</option>
              <option value="interactive_list">Interactive List</option>
              <option value="flow_starter">Flow Starter</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as MessageStatus | 'all')}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </motion.div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400 mb-2">
              {messages.length === 0 ? 'No messages yet' : 'No messages found'}
            </h3>
            <p className="text-slate-500 text-sm">
              {messages.length === 0 
                ? 'Create your first message to get started' 
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => {
              const IconComponent = messageTypeIcons[message.type]
              const triggers = getTriggersByMessageId(message.messageId)
              const isSelected = selectedMessageId === message.messageId

              return (
                <motion.div
                  key={message.messageId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 bg-slate-800 border rounded-lg hover:border-slate-600 transition-all cursor-pointer ${
                    isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700'
                  }`}
                  onClick={() => selectMessage(message.messageId)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-slate-300" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{message.name}</h3>
                        <p className="text-sm text-slate-400">{messageTypeLabels[message.type]}</p>
                        
                        {/* Trigger info */}
                        {triggers.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-slate-500">
                              {triggers.length} trigger{triggers.length !== 1 ? 's' : ''} configured
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[message.status]}`}>
                        {message.status}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEdit(message.messageId)
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                          title="Edit message"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(message.messageId)
                          }}
                          className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                          title="Duplicate message"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Publish/Unpublish Button */}
                        {message.status === 'draft' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              publishMessage(message.messageId)
                            }}
                            className="p-1.5 text-slate-400 hover:text-green-400 hover:bg-green-500/20 rounded transition-colors"
                            title="Publish message"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              unpublishMessage(message.messageId)
                            }}
                            className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded transition-colors"
                            title="Unpublish message"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(message.messageId, message.name)
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview content */}
                  <div className="text-sm text-slate-500 line-clamp-2">
                    {message.type === 'standard_text' && (
                      <span>{(message.contentPayload as any).body}</span>
                    )}
                    {message.type === 'interactive_button' && (
                      <span>{(message.contentPayload as any).body}</span>
                    )}
                    {message.type === 'interactive_list' && (
                      <span>{(message.contentPayload as any).body}</span>
                    )}
                    {message.type === 'flow_starter' && (
                      <span>{(message.contentPayload as any).message}</span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                    <span>Created {new Date(message.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(message.updatedAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
