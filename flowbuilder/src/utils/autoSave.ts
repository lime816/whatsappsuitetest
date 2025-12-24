import { Screen } from '../types'

export interface AutoSaveData {
  screens: Screen[]
  timestamp: number
  flowName?: string
  version: string
}

export interface AutoSaveMetadata {
  id: string
  timestamp: number
  flowName: string
  screenCount: number
  version: string
}

class AutoSaveService {
  private readonly AUTOSAVE_KEY = 'flowbuilder_autosave'
  private readonly AUTOSAVE_HISTORY_KEY = 'flowbuilder_autosave_history'
  private readonly MAX_HISTORY_ITEMS = 10
  private readonly AUTOSAVE_INTERVAL = 30000 // 30 seconds
  private readonly VERSION = '1.0.0'
  
  private autoSaveTimer: NodeJS.Timeout | null = null
  private lastSaveHash: string = ''

  // Start auto-save with callback to get current state
  startAutoSave(getCurrentState: () => { screens: Screen[]; flowName?: string }) {
    this.stopAutoSave() // Clear any existing timer
    
    this.autoSaveTimer = setInterval(() => {
      const state = getCurrentState()
      this.saveIfChanged(state.screens, state.flowName)
    }, this.AUTOSAVE_INTERVAL)
    
    console.log('🔄 Auto-save started (every 30 seconds)')
  }

  // Stop auto-save
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
      this.autoSaveTimer = null
      console.log('⏹️ Auto-save stopped')
    }
  }

  // Save current state if it has changed
  saveIfChanged(screens: Screen[], flowName?: string) {
    const currentHash = this.generateHash(screens)
    
    if (currentHash !== this.lastSaveHash) {
      this.save(screens, flowName)
      this.lastSaveHash = currentHash
    }
  }

  // Force save current state
  save(screens: Screen[], flowName?: string) {
    try {
      const autoSaveData: AutoSaveData = {
        screens: JSON.parse(JSON.stringify(screens)), // Deep clone
        timestamp: Date.now(),
        flowName: flowName || 'Untitled Flow',
        version: this.VERSION
      }

      // Save current auto-save
      localStorage.setItem(this.AUTOSAVE_KEY, JSON.stringify(autoSaveData))
      
      // Add to history
      this.addToHistory(autoSaveData)
      
      console.log('💾 Auto-saved:', {
        screens: screens.length,
        flowName: autoSaveData.flowName,
        timestamp: new Date(autoSaveData.timestamp).toLocaleTimeString()
      })
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('autosave', { 
        detail: { 
          timestamp: autoSaveData.timestamp,
          screenCount: screens.length 
        } 
      }))
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error)
    }
  }

  // Load the most recent auto-save
  load(): AutoSaveData | null {
    try {
      const stored = localStorage.getItem(this.AUTOSAVE_KEY)
      if (!stored) return null
      
      const data: AutoSaveData = JSON.parse(stored)
      
      // Validate version compatibility
      if (data.version !== this.VERSION) {
        console.warn('⚠️ Auto-save version mismatch, skipping load')
        return null
      }
      
      return data
    } catch (error) {
      console.error('❌ Failed to load auto-save:', error)
      return null
    }
  }

  // Check if auto-save exists
  hasAutoSave(): boolean {
    return localStorage.getItem(this.AUTOSAVE_KEY) !== null
  }

  // Get auto-save metadata without loading full data
  getAutoSaveInfo(): { timestamp: number; screenCount: number; flowName: string } | null {
    try {
      const stored = localStorage.getItem(this.AUTOSAVE_KEY)
      if (!stored) return null
      
      const data: AutoSaveData = JSON.parse(stored)
      return {
        timestamp: data.timestamp,
        screenCount: data.screens.length,
        flowName: data.flowName || 'Untitled Flow'
      }
    } catch (error) {
      return null
    }
  }

  // Clear auto-save data
  clear() {
    localStorage.removeItem(this.AUTOSAVE_KEY)
    this.lastSaveHash = ''
    console.log('🗑️ Auto-save cleared')
  }

  // Get auto-save history
  getHistory(): AutoSaveMetadata[] {
    try {
      const stored = localStorage.getItem(this.AUTOSAVE_HISTORY_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('❌ Failed to load auto-save history:', error)
      return []
    }
  }

  // Load specific auto-save from history
  loadFromHistory(id: string): AutoSaveData | null {
    try {
      const historyKey = `${this.AUTOSAVE_KEY}_${id}`
      const stored = localStorage.getItem(historyKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('❌ Failed to load from history:', error)
      return null
    }
  }

  // Delete specific auto-save from history
  deleteFromHistory(id: string) {
    try {
      const history = this.getHistory()
      const updatedHistory = history.filter(item => item.id !== id)
      localStorage.setItem(this.AUTOSAVE_HISTORY_KEY, JSON.stringify(updatedHistory))
      
      // Remove the actual data
      const historyKey = `${this.AUTOSAVE_KEY}_${id}`
      localStorage.removeItem(historyKey)
      
      console.log('🗑️ Deleted auto-save from history:', id)
    } catch (error) {
      console.error('❌ Failed to delete from history:', error)
    }
  }

  // Clear all auto-save history
  clearHistory() {
    try {
      const history = this.getHistory()
      
      // Remove all history data files
      history.forEach(item => {
        const historyKey = `${this.AUTOSAVE_KEY}_${item.id}`
        localStorage.removeItem(historyKey)
      })
      
      // Clear history index
      localStorage.removeItem(this.AUTOSAVE_HISTORY_KEY)
      
      console.log('🗑️ Auto-save history cleared')
    } catch (error) {
      console.error('❌ Failed to clear history:', error)
    }
  }

  // Private: Add to history
  private addToHistory(data: AutoSaveData) {
    try {
      const history = this.getHistory()
      const id = `autosave_${data.timestamp}`
      
      // Create metadata entry
      const metadata: AutoSaveMetadata = {
        id,
        timestamp: data.timestamp,
        flowName: data.flowName || 'Untitled Flow',
        screenCount: data.screens.length,
        version: data.version
      }
      
      // Add to history
      history.unshift(metadata)
      
      // Keep only recent items
      const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS)
      
      // Remove old data files
      history.slice(this.MAX_HISTORY_ITEMS).forEach(item => {
        const historyKey = `${this.AUTOSAVE_KEY}_${item.id}`
        localStorage.removeItem(historyKey)
      })
      
      // Save updated history
      localStorage.setItem(this.AUTOSAVE_HISTORY_KEY, JSON.stringify(trimmedHistory))
      
      // Save the actual data
      const historyKey = `${this.AUTOSAVE_KEY}_${id}`
      localStorage.setItem(historyKey, JSON.stringify(data))
      
    } catch (error) {
      console.error('❌ Failed to add to history:', error)
    }
  }

  // Private: Generate hash for change detection
  private generateHash(screens: Screen[]): string {
    const str = JSON.stringify(screens)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Get storage usage info
  getStorageInfo() {
    try {
      const autoSave = localStorage.getItem(this.AUTOSAVE_KEY)
      const history = localStorage.getItem(this.AUTOSAVE_HISTORY_KEY)
      
      let totalSize = 0
      let historySize = 0
      
      if (autoSave) totalSize += autoSave.length
      if (history) {
        historySize += history.length
        const historyData = JSON.parse(history) as AutoSaveMetadata[]
        
        historyData.forEach(item => {
          const historyKey = `${this.AUTOSAVE_KEY}_${item.id}`
          const data = localStorage.getItem(historyKey)
          if (data) historySize += data.length
        })
      }
      
      totalSize += historySize
      
      return {
        currentAutoSave: autoSave ? (autoSave.length / 1024).toFixed(2) + ' KB' : '0 KB',
        historySize: (historySize / 1024).toFixed(2) + ' KB',
        totalSize: (totalSize / 1024).toFixed(2) + ' KB',
        historyCount: history ? JSON.parse(history).length : 0
      }
    } catch (error) {
      return {
        currentAutoSave: 'Error',
        historySize: 'Error',
        totalSize: 'Error',
        historyCount: 0
      }
    }
  }
}

// Export singleton instance
export const autoSaveService = new AutoSaveService()