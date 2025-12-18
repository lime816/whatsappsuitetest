import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import { messageLibraryService } from '../utils/messageLibraryApiService'
import type { 
  MessageLibraryEntry, 
  TriggerConfiguration, 
  MessageType, 
  MessageStatus,
  TriggerType,
  NextAction,
  MessageContentPayload,
  StandardTextContent,
  InteractiveButtonContent,
  InteractiveListContent,
  FlowStarterContent
} from '../types'

export type MessageLibraryState = {
  messages: MessageLibraryEntry[]
  triggers: TriggerConfiguration[]
  selectedMessageId?: string
  isEditing: boolean
  editingMessageId?: string
  isLoading: boolean
  
  // Message CRUD operations
  addMessage: (message: Omit<MessageLibraryEntry, 'messageId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateMessage: (messageId: string, updates: Partial<MessageLibraryEntry>) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  selectMessage: (messageId: string) => void
  duplicateMessage: (messageId: string) => Promise<void>
  publishMessage: (messageId: string) => Promise<void>
  unpublishMessage: (messageId: string) => Promise<void>
  loadData: () => Promise<void>
  
  // Trigger CRUD operations
  addTrigger: (trigger: Omit<TriggerConfiguration, 'triggerId' | 'createdAt' | 'updatedAt'>) => void
  updateTrigger: (triggerId: string, updates: Partial<TriggerConfiguration>) => void
  deleteTrigger: (triggerId: string) => void
  getTriggersByMessageId: (messageId: string) => TriggerConfiguration[]
  
  // Editor state management
  startEditing: (messageId?: string) => void
  stopEditing: () => void
  
  // Utility functions
  getMessageById: (messageId: string) => MessageLibraryEntry | undefined
  getMessagesByType: (type: MessageType) => MessageLibraryEntry[]
  getMessagesByStatus: (status: MessageStatus) => MessageLibraryEntry[]
}

// Helper function to create default content based on message type
const createDefaultContent = (type: MessageType): MessageContentPayload => {
  switch (type) {
    case 'standard_text':
      return {
        body: 'Your message content here...'
      } as StandardTextContent
    
    case 'interactive_button':
      return {
        header: 'Header Text',
        body: 'Your message body here...',
        footer: 'Footer Text',
        buttons: [
          { id: nanoid(6), title: 'Button 1', buttonId: 'btn_1' },
          { id: nanoid(6), title: 'Button 2', buttonId: 'btn_2' }
        ]
      } as InteractiveButtonContent
    
    case 'interactive_list':
      return {
        header: 'Header Text',
        body: 'Your message body here...',
        footer: 'Footer Text',
        buttonText: 'View Options',
        sections: [
          {
            title: 'Section 1',
            rows: [
              { id: nanoid(6), title: 'Option 1', rowId: 'opt_1', description: 'Description for option 1' },
              { id: nanoid(6), title: 'Option 2', rowId: 'opt_2', description: 'Description for option 2' }
            ]
          }
        ]
      } as InteractiveListContent
    
    case 'flow_starter':
      return {
        flowId: '',
        message: 'Please complete this form to continue.'
      } as FlowStarterContent
    
    default:
      return { body: 'Default message content' } as StandardTextContent
  }
}

export const useMessageLibraryStore = create<MessageLibraryState>((set, get) => ({
  messages: [],
  triggers: [],
  selectedMessageId: undefined,
  isEditing: false,
  editingMessageId: undefined,
  isLoading: false,

  addMessage: async (messageData) => {
    const messageId = nanoid(10)
    const now = new Date()
    
    const newMessage: MessageLibraryEntry = {
      ...messageData,
      messageId,
      createdAt: now,
      updatedAt: now
    }
    
    try {
      await messageLibraryService.saveMessage(newMessage)
      set(state => ({
        messages: [...state.messages, newMessage],
        selectedMessageId: messageId
      }))
    } catch (error) {
      console.error('Failed to add message:', error)
      throw error
    }
  },

  updateMessage: async (messageId, updates) => {
    try {
      const updatedMessage = await messageLibraryService.updateMessage(messageId, updates)
      set(state => ({
        messages: state.messages.map(msg => 
          msg.messageId === messageId ? updatedMessage : msg
        )
      }))
    } catch (error) {
      console.error('Failed to update message:', error)
      throw error
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await messageLibraryService.deleteMessage(messageId)
      set(state => {
        const updatedTriggers = state.triggers.filter(trigger => trigger.messageId !== messageId)
        const updatedMessages = state.messages.filter(msg => msg.messageId !== messageId)
        
        return {
          messages: updatedMessages,
          triggers: updatedTriggers,
          selectedMessageId: state.selectedMessageId === messageId ? undefined : state.selectedMessageId,
          editingMessageId: state.editingMessageId === messageId ? undefined : state.editingMessageId
        }
      })
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error
    }
  },

  selectMessage: (messageId) => set({ selectedMessageId: messageId }),

  duplicateMessage: async (messageId) => {
    const originalMessage = get().messages.find(msg => msg.messageId === messageId)
    if (!originalMessage) return
    
    const newMessageId = nanoid(10)
    const now = new Date()
    
    const duplicatedMessage: MessageLibraryEntry = {
      ...originalMessage,
      messageId: newMessageId,
      name: `${originalMessage.name} (Copy)`,
      status: 'draft' as MessageStatus,
      createdAt: now,
      updatedAt: now
    }
    
    try {
      await messageLibraryService.saveMessage(duplicatedMessage)
      set(state => ({
        messages: [...state.messages, duplicatedMessage],
        selectedMessageId: newMessageId
      }))
    } catch (error) {
      console.error('Failed to duplicate message:', error)
      throw error
    }
  },

  publishMessage: async (messageId) => {
    try {
      const updatedMessage = await messageLibraryService.publishMessage(messageId)
      set(state => ({
        messages: state.messages.map(msg => 
          msg.messageId === messageId ? updatedMessage : msg
        )
      }))
    } catch (error) {
      console.error('Failed to publish message:', error)
      throw error
    }
  },

  unpublishMessage: async (messageId) => {
    try {
      const updatedMessage = await messageLibraryService.unpublishMessage(messageId)
      set(state => ({
        messages: state.messages.map(msg => 
          msg.messageId === messageId ? updatedMessage : msg
        )
      }))
    } catch (error) {
      console.error('Failed to unpublish message:', error)
      throw error
    }
  },

  addTrigger: (triggerData) => {
    const triggerId = nanoid(10)
    const now = new Date()
    
    const newTrigger: TriggerConfiguration = {
      ...triggerData,
      triggerId,
      createdAt: now,
      updatedAt: now
    }
    
    set(state => ({
      triggers: [...state.triggers, newTrigger]
    }))
  },

  updateTrigger: (triggerId, updates) => {
    set(state => ({
      triggers: state.triggers.map(trigger => 
        trigger.triggerId === triggerId 
          ? { ...trigger, ...updates, updatedAt: new Date() }
          : trigger
      )
    }))
  },

  deleteTrigger: (triggerId) => {
    set(state => ({
      triggers: state.triggers.filter(trigger => trigger.triggerId !== triggerId)
    }))
  },

  getTriggersByMessageId: (messageId) => {
    const state = get()
    return state.triggers.filter(trigger => trigger.messageId === messageId)
  },

  startEditing: (messageId) => set({ 
    isEditing: true, 
    editingMessageId: messageId,
    selectedMessageId: messageId 
  }),

  stopEditing: () => set({ 
    isEditing: false, 
    editingMessageId: undefined 
  }),

  loadData: async () => {
    set({ isLoading: true })
    try {
      const [messages, triggers] = await Promise.all([
        messageLibraryService.getMessages(),
        messageLibraryService.getTriggers()
      ])
      
      set({
        messages,
        triggers,
        isLoading: false
      })
    } catch (error) {
      console.error('Failed to load data:', error)
      set({ isLoading: false })
      throw error
    }
  },

  getMessageById: (messageId) => {
    const state = get()
    return state.messages.find(msg => msg.messageId === messageId)
  },

  getMessagesByType: (type) => {
    const state = get()
    return state.messages.filter(msg => msg.type === type)
  },

  getMessagesByStatus: (status) => {
    const state = get()
    return state.messages.filter(msg => msg.status === status)
  }
}))

// Helper function to create a new message with default values
export const createNewMessage = (type: MessageType, name: string): Omit<MessageLibraryEntry, 'messageId' | 'createdAt' | 'updatedAt'> => ({
  name,
  type,
  contentPayload: createDefaultContent(type),
  status: 'draft'
})
