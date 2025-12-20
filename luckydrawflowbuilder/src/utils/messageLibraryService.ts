// Local storage-based message library service
import type { MessageLibraryEntry, TriggerConfiguration } from '../types'

const MESSAGES_KEY = 'messageLibrary_messages'
const TRIGGERS_KEY = 'messageLibrary_triggers'

class MessageLibraryService {
  // Message operations
  async getMessages(): Promise<MessageLibraryEntry[]> {
    try {
      const stored = localStorage.getItem(MESSAGES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading messages from localStorage:', error)
      return []
    }
  }

  async saveMessage(message: MessageLibraryEntry): Promise<MessageLibraryEntry> {
    try {
      const messages = await this.getMessages()
      const existingIndex = messages.findIndex(m => m.messageId === message.messageId)
      
      if (existingIndex >= 0) {
        messages[existingIndex] = { ...message, updatedAt: new Date() }
      } else {
        messages.push(message)
      }
      
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
      return message
    } catch (error) {
      console.error('Error saving message to localStorage:', error)
      throw error
    }
  }

  async updateMessage(messageId: string, updates: Partial<MessageLibraryEntry>): Promise<MessageLibraryEntry> {
    try {
      const messages = await this.getMessages()
      const messageIndex = messages.findIndex(m => m.messageId === messageId)
      
      if (messageIndex === -1) {
        throw new Error(`Message with ID ${messageId} not found`)
      }
      
      const updatedMessage = {
        ...messages[messageIndex],
        ...updates,
        updatedAt: new Date()
      }
      
      messages[messageIndex] = updatedMessage
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
      
      return updatedMessage
    } catch (error) {
      console.error('Error updating message in localStorage:', error)
      throw error
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const messages = await this.getMessages()
      const filteredMessages = messages.filter(m => m.messageId !== messageId)
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages))
    } catch (error) {
      console.error('Error deleting message from localStorage:', error)
      throw error
    }
  }

  async publishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.updateMessage(messageId, { status: 'published' })
  }

  async unpublishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.updateMessage(messageId, { status: 'draft' })
  }

  // Trigger operations
  async getTriggers(): Promise<TriggerConfiguration[]> {
    try {
      const stored = localStorage.getItem(TRIGGERS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading triggers from localStorage:', error)
      return []
    }
  }

  async saveTrigger(trigger: TriggerConfiguration): Promise<TriggerConfiguration> {
    try {
      const triggers = await this.getTriggers()
      const existingIndex = triggers.findIndex(t => t.triggerId === trigger.triggerId)
      
      if (existingIndex >= 0) {
        triggers[existingIndex] = { ...trigger, updatedAt: new Date() }
      } else {
        triggers.push(trigger)
      }
      
      localStorage.setItem(TRIGGERS_KEY, JSON.stringify(triggers))
      return trigger
    } catch (error) {
      console.error('Error saving trigger to localStorage:', error)
      throw error
    }
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    try {
      const triggers = await this.getTriggers()
      const filteredTriggers = triggers.filter(t => t.triggerId !== triggerId)
      localStorage.setItem(TRIGGERS_KEY, JSON.stringify(filteredTriggers))
    } catch (error) {
      console.error('Error deleting trigger from localStorage:', error)
      throw error
    }
  }
}

export const messageLibraryService = new MessageLibraryService()