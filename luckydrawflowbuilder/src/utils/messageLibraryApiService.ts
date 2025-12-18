// Real Backend API Service for Message & Trigger Library
import type { MessageLibraryEntry, TriggerConfiguration } from '../types'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://whatsappbackend-production-8946.up.railway.app'

export class MessageLibraryApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${BACKEND_URL}/api/message-library`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Messages CRUD operations
  async saveMessage(message: MessageLibraryEntry): Promise<MessageLibraryEntry> {
    return this.request<MessageLibraryEntry>('/messages', {
      method: 'POST',
      body: JSON.stringify(message),
    })
  }

  async getMessages(): Promise<MessageLibraryEntry[]> {
    return this.request<MessageLibraryEntry[]>('/messages')
  }

  async updateMessage(messageId: string, updates: Partial<MessageLibraryEntry>): Promise<MessageLibraryEntry> {
    return this.request<MessageLibraryEntry>(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteMessage(messageId: string): Promise<void> {
    await this.request(`/messages/${messageId}`, {
      method: 'DELETE',
    })
  }

  async publishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.request<MessageLibraryEntry>(`/messages/${messageId}/publish`, {
      method: 'POST',
    })
  }

  async unpublishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.request<MessageLibraryEntry>(`/messages/${messageId}/unpublish`, {
      method: 'POST',
    })
  }

  // Triggers CRUD operations
  async saveTrigger(trigger: TriggerConfiguration): Promise<TriggerConfiguration> {
    return this.request<TriggerConfiguration>('/triggers', {
      method: 'POST',
      body: JSON.stringify(trigger),
    })
  }

  async getTriggers(): Promise<TriggerConfiguration[]> {
    return this.request<TriggerConfiguration[]>('/triggers')
  }

  async getTriggersByMessageId(messageId: string): Promise<TriggerConfiguration[]> {
    return this.request<TriggerConfiguration[]>(`/triggers/message/${messageId}`)
  }

  async updateTrigger(triggerId: string, updates: Partial<TriggerConfiguration>): Promise<TriggerConfiguration> {
    return this.request<TriggerConfiguration>(`/triggers/${triggerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    await this.request(`/triggers/${triggerId}`, {
      method: 'DELETE',
    })
  }

  // Bulk operations
  async exportData(): Promise<{ messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }> {
    return this.request<{ messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }>('/export')
  }

  async importData(data: { messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }): Promise<void> {
    await this.request('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Trigger matching for incoming messages
  async findMatchingTriggers(messageText: string, phoneNumber?: string): Promise<TriggerConfiguration[]> {
    return this.request<TriggerConfiguration[]>('/triggers/match', {
      method: 'POST',
      body: JSON.stringify({ messageText, phoneNumber }),
    })
  }

  // Get published messages for webhook processing
  async getPublishedMessages(): Promise<MessageLibraryEntry[]> {
    return this.request<MessageLibraryEntry[]>('/messages/published')
  }
}

// Singleton instance
export const messageLibraryApiService = new MessageLibraryApiService()

// Fallback to localStorage if backend is unavailable
export class LocalStorageMessageLibraryService {
  // Messages
  async saveMessage(message: MessageLibraryEntry): Promise<MessageLibraryEntry> {
    const messages = this.getStoredMessages()
    const existingIndex = messages.findIndex(m => m.messageId === message.messageId)
    
    if (existingIndex >= 0) {
      messages[existingIndex] = message
    } else {
      messages.push(message)
    }
    
    localStorage.setItem('messageLibrary_messages', JSON.stringify(messages))
    return message
  }

  async getMessages(): Promise<MessageLibraryEntry[]> {
    return this.getStoredMessages()
  }

  async updateMessage(messageId: string, updates: Partial<MessageLibraryEntry>): Promise<MessageLibraryEntry> {
    const messages = this.getStoredMessages()
    const messageIndex = messages.findIndex(m => m.messageId === messageId)
    
    if (messageIndex === -1) {
      throw new Error('Message not found')
    }
    
    const updatedMessage = { ...messages[messageIndex], ...updates, updatedAt: new Date() }
    messages[messageIndex] = updatedMessage
    
    localStorage.setItem('messageLibrary_messages', JSON.stringify(messages))
    return updatedMessage
  }

  async deleteMessage(messageId: string): Promise<void> {
    const messages = this.getStoredMessages()
    const filteredMessages = messages.filter(m => m.messageId !== messageId)
    localStorage.setItem('messageLibrary_messages', JSON.stringify(filteredMessages))
    
    // Also delete associated triggers
    const triggers = this.getStoredTriggers()
    const filteredTriggers = triggers.filter(t => t.messageId !== messageId)
    localStorage.setItem('messageLibrary_triggers', JSON.stringify(filteredTriggers))
  }

  async publishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.updateMessage(messageId, { status: 'published' })
  }

  async unpublishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.updateMessage(messageId, { status: 'draft' })
  }

  // Triggers
  async saveTrigger(trigger: TriggerConfiguration): Promise<TriggerConfiguration> {
    const triggers = this.getStoredTriggers()
    const existingIndex = triggers.findIndex(t => t.triggerId === trigger.triggerId)
    
    if (existingIndex >= 0) {
      triggers[existingIndex] = trigger
    } else {
      triggers.push(trigger)
    }
    
    localStorage.setItem('messageLibrary_triggers', JSON.stringify(triggers))
    return trigger
  }

  async getTriggers(): Promise<TriggerConfiguration[]> {
    return this.getStoredTriggers()
  }

  async getTriggersByMessageId(messageId: string): Promise<TriggerConfiguration[]> {
    const triggers = this.getStoredTriggers()
    return triggers.filter(t => t.messageId === messageId)
  }

  async updateTrigger(triggerId: string, updates: Partial<TriggerConfiguration>): Promise<TriggerConfiguration> {
    const triggers = this.getStoredTriggers()
    const triggerIndex = triggers.findIndex(t => t.triggerId === triggerId)
    
    if (triggerIndex === -1) {
      throw new Error('Trigger not found')
    }
    
    const updatedTrigger = { ...triggers[triggerIndex], ...updates, updatedAt: new Date() }
    triggers[triggerIndex] = updatedTrigger
    
    localStorage.setItem('messageLibrary_triggers', JSON.stringify(triggers))
    return updatedTrigger
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    const triggers = this.getStoredTriggers()
    const filteredTriggers = triggers.filter(t => t.triggerId !== triggerId)
    localStorage.setItem('messageLibrary_triggers', JSON.stringify(filteredTriggers))
  }

  async exportData(): Promise<{ messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }> {
    const messages = await this.getMessages()
    const triggers = await this.getTriggers()
    return { messages, triggers }
  }

  async importData(data: { messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }): Promise<void> {
    localStorage.setItem('messageLibrary_messages', JSON.stringify(data.messages))
    localStorage.setItem('messageLibrary_triggers', JSON.stringify(data.triggers))
  }

  async findMatchingTriggers(messageText: string): Promise<TriggerConfiguration[]> {
    const triggers = this.getStoredTriggers()
    const publishedTriggers = triggers.filter(t => {
      const messages = this.getStoredMessages()
      const message = messages.find(m => m.messageId === t.messageId)
      return message?.status === 'published'
    })

    return publishedTriggers.filter(trigger => {
      if (trigger.triggerType === 'keyword_match') {
        const keywords = Array.isArray(trigger.triggerValue) ? trigger.triggerValue : [trigger.triggerValue]
        return keywords.some(keyword => 
          messageText.toLowerCase().includes(keyword.toLowerCase())
        )
      }
      return false
    })
  }

  async getPublishedMessages(): Promise<MessageLibraryEntry[]> {
    const messages = this.getStoredMessages()
    return messages.filter(m => m.status === 'published')
  }

  private getStoredMessages(): MessageLibraryEntry[] {
    try {
      const stored = localStorage.getItem('messageLibrary_messages')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error parsing stored messages:', error)
      return []
    }
  }

  private getStoredTriggers(): TriggerConfiguration[] {
    try {
      const stored = localStorage.getItem('messageLibrary_triggers')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error parsing stored triggers:', error)
      return []
    }
  }
}

// Hybrid service that tries backend first, falls back to localStorage
export class HybridMessageLibraryService {
  private apiService = new MessageLibraryApiService()
  private localService = new LocalStorageMessageLibraryService()
  private useBackend = true

  private async withFallback<T>(apiCall: () => Promise<T>, localCall: () => Promise<T>): Promise<T> {
    if (!this.useBackend) {
      return localCall()
    }

    try {
      return await apiCall()
    } catch (error) {
      console.warn('Backend API unavailable, falling back to localStorage:', error)
      this.useBackend = false
      return localCall()
    }
  }

  async saveMessage(message: MessageLibraryEntry): Promise<MessageLibraryEntry> {
    return this.withFallback(
      () => this.apiService.saveMessage(message),
      () => this.localService.saveMessage(message)
    )
  }

  async getMessages(): Promise<MessageLibraryEntry[]> {
    return this.withFallback(
      () => this.apiService.getMessages(),
      () => this.localService.getMessages()
    )
  }

  async updateMessage(messageId: string, updates: Partial<MessageLibraryEntry>): Promise<MessageLibraryEntry> {
    return this.withFallback(
      () => this.apiService.updateMessage(messageId, updates),
      () => this.localService.updateMessage(messageId, updates)
    )
  }

  async deleteMessage(messageId: string): Promise<void> {
    return this.withFallback(
      () => this.apiService.deleteMessage(messageId),
      () => this.localService.deleteMessage(messageId)
    )
  }

  async publishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.withFallback(
      () => this.apiService.publishMessage(messageId),
      () => this.localService.publishMessage(messageId)
    )
  }

  async unpublishMessage(messageId: string): Promise<MessageLibraryEntry> {
    return this.withFallback(
      () => this.apiService.unpublishMessage(messageId),
      () => this.localService.unpublishMessage(messageId)
    )
  }

  async saveTrigger(trigger: TriggerConfiguration): Promise<TriggerConfiguration> {
    return this.withFallback(
      () => this.apiService.saveTrigger(trigger),
      () => this.localService.saveTrigger(trigger)
    )
  }

  async getTriggers(): Promise<TriggerConfiguration[]> {
    return this.withFallback(
      () => this.apiService.getTriggers(),
      () => this.localService.getTriggers()
    )
  }

  async getTriggersByMessageId(messageId: string): Promise<TriggerConfiguration[]> {
    return this.withFallback(
      () => this.apiService.getTriggersByMessageId(messageId),
      () => this.localService.getTriggersByMessageId(messageId)
    )
  }

  async updateTrigger(triggerId: string, updates: Partial<TriggerConfiguration>): Promise<TriggerConfiguration> {
    return this.withFallback(
      () => this.apiService.updateTrigger(triggerId, updates),
      () => this.localService.updateTrigger(triggerId, updates)
    )
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    return this.withFallback(
      () => this.apiService.deleteTrigger(triggerId),
      () => this.localService.deleteTrigger(triggerId)
    )
  }

  async exportData(): Promise<{ messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }> {
    return this.withFallback(
      () => this.apiService.exportData(),
      () => this.localService.exportData()
    )
  }

  async importData(data: { messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }): Promise<void> {
    return this.withFallback(
      () => this.apiService.importData(data),
      () => this.localService.importData(data)
    )
  }

  async findMatchingTriggers(messageText: string, phoneNumber?: string): Promise<TriggerConfiguration[]> {
    return this.withFallback(
      () => this.apiService.findMatchingTriggers(messageText, phoneNumber),
      () => this.localService.findMatchingTriggers(messageText)
    )
  }

  async getPublishedMessages(): Promise<MessageLibraryEntry[]> {
    return this.withFallback(
      () => this.apiService.getPublishedMessages(),
      () => this.localService.getPublishedMessages()
    )
  }
}

// Export the hybrid service as the default
export const messageLibraryService = new HybridMessageLibraryService()
