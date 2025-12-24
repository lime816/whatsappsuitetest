import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertCircle, History, Trash2, Download } from 'lucide-react'
import { autoSaveService, AutoSaveMetadata } from '../utils/autoSave'

interface AutoSaveStatusProps {
  className?: string
}

export default function AutoSaveStatus({ className = '' }: AutoSaveStatusProps) {
  const [lastSave, setLastSave] = useState<number | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<AutoSaveMetadata[]>([])
  const [storageInfo, setStorageInfo] = useState<any>(null)

  useEffect(() => {
    // Listen for auto-save events
    const handleAutoSave = (event: CustomEvent) => {
      setLastSave(event.detail.timestamp)
    }

    window.addEventListener('autosave', handleAutoSave as EventListener)
    
    // Load initial state
    const autoSaveInfo = autoSaveService.getAutoSaveInfo()
    if (autoSaveInfo) {
      setLastSave(autoSaveInfo.timestamp)
    }

    return () => {
      window.removeEventListener('autosave', handleAutoSave as EventListener)
    }
  }, [])

  useEffect(() => {
    if (showHistory) {
      setHistory(autoSaveService.getHistory())
      setStorageInfo(autoSaveService.getStorageInfo())
    }
  }, [showHistory])

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ago`
    } else if (seconds > 30) {
      return `${seconds}s ago`
    } else {
      return 'just now'
    }
  }

  const handleLoadFromHistory = (id: string) => {
    const data = autoSaveService.loadFromHistory(id)
    if (data) {
      // Dispatch event to load the data
      window.dispatchEvent(new CustomEvent('loadAutoSave', { detail: data }))
      setShowHistory(false)
    }
  }

  const handleDeleteFromHistory = (id: string) => {
    autoSaveService.deleteFromHistory(id)
    setHistory(autoSaveService.getHistory())
    setStorageInfo(autoSaveService.getStorageInfo())
  }

  const handleClearHistory = () => {
    autoSaveService.clearHistory()
    setHistory([])
    setStorageInfo(autoSaveService.getStorageInfo())
  }

  return (
    <>
      {/* Auto-save status indicator */}
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50"
        >
          <span className="text-xs text-slate-300">
            {lastSave ? (
              <>Auto-saved {formatTimeAgo(lastSave)}</>
            ) : (
              <>Auto-save ready</>
            )}
          </span>
        </motion.div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-1 hover:bg-slate-700/50 rounded text-slate-400 hover:text-slate-300 transition-colors"
          title="Auto-save history"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-save history modal */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-400" />
                    Auto-save History
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Restore previous versions of your flow
                  </p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Storage info */}
              {storageInfo && (
                <div className="p-4 bg-slate-900/50 border-b border-slate-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Current:</span>
                      <div className="text-white font-medium">{storageInfo.currentAutoSave}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">History:</span>
                      <div className="text-white font-medium">{storageInfo.historySize}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Total:</span>
                      <div className="text-white font-medium">{storageInfo.totalSize}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Items:</span>
                      <div className="text-white font-medium">{storageInfo.historyCount}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* History list */}
              <div className="flex-1 overflow-y-auto p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-300 mb-2">No History Yet</h4>
                    <p className="text-slate-500">
                      Auto-save history will appear here as you work on your flows
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-slate-400">
                        {history.length} saved version{history.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </button>
                    </div>

                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-white">{item.flowName}</h5>
                            <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                              {item.screenCount} screen{item.screenCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>{new Date(item.timestamp).toLocaleString()}</span>
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoadFromHistory(item.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeleteFromHistory(item.id)}
                            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-700 bg-slate-900/30">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Auto-saves every 30 seconds. Data is stored locally in your browser.</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}