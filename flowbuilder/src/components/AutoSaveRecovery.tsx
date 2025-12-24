import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Download, Trash2, Clock, FileText } from 'lucide-react'
import { AutoSaveData } from '../utils/autoSave'

interface AutoSaveRecoveryProps {
  autoSaveData: AutoSaveData
  onRestore: () => void
  onDiscard: () => void
  onCancel: () => void
}

export default function AutoSaveRecovery({ 
  autoSaveData, 
  onRestore, 
  onDiscard, 
  onCancel 
}: AutoSaveRecoveryProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else {
      return 'just now'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Unsaved Work Found</h3>
              <p className="text-amber-100 text-sm">
                We found an auto-saved version of your work
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {autoSaveData.flowName || 'Untitled Flow'}
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Saved {formatTimeAgo(autoSaveData.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center bg-blue-100 text-blue-600 rounded text-xs font-bold">
                      {autoSaveData.screens.length}
                    </span>
                    <span>
                      {autoSaveData.screens.length} screen{autoSaveData.screens.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(autoSaveData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">What would you like to do?</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• <strong>Restore:</strong> Continue working on your saved flow</li>
                  <li>• <strong>Start Fresh:</strong> Begin with a new empty flow</li>
                  <li>• <strong>Cancel:</strong> Keep current flow and save auto-save for later</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onRestore}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Restore Auto-saved Work
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onDiscard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Start Fresh
              </button>
              
              <button
                onClick={onCancel}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Auto-save runs every 30 seconds while you work</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}