// Firebase/Firestore Service for Message & Trigger Library
// This is a mock implementation - replace with actual Firebase configuration

import type { MessageLibraryEntry, TriggerConfiguration } from '../types'

// Mock Firebase configuration
const FIREBASE_CONFIG = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.VITE_FIREBASE_APP_ID || 'your-app-id'
}

export class FirebaseService {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // In a real implementation, you would initialize Firebase here:
      // import { initializeApp } from 'firebase/app'
      // import { getFirestore } from 'firebase/firestore'
      // 
      // const app = initializeApp(FIREBASE_CONFIG)
      // this.db = getFirestore(app)
      
      console.log('Firebase service initialized (mock mode)')
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Firebase:', error)
    }
  }

  // Messages CRUD operations
  async saveMessage(message: MessageLibraryEntry): Promise<void> {
    try {
      // Mock implementation - in real app, use Firestore:
      // await setDoc(doc(this.db, 'messages', message.messageId), message)
      
      const messages = this.getStoredMessages()
      const existingIndex = messages.findIndex(m => m.messageId === message.messageId)
      
      if (existingIndex >= 0) {
        messages[existingIndex] = message
      } else {
        messages.push(message)
      }
      
      localStorage.setItem('messageLibrary_messages', JSON.stringify(messages))
      console.log('Message saved:', message.messageId)
    } catch (error) {
      console.error('Error saving message:', error)
      throw error
    }
  }

  async getMessages(): Promise<MessageLibraryEntry[]> {
    try {
      // Mock implementation - in real app, use Firestore:
      // const querySnapshot = await getDocs(collection(this.db, 'messages'))
      // return querySnapshot.docs.map(doc => doc.data() as MessageLibraryEntry)
      
      return this.getStoredMessages()
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      // Mock implementation - in real app, use Firestore:
      // await deleteDoc(doc(this.db, 'messages', messageId))
      
      const messages = this.getStoredMessages()
      const filteredMessages = messages.filter(m => m.messageId !== messageId)
      localStorage.setItem('messageLibrary_messages', JSON.stringify(filteredMessages))
      
      // Also delete associated triggers
      await this.deleteTriggersByMessageId(messageId)
      
      console.log('Message deleted:', messageId)
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  // Triggers CRUD operations
  async saveTrigger(trigger: TriggerConfiguration): Promise<void> {
    try {
      // Mock implementation - in real app, use Firestore:
      // await setDoc(doc(this.db, 'triggers', trigger.triggerId), trigger)
      
      const triggers = this.getStoredTriggers()
      const existingIndex = triggers.findIndex(t => t.triggerId === trigger.triggerId)
      
      if (existingIndex >= 0) {
        triggers[existingIndex] = trigger
      } else {
        triggers.push(trigger)
      }
      
      localStorage.setItem('messageLibrary_triggers', JSON.stringify(triggers))
      console.log('Trigger saved:', trigger.triggerId)
    } catch (error) {
      console.error('Error saving trigger:', error)
      throw error
    }
  }

  async getTriggers(): Promise<TriggerConfiguration[]> {
    try {
      // Mock implementation - in real app, use Firestore:
      // const querySnapshot = await getDocs(collection(this.db, 'triggers'))
      // return querySnapshot.docs.map(doc => doc.data() as TriggerConfiguration)
      
      return this.getStoredTriggers()
    } catch (error) {
      console.error('Error getting triggers:', error)
      return []
    }
  }

  async getTriggersByMessageId(messageId: string): Promise<TriggerConfiguration[]> {
    try {
      // Mock implementation - in real app, use Firestore query:
      // const q = query(collection(this.db, 'triggers'), where('messageId', '==', messageId))
      // const querySnapshot = await getDocs(q)
      // return querySnapshot.docs.map(doc => doc.data() as TriggerConfiguration)
      
      const triggers = this.getStoredTriggers()
      return triggers.filter(t => t.messageId === messageId)
    } catch (error) {
      console.error('Error getting triggers by message ID:', error)
      return []
    }
  }

  async deleteTrigger(triggerId: string): Promise<void> {
    try {
      // Mock implementation - in real app, use Firestore:
      // await deleteDoc(doc(this.db, 'triggers', triggerId))
      
      const triggers = this.getStoredTriggers()
      const filteredTriggers = triggers.filter(t => t.triggerId !== triggerId)
      localStorage.setItem('messageLibrary_triggers', JSON.stringify(filteredTriggers))
      
      console.log('Trigger deleted:', triggerId)
    } catch (error) {
      console.error('Error deleting trigger:', error)
      throw error
    }
  }

  async deleteTriggersByMessageId(messageId: string): Promise<void> {
    try {
      const triggers = this.getStoredTriggers()
      const filteredTriggers = triggers.filter(t => t.messageId !== messageId)
      localStorage.setItem('messageLibrary_triggers', JSON.stringify(filteredTriggers))
      
      console.log('Triggers deleted for message:', messageId)
    } catch (error) {
      console.error('Error deleting triggers by message ID:', error)
      throw error
    }
  }

  // Utility methods for localStorage (mock implementation)
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

  // Export data for backup/migration
  async exportData(): Promise<{ messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }> {
    const messages = await this.getMessages()
    const triggers = await this.getTriggers()
    
    return { messages, triggers }
  }

  // Import data from backup/migration
  async importData(data: { messages: MessageLibraryEntry[], triggers: TriggerConfiguration[] }): Promise<void> {
    try {
      // Save all messages
      for (const message of data.messages) {
        await this.saveMessage(message)
      }
      
      // Save all triggers
      for (const trigger of data.triggers) {
        await this.saveTrigger(trigger)
      }
      
      console.log('Data imported successfully')
    } catch (error) {
      console.error('Error importing data:', error)
      throw error
    }
  }
}

// Singleton instance
export const firebaseService = new FirebaseService()

// Instructions for real Firebase setup:
/*
To use real Firebase/Firestore instead of localStorage:

1. Install Firebase SDK:
   npm install firebase

2. Add environment variables to .env:
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id

3. Uncomment the Firebase imports and initialization code above

4. Set up Firestore security rules:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /messages/{messageId} {
         allow read, write: if request.auth != null;
       }
       match /triggers/{triggerId} {
         allow read, write: if request.auth != null;
       }
     }
   }

5. Optionally add authentication using Firebase Auth
*/
