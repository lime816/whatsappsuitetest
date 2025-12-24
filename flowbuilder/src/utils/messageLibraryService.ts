// Database-backed message library service via backend API
import type { MessageLibraryEntry, TriggerConfiguration } from '../types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

class MessageLibraryService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api/message-library`
  }

  // Message operations
  async getMessages(): Promise<MessageLibraryEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const messages = await response.json()
      
      // Transform database format to frontend format
      return messages.map(this.transformDbMessageToFrontend)
    } catch (error) {
      console.error('Error loading messages from backend:', error)
      // Fallback to localStorage for offline support
      return this.getMessagesFromLocalStorage()
    }
  }

  async saveMessage(message: MessageLibraryEntry): Promise<MessageLibraryEntry> {
    try {
      // Transform frontend format to database format
      const dbMessage = this.transformFrontendMessageToDb(message)
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbMessage)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const savedMessage = await response.json()
      const transformedMessage = this.transformDbMessageToFrontend(savedMessage)
      
      // Also save to localStorage as backup
      this.saveMessageToLocalStorage(transformedMessage)
      
      return transformedMessage
    } catch (error) {
      console.error('Error saving message to backend:', error)
      // Fallback to localStorage
      return this.saveMessageToLocalStorage(message)
    }
  }

  async updateMessage(messageId: string, updates: Partial<MessageLibraryEntry>): Promise<MessageLibraryEntry> {
    try {
      // Find the message first to get the database ID
      const messages = await this.getMessages()
      const existingMessage = messages.find(m => m.messageId === messageId)
      
      if (!existingMessage) {
        throw new Error(`Message with ID ${messageId} not found`)
      }
      
      // Transform updates to database format
      const dbUpdates = this.transformFrontendMessageToDb({ ...existingMessage, ...updates })
      
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbUpdates)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const updatedMessage = await response.json()
      const transformedMessage = this.transformDbMessageToFrontend(updatedMessage)
      
      // Update localStorage backup
      this.updateMessageInLocalStorage(messageId, updates)
      
      return transformedMessage
    } catch (error) {
      console.error('Error updating message in backend:', error)
      // Fallback to localStorage
      return this.updateMessageInLocalStorage(messageId, updates)
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Also remove from localStorage
      this.deleteMessageFromLocalStorage(messageId)
    } catch (error) {
      console.error('Error deleting message from backend:', error)
      // Fallback to localStorage
      this.deleteMessageFromLocalStorage(messageId)
      throw error
    }
  }

  async publishMessage(messageId: string): Promise<MessageLibraryEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const publishedMessage = await response.json()
      return this.transformDbMessageToFrontend(publishedMessage)
    } catch (error) {
      console.error('Error publishing message:', error)
      return this.updateMessage(messageId, { status: 'published' })
    }
  }

  async unpublishMessage(messageId: string): Promise<MessageLibraryEntry> {
    try {
      const response = await fetch(`${this.baseUrl}/messages/${messageId}/unpublish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const unpublishedMessage = await response.json()
      return this.transformDbMessageToFrontend(unpublishedMessage)
    } catch (error) {
      console.error('Error unpublishing message:', error)
      return this.updateMessage(messageId, { status: 'draft' })
    }
  }

  // Trigger operations
  async getTriggers(): Promise<TriggerConfiguration[]> {
    try {
      const response = await fetch(`${this.baseUrl}/triggers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const triggers = await response.json()
      return triggers.map(this.transformDbTriggerToFrontend)
    } catch (error) {
      console.error('Error loading triggers from backend:', error)
      return this.getTriggersFromLocalStorage()
    }
  }

  async saveTrigger(trigger: TriggerConfiguration): Promise<TriggerConfiguration> {
    try {
      const dbTrigger = this.transformFrontendTriggerToDb(trigger)
      
      const response = await fetch(`${this.baseUrl}/triggers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbTrigger)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const savedTrigger = await response.json()
      const transformedTrigger = this.transformDbTriggerToFrontend(savedTrigger)
      
      // Save to localStorage as backup
      this.saveTriggerToLocalStorage(transformedTrigger)
      
      return transformedTrigger
    } catch (error) {
      console.error('Error saving trigger to backend:', error)
      return this.saveTriggerToLocalStorage(trigger)
    }
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/triggers/${triggerId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      this.deleteTriggerFromLocalStorage(triggerId)
    } catch (error) {
      console.error('Error deleting trigger from backend:', error)
      this.deleteTriggerFromLocalStorage(triggerId)
      throw error
    }
  }

  // Transform functions between frontend and database formats
  private transformDbMessageToFrontend(dbMessage: any): MessageLibraryEntry {
    return {
      messageId: dbMessage.messageId,
      name: dbMessage.name,
      type: dbMessage.type.toLowerCase().replace(/_/g, '_') as any,
      status: dbMessage.status.toLowerCase() as any,
      contentPayload: dbMessage.contentPayload,
      category: dbMessage.category,
      tags: dbMessage.tags || [],
      createdAt: new Date(dbMessage.createdAt),
      updatedAt: new Date(dbMessage.updatedAt)
    }
  }

  private transformFrontendMessageToDb(frontendMessage: MessageLibraryEntry): any {
    return {
      messageId: frontendMessage.messageId,
      name: frontendMessage.name,
      type: frontendMessage.type.toUpperCase(),
      status: frontendMessage.status.toUpperCase(),
      contentPayload: frontendMessage.contentPayload,
      category: frontendMessage.category,
      tags: frontendMessage.tags || []
    }
  }

  private transformDbTriggerToFrontend(dbTrigger: any): TriggerConfiguration {
    return {
      triggerId: dbTrigger.triggerId,
      triggerType: dbTrigger.triggerType.toLowerCase().replace(/_/g, '_') as any,
      triggerValue: dbTrigger.triggerValue,
      nextAction: dbTrigger.nextAction as any,
      targetId: dbTrigger.targetId,
      messageId: dbTrigger.messageTemplateId,
      isActive: dbTrigger.isActive,
      priority: dbTrigger.priority || 0,
      conditions: dbTrigger.conditions,
      createdAt: new Date(dbTrigger.createdAt),
      updatedAt: new Date(dbTrigger.updatedAt)
    }
  }

  private transformFrontendTriggerToDb(frontendTrigger: TriggerConfiguration): any {
    return {
      triggerId: frontendTrigger.triggerId,
      triggerType: frontendTrigger.triggerType.toUpperCase(),
      triggerValue: frontendTrigger.triggerValue,
      nextAction: frontendTrigger.nextAction,
      targetId: frontendTrigger.targetId,
      messageTemplateId: frontendTrigger.messageId,
      isActive: frontendTrigger.isActive,
      priority: frontendTrigger.priority || 0,
      conditions: frontendTrigger.conditions
    }
  }

  // LocalStorage fallback methods
  private getMessagesFromLocalStorage(): MessageLibraryEntry[] {
    try {
      const stored = localStorage.getItem('messageLibrary_messages')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading messages from localStorage:', error)
      return []
    }
  }

  private saveMessageToLocalStorage(message: MessageLibraryEntry): MessageLibraryEntry {
    try {
      const messages = this.getMessagesFromLocalStorage()
      const existingIndex = messages.findIndex(m => m.messageId === message.messageId)
      
      if (existingIndex >= 0) {
        messages[existingIndex] = { ...message, updatedAt: new Date() }
      } else {
        messages.push(message)
      }
      
      localStorage.setItem('messageLibrary_messages', JSON.stringify(messages))
      return message
    } catch (error) {
      console.error('Error saving message to localStorage:', error)
      throw error
    }
  }

  private updateMessageInLocalStorage(messageId: string, updates: Partial<MessageLibraryEntry>): MessageLibraryEntry {
    try {
      const messages = this.getMessagesFromLocalStorage()
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
      localStorage.setItem('messageLibrary_messages', JSON.stringify(messages))
      
      return updatedMessage
    } catch (error) {
      console.error('Error updating message in localStorage:', error)
      throw error
    }
  }

  private deleteMessageFromLocalStorage(messageId: string): void {
    try {
      const messages = this.getMessagesFromLocalStorage()
      const filteredMessages = messages.filter(m => m.messageId !== messageId)
      localStorage.setItem('messageLibrary_messages', JSON.stringify(filteredMessages))
    } catch (error) {
      console.error('Error deleting message from localStorage:', error)
    }
  }

  private getTriggersFromLocalStorage(): TriggerConfiguration[] {
    try {
      const stored = localStorage.getItem('messageLibrary_triggers')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading triggers from localStorage:', error)
      return []
    }
  }

  private saveTriggerToLocalStorage(trigger: TriggerConfiguration): TriggerConfiguration {
    try {
      const triggers = this.getTriggersFromLocalStorage()
      const existingIndex = triggers.findIndex(t => t.triggerId === trigger.triggerId)
      
      if (existingIndex >= 0) {
        triggers[existingIndex] = { ...trigger, updatedAt: new Date() }
      } else {
        triggers.push(trigger)
      }
      
      localStorage.setItem('messageLibrary_triggers', JSON.stringify(triggers))
      return trigger
    } catch (error) {
      console.error('Error saving trigger to localStorage:', error)
      throw error
    }
  }

  private deleteTriggerFromLocalStorage(triggerId: string): void {
    try {
      const triggers = this.getTriggersFromLocalStorage()
      const filteredTriggers = triggers.filter(t => t.triggerId !== triggerId)
      localStorage.setItem('messageLibrary_triggers', JSON.stringify(filteredTriggers))
    } catch (error) {
      console.error('Error deleting trigger from localStorage:', error)
    }
  }
}

export const messageLibraryService = new MessageLibraryService()