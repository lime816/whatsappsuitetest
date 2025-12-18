import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, X, Menu } from 'lucide-react'
import Palette from '../components/Palette'
import Canvas from '../components/Canvas'
import ScreenSettings from '../components/ScreenSettings'
import { useFlowStore } from '../state/store'

interface ScreenDesignerProps {
  flowName: string
  setFlowName: (name: string) => void
  customMessage: string
  setCustomMessage: (message: string) => void
}

export default function ScreenDesigner({ flowName, setFlowName, customMessage, setCustomMessage }: ScreenDesignerProps) {
  const { screens, selectedScreenId, selectScreen, removeScreen } = useFlowStore()
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-full p-4 lg:p-0">
      {/* Mobile Hamburger Menu Button */}
      <button
        onClick={() => setShowMobilePalette(!showMobilePalette)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        {showMobilePalette ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Left Sidebar - Screens & Components */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`lg:col-span-2 space-y-4 lg:space-y-6 ${
          showMobilePalette 
            ? 'fixed inset-0 z-40 bg-gray-50 p-4 overflow-y-auto' 
            : 'hidden lg:block'
        }`}
      >
        {/* Screens Section */}
        <div className="glass-panel p-4">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Screens</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {screens.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`screen-tab group ${
                  s.id === selectedScreenId ? 'screen-tab-active' : 'screen-tab-inactive'
                } relative`}
              >
                <button
                  onClick={() => selectScreen(s.id)}
                  className="flex-1 text-left pr-6"
                >
                  {s.id}
                </button>
                {screens.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeScreen(s.id)
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
                    title="Delete screen"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Palette */}
        <Palette />
        
        {/* Close button for mobile */}
        {showMobilePalette && (
          <button
            onClick={() => setShowMobilePalette(false)}
            className="lg:hidden mt-4 w-full btn-secondary"
          >
            Close Menu
          </button>
        )}
      </motion.aside>

      {/* Main Canvas */}
      <motion.main 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="lg:col-span-7 min-h-[400px]"
      >
        <AnimatePresence mode="wait">
          <Canvas key={selectedScreenId} />
        </AnimatePresence>
      </motion.main>

      {/* Right Sidebar - Screen Settings */}
      <motion.aside
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-3 h-full min-h-[500px]"
      >
        <div className="glass-panel h-full overflow-hidden">
          <ScreenSettings 
            flowName={flowName}
            setFlowName={setFlowName}
            customMessage={customMessage}
            setCustomMessage={setCustomMessage}
          />
        </div>
      </motion.aside>
    </div>
  )
}
