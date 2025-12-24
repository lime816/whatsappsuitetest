import React from 'react'
import { motion } from 'framer-motion'
import HyprScreenDesigner from './HyprScreenDesigner'
import Canvas from './Canvas'
import ScreenSettings from './ScreenSettings'
import { AppState } from '../state/appState'

interface AppLayoutProps {
  state: AppState
  onLayoutChange: (field: keyof AppState['layout'], value: number | boolean) => void
  onFormUpdate: (field: keyof AppState['form'], value: string) => void
}

export default function AppLayout({ state, onLayoutChange, onFormUpdate }: AppLayoutProps) {
  const { layout, form } = state

  const handleLeftResize = (e: React.MouseEvent) => {
    onLayoutChange('isResizing', true)
    const startX = e.clientX
    const startWidth = layout.leftPanelWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)))
      onLayoutChange('leftPanelWidth', newWidth)
    }
    
    const handleMouseUp = () => {
      onLayoutChange('isResizing', false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleRightResize = (e: React.MouseEvent) => {
    onLayoutChange('isResizing', true)
    const startX = e.clientX
    const startWidth = layout.rightPanelWidth
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(250, Math.min(600, startWidth - (e.clientX - startX)))
      onLayoutChange('rightPanelWidth', newWidth)
    }
    
    const handleMouseUp = () => {
      onLayoutChange('isResizing', false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="hypr-main">
      {/* Left rail - Screens + Components */}
      <div 
        className="hypr-sidebar tile-left"
        style={{ width: `${layout.leftPanelWidth}px` }}
      >
        <HyprScreenDesigner />
      </div>

      {/* Left Resizer */}
      <div 
        className="hypr-resizer"
        onMouseDown={handleLeftResize}
      />

      {/* Center - Canvas */}
      <div className="hypr-content tile-center">
        <Canvas />
      </div>

      {/* Right Resizer */}
      <div 
        className="hypr-resizer"
        onMouseDown={handleRightResize}
      />

      {/* Right rail - Inspector */}
      <div 
        className="hypr-sidebar-right tile-right"
        style={{ width: `${layout.rightPanelWidth}px` }}
      >
        <div className="hypr-panel h-full overflow-hidden">
          <ScreenSettings 
            flowName={form.flowName}
            setFlowName={(name) => onFormUpdate('flowName', name)}
            customMessage={form.customMessage}
            setCustomMessage={(message) => onFormUpdate('customMessage', message)}
          />
        </div>
      </div>
    </div>
  )
}