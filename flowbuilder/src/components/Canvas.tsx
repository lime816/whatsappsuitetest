import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Smartphone, Trash2, Copy, Edit3 } from 'lucide-react'
import { useFlowStore } from '../state/store'
import { SortableItem } from './SortableItem'
import PropertyEditorInline from './PropertyEditorInline'
import ConfirmDialog from './ConfirmDialog'
import type { AnyElement } from '../types'

export default function Canvas() {
  const { screens, selectedScreenId, moveElement, updateElement, removeElement, duplicateElement, validateComponentOrder, syncVisualOrderWithJSON } = useFlowStore()
  const screen = screens.find(s => s.id === selectedScreenId)
  const [selectedElement, setSelectedElement] = useState<AnyElement | null>(null)
  const [deletingElement, setDeletingElement] = useState<AnyElement | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!active || !over || !screen) return
    if (active.id === over.id) return
    const oldIndex = screen.elements.findIndex(e => e.id === active.id)
    const newIndex = screen.elements.findIndex(e => e.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    
    // Perform the move
    moveElement(screen.id, oldIndex, newIndex)
    
    // Validate and sync order after move
    setTimeout(() => {
      validateComponentOrder(screen.id)
      syncVisualOrderWithJSON(screen.id)
    }, 0)
  }

  const handleDelete = useCallback((el: AnyElement) => {
    if (!screen) return
    removeElement(screen.id, el.id)
    setDeletingElement(null)
    
    // Clear selection if deleted element was selected
    if (selectedElement?.id === el.id) {
      setSelectedElement(null)
    }
  }, [screen, removeElement, selectedElement])

  const handleDuplicate = useCallback((el: AnyElement) => {
    if (!screen) return
    duplicateElement(screen.id, el.id)
  }, [screen, duplicateElement])

  const getElementDisplayName = (el: AnyElement) => {
    switch (el.type) {
      case 'TextHeading': return 'Heading'
      case 'TextSubheading': return 'Subheading'
      case 'TextBody': return 'Body Text'
      case 'TextCaption': return 'Caption'
      case 'RichText': return 'Rich Text'
      case 'TextInput': return 'Text Input'
      case 'EmailInput': return 'Email Input'
      case 'PasswordInput': return 'Password Input'
      case 'PhoneInput': return 'Phone Input'
      case 'RadioButtonsGroup': return 'Radio Buttons'
      case 'TextArea': return 'Text Area'
      case 'Dropdown': return 'Dropdown'
      case 'CheckboxGroup': return 'Checkboxes'
      case 'ChipsSelector': return 'Chips'
      case 'OptIn': return 'Opt-in'
      case 'EmbeddedLink': return 'Link'
      case 'DatePicker': return 'Date Picker'
      case 'CalendarPicker': return 'Calendar'
      case 'Image': return 'Image'
      case 'ImageCarousel': return 'Image Carousel'
      case 'PhotoPicker': return 'Photo Picker'
      case 'DocumentPicker': return 'Document Picker'
      case 'NavigationList': return 'Navigation List'
      case 'Footer': return 'Footer Button'
      default: return el.type
    }
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key or Backspace to delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !e.ctrlKey && !e.metaKey) {
        // Only if not in an input field
        const activeElement = document.activeElement
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          return
        }
        
        e.preventDefault()
        setDeletingElement(selectedElement)
      }
      
      // Escape to clear selection
      if (e.key === 'Escape') {
        setSelectedElement(null)
        setDeletingElement(null)
      }
      
      // Ctrl+D to duplicate selected element
      if (e.key === 'd' && (e.ctrlKey || e.metaKey) && selectedElement) {
        e.preventDefault()
        handleDuplicate(selectedElement)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedElement, handleDuplicate])

  if (!screen) {
    return (
      <div className="hypr-panel flex items-center justify-center">
        <div className="text-center">
          <div className="hypr-status-dot hypr-status-inactive mb-2"></div>
          <p className="hypr-text-muted">NO_SCREEN_SELECTED</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="hypr-panel h-full overflow-hidden"
    >
      {/* Screen Header */}
      <div className="hypr-section-header">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span className="hypr-section-title">{screen.title}</span>
          <span className="hypr-badge">{screen.elements.length}</span>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1 overflow-y-auto hypr-scrollbar">
        {screen.elements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="hypr-status-dot hypr-status-inactive mb-4"></div>
            <p className="hypr-text-muted mb-1">NO_COMPONENTS</p>
            <p className="hypr-text-dim text-xs">Add components from left panel</p>
          </motion.div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={screen.elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="p-4 space-y-2">
                <AnimatePresence>
                  {screen.elements.map((el, idx) => (
                    <motion.div
                      key={el.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.02 }}
                      className="relative group"
                    >
                      <div 
                        onMouseEnter={() => setHoveredId(el.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="relative"
                      >
                        <SortableItem id={el.id}>
                          <div className="flex-1">
                            <Preview 
                              el={el} 
                              onClick={() => setSelectedElement(el)}
                              isSelected={selectedElement?.id === el.id}
                            />
                          </div>
                          
                          {/* Hover Actions */}
                          <AnimatePresence>
                            {hoveredId === el.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="absolute top-2 right-2 flex items-center gap-1 z-10"
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedElement(el)
                                  }}
                                  className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg transition-colors"
                                  title="Edit properties"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDuplicate(el)
                                  }}
                                  className="p-1 bg-green-600 hover:bg-green-700 text-white rounded shadow-lg transition-colors"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setDeletingElement(el)
                                  }}
                                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </SortableItem>
                      </div>

                      {/* Inline Property Editor */}
                      <AnimatePresence>
                        {selectedElement?.id === el.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2"
                          >
                            <PropertyEditorInline
                              screenId={screen.id}
                              element={el}
                              onClose={() => setSelectedElement(null)}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deletingElement && (
          <ConfirmDialog
            title="Delete Component"
            message={`Are you sure you want to delete this ${getElementDisplayName(deletingElement)}? This action cannot be undone.`}
            onConfirm={() => handleDelete(deletingElement)}
            onCancel={() => setDeletingElement(null)}
            confirmText="Delete"
            cancelText="Cancel"
            type="danger"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function Preview({ el, onClick, isSelected }: { el: any; onClick: () => void; isSelected?: boolean }) {
  const baseClass = `hypr-component-preview ${
    isSelected ? 'hypr-component-preview-selected' : ''
  }`
  
  switch (el.type) {
    case 'TextHeading':
      return (
        <div onClick={onClick} className={`${baseClass} ${el.visible === false ? 'opacity-50 border-dashed' : ''}`}>
          <div className="hypr-component-type">
            HEADING
            {el.visible === false && <span className="ml-2 text-xs text-red-400">(HIDDEN)</span>}
          </div>
          <h1 className="text-lg font-bold text-slate-200">{el.text}</h1>
        </div>
      )
    case 'TextSubheading':
      return (
        <div onClick={onClick} className={`${baseClass} ${el.visible === false ? 'opacity-50 border-dashed' : ''}`}>
          <div className="hypr-component-type">
            SUBHEADING
            {el.visible === false && <span className="ml-2 text-xs text-red-400">(HIDDEN)</span>}
          </div>
          <h2 className="text-base font-semibold text-slate-200">{el.text}</h2>
        </div>
      )
    case 'TextBody':
      return (
        <div onClick={onClick} className={`${baseClass} ${el.visible === false ? 'opacity-50 border-dashed' : ''}`}>
          <div className="hypr-component-type">
            BODY
            {el.visible === false && <span className="ml-2 text-xs text-red-400">(HIDDEN)</span>}
            {el.markdown && <span className="ml-2 text-xs text-blue-400">(MD)</span>}
          </div>
          <p className={`text-sm text-gray-300 ${
            el.fontWeight === 'bold' ? 'font-bold' : 
            el.fontWeight === 'italic' ? 'italic' : 
            el.fontWeight === 'bold_italic' ? 'font-bold italic' : ''
          } ${el.strikethrough ? 'line-through' : ''}`}>
            {el.text}
          </p>
        </div>
      )
    case 'TextCaption':
      return (
        <div onClick={onClick} className={`${baseClass} ${el.visible === false ? 'opacity-50 border-dashed' : ''}`}>
          <div className="hypr-component-type">
            CAPTION
            {el.visible === false && <span className="ml-2 text-xs text-red-400">(HIDDEN)</span>}
            {el.markdown && <span className="ml-2 text-xs text-blue-400">(MD)</span>}
            {el.text && el.text.length > 400 && <span className="ml-2 text-xs text-red-400">(400+ CHARS)</span>}
          </div>
          <p className={`text-xs text-gray-400 ${
            el.fontWeight === 'bold' ? 'font-bold' : 
            el.fontWeight === 'italic' ? 'italic' : 
            el.fontWeight === 'bold_italic' ? 'font-bold italic' : ''
          } ${el.strikethrough ? 'line-through' : ''}`}>
            {el.text}
          </p>
          {el.text && el.text.length > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {el.text.length}/400 chars
            </div>
          )}
        </div>
      )
    case 'RichText':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">RICHTEXT</div>
          <div className="text-gray-300 text-sm">
            <pre className="whitespace-pre-wrap text-xs">{el.text}</pre>
          </div>
        </div>
      )
    case 'TextInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">INPUT</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview">
            <span className="text-gray-500 text-xs">
              {el.inputType === 'password' || el.inputType === 'passcode' ? '••••••••' : 
               el.inputType === 'email' ? 'user@example.com' :
               el.inputType === 'phone' ? '+1 (555) 123-4567' :
               el.inputType === 'number' ? '123' : 'Text input...'}
            </span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'EmailInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">EMAIL</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview">
            <span className="text-gray-500 text-xs">user@example.com</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'PasswordInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">PASSWORD</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview">
            <span className="text-gray-500 text-xs">••••••••</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'PhoneInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">PHONE</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview">
            <span className="text-gray-500 text-xs">+1 (555) 123-4567</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'RadioButtonsGroup':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">RADIO</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="flex flex-wrap gap-1">
            {el.options.map((o: any) => (
              <span key={o.id} className="hypr-chip hypr-chip-inactive text-xs">
                {o.title}
              </span>
            ))}
          </div>
        </div>
      )
    case 'TextArea':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">TEXTAREA</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview h-12">
            <span className="text-gray-500 text-xs">Multiline text input...</span>
          </div>
        </div>
      )
    case 'Dropdown':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">DROPDOWN</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview flex items-center justify-between">
            <span className="text-xs">{el.options[0]?.title ?? 'Select...'}</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )
    case 'CheckboxGroup':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">CHECKBOX</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="space-y-1">
            {el.dataSource?.slice(0, 2).map((option: any) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-500 bg-gray-800"></div>
                <span className="text-xs text-gray-300">{option.title}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'ChipsSelector':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">CHIPS</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="flex flex-wrap gap-1">
            {el.dataSource?.slice(0, 3).map((chip: any) => (
              <span key={chip.id} className="hypr-chip hypr-chip-inactive text-xs">
                {chip.title}
              </span>
            ))}
          </div>
        </div>
      )
    case 'OptIn':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">OPTIN</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-gray-500 bg-gray-800"></div>
            <span className="text-xs text-gray-300">{el.label}</span>
          </div>
        </div>
      )
    case 'EmbeddedLink':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">LINK</div>
          <span className="text-cyan-400 underline text-xs cursor-pointer">{el.text}</span>
        </div>
      )
    case 'DatePicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">DATE</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview flex items-center justify-between">
            <span className="text-gray-500 text-xs">Select date...</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )
    case 'CalendarPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">CALENDAR</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label}</label>
          <div className="hypr-input-preview">
            <div className="grid grid-cols-7 gap-px text-xs text-gray-500">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center p-px">{day}</div>
              ))}
              {Array.from({length: 7}, (_, i) => (
                <div key={i} className="text-center p-px">{i + 1}</div>
              ))}
            </div>
          </div>
        </div>
      )
    case 'Image':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">IMAGE</div>
          <div className="hypr-input-preview text-center">
            {el.src ? (
              <img
                src={el.src}
                alt={el.altText || 'Image'}
                className="mx-auto max-w-full h-16 object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.src = '/t1.png'
                }}
              />
            ) : (
              <div className="w-full h-16 flex items-center justify-center text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{el.altText || 'Image'}</p>
          </div>
        </div>
      )
    case 'ImageCarousel':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">CAROUSEL</div>
          <div className="hypr-input-preview">
            <div className="flex gap-1 mb-1 overflow-x-auto">
              {el.images?.slice(0, 3).map((img: any, i: number) => (
                <div key={i} className="flex-shrink-0 w-12 h-8 border border-gray-600 overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.altText || `img-${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/t1.png' }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">Carousel ({el.images?.length || 0})</p>
          </div>
        </div>
      )
    case 'PhotoPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">PHOTO_PICKER</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label || 'Photo Picker'}</label>
          {el.description && <p className="text-xs text-gray-500 mb-1">{el.description}</p>}
          <div className="hypr-input-preview text-center">
            <div className="w-6 h-6 mx-auto mb-1 bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-xs">📷</span>
            </div>
            <p className="text-xs text-gray-400">Upload Photos</p>
            <p className="text-xs text-gray-500">
              {el.photoSource === 'camera' ? 'Camera' : el.photoSource === 'gallery' ? 'Gallery' : 'Camera/Gallery'}
            </p>
          </div>
        </div>
      )
    case 'DocumentPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">DOC_PICKER</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label || 'Document Picker'}</label>
          {el.description && <p className="text-xs text-gray-500 mb-1">{el.description}</p>}
          <div className="hypr-input-preview text-center">
            <div className="w-6 h-6 mx-auto mb-1 bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-xs">📄</span>
            </div>
            <p className="text-xs text-gray-400">Upload Documents</p>
            {el.allowedMimeTypes && el.allowedMimeTypes.length > 0 && (
              <p className="text-xs text-gray-500">
                {el.allowedMimeTypes.slice(0, 2).join(', ')}
                {el.allowedMimeTypes.length > 2 && '...'}
              </p>
            )}
          </div>
        </div>
      )
    case 'NavigationList':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">NAV_LIST</div>
          <label className="text-xs text-gray-400 block mb-1">{el.label || 'Navigation List'}</label>
          <div className="space-y-1">
            {el.listItems?.slice(0, 2).map((item: any) => (
              <div key={item.id} className="flex items-center gap-2 p-1 bg-gray-800 border border-gray-600">
                <div className="w-4 h-4 bg-gray-700 border border-gray-600"></div>
                <div className="flex-1">
                  <div className="text-xs text-gray-300">{item.mainContent?.title}</div>
                  {item.mainContent?.description && (
                    <div className="text-xs text-gray-500">{item.mainContent.description}</div>
                  )}
                </div>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )
    case 'Footer':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="hypr-component-type">FOOTER</div>
          <button className="w-full hypr-btn-primary py-2 text-xs">
            {el.label}
          </button>
        </div>
      )
    default:
      return null
  }
}