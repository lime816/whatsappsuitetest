import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Smartphone, Trash2 } from 'lucide-react'
import { useFlowStore } from '../state/store'
import { SortableItem } from './SortableItem'
import PropertyEditorInline from './PropertyEditorInline'
import ConfirmDialog from './ConfirmDialog'
import type { AnyElement } from '../types'

export default function Canvas() {
  const { screens, selectedScreenId, moveElement, updateElement } = useFlowStore()
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
    moveElement(screen.id, oldIndex, newIndex)
  }

  const handleDelete = (el: AnyElement) => {
    if (!screen) return
    const { removeElement } = useFlowStore.getState()
    removeElement(screen.id, el.id)
    setDeletingElement(null)
  }

  if (!screen) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-gray-500">No screen selected</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass-panel overflow-hidden"
    >
      {/* Screen Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-primary-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{screen.title}</h3>
            <p className="text-xs text-gray-500">{screen.elements.length} components</p>
          </div>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="p-4 min-h-[400px]">
        {screen.elements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2">No components yet</p>
            <p className="text-sm text-gray-500">Add components from the palette on the left</p>
          </motion.div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={screen.elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                <AnimatePresence>
                  {screen.elements.map((el, idx) => (
                    <motion.div
                      key={el.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative group"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Component Preview */}
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
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  onClick={() => setDeletingElement(el)}
                                  className="absolute top-2 right-2 btn-danger p-2 z-10"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </SortableItem>
                        </div>

                        {/* Inline Property Editor */}
                        <AnimatePresence>
                          {selectedElement?.id === el.id && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="lg:block hidden"
                            >
                              <PropertyEditorInline
                                screenId={screen.id}
                                element={el}
                                onClose={() => setSelectedElement(null)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Mobile: Editor below component */}
                      <AnimatePresence>
                        {selectedElement?.id === el.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden mt-3"
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
      {deletingElement && (
        <ConfirmDialog
          title="Delete Component"
          message={`Are you sure you want to delete this ${deletingElement.type}?`}
          onConfirm={() => handleDelete(deletingElement)}
          onCancel={() => setDeletingElement(null)}
        />
      )}
    </motion.div>
  )
}

function Preview({ el, onClick, isSelected }: { el: any; onClick: () => void; isSelected?: boolean }) {
  const baseClass = `bg-white border rounded-lg p-4 hover:border-primary-400 hover:shadow-sm transition-all cursor-pointer ${
    isSelected ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-gray-200'
  }`
  
  switch (el.type) {
    case 'TextHeading':
      return (
        <div onClick={onClick} className={baseClass}>
          <h1 className="text-xl font-bold text-gray-800">{el.text}</h1>
        </div>
      )
    case 'TextSubheading':
      return (
        <div onClick={onClick} className={baseClass}>
          <h2 className="text-lg font-semibold text-gray-800">{el.text}</h2>
        </div>
      )
    case 'TextBody':
      return (
        <div onClick={onClick} className={baseClass}>
          <p className={`text-gray-700 ${el.fontWeight === 'bold' ? 'font-bold' : ''} ${el.strikethrough ? 'line-through' : ''}`}>
            {el.text}
          </p>
        </div>
      )
    case 'TextCaption':
      return (
        <div onClick={onClick} className={baseClass}>
          <p className={`text-sm text-gray-600 ${el.fontWeight === 'bold' ? 'font-bold' : ''} ${el.strikethrough ? 'line-through' : ''}`}>
            {el.text}
          </p>
        </div>
      )
    case 'RichText':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="text-gray-700 prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm">{el.text}</pre>
          </div>
        </div>
      )
    case 'TextInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm">
            <span className="text-gray-400">
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
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm">
            <span className="text-gray-400">user@example.com</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'PasswordInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm">
            <span className="text-gray-400">••••••••</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'PhoneInput':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm">
            <span className="text-gray-400">+1 (555) 123-4567</span>
          </div>
          {el.helperText && (
            <p className="text-xs text-gray-500 mt-1">{el.helperText}</p>
          )}
        </div>
      )
    case 'RadioButtonsGroup':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="flex flex-wrap gap-2">
            {el.options.map((o: any) => (
              <span key={o.id} className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-700">
                {o.title}
              </span>
            ))}
          </div>
        </div>
      )
    case 'TextArea':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 h-20 text-gray-500 text-sm">
            Multiline text input...
          </div>
        </div>
      )
    case 'Dropdown':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm flex items-center justify-between">
            <span>{el.options[0]?.title ?? 'Select...'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )
    case 'CheckboxGroup':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="space-y-2">
            {el.dataSource?.slice(0, 3).map((option: any) => (
              <div key={option.id} className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded bg-white"></div>
                <span className="text-sm text-gray-700">{option.title}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'ChipsSelector':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="flex flex-wrap gap-2">
            {el.dataSource?.slice(0, 3).map((chip: any) => (
              <span key={chip.id} className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-full text-xs text-gray-700">
                {chip.title}
              </span>
            ))}
          </div>
        </div>
      )
    case 'OptIn':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-gray-300 rounded bg-white"></div>
            <span className="text-sm text-gray-700">{el.label}</span>
          </div>
        </div>
      )
    case 'EmbeddedLink':
      return (
        <div onClick={onClick} className={baseClass}>
          <span className="text-whatsapp-500 underline cursor-pointer">{el.text}</span>
        </div>
      )
    case 'DatePicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-700 text-sm flex items-center justify-between">
            <span className="text-gray-500">Select date...</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )
    case 'CalendarPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label}</label>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-3">
            <div className="grid grid-cols-7 gap-1 text-xs text-gray-600">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-center p-1">{day}</div>
              ))}
              {Array.from({length: 14}, (_, i) => (
                <div key={i} className="text-center p-1 text-gray-500">{i + 1}</div>
              ))}
            </div>
          </div>
        </div>
      )
    case 'Image':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-center">
            {el.src ? (
              <img
                src={el.src}
                alt={el.altText || 'Image'}
                className="mx-auto rounded max-w-full h-32 object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.src = '/t1.png'
                }}
              />
            ) : (
              <div className="w-full h-32 flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{el.altText || 'Image'}</p>
          </div>
        </div>
      )
    case 'ImageCarousel':
      return (
        <div onClick={onClick} className={baseClass}>
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-2">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {el.images?.slice(0, 5).map((img: any, i: number) => (
                <div key={i} className="flex-shrink-0 w-20 h-14 rounded overflow-hidden border border-gray-300">
                  <img
                    src={img.src}
                    alt={img.altText || `img-${i}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/t1.png' }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">Image Carousel ({el.images?.length || 0} images)</p>
          </div>
        </div>
      )
    case 'PhotoPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm font-medium text-gray-700 block mb-2">{el.label || 'Photo Picker'}</label>
          {el.description && <p className="text-xs text-gray-500 mb-2">{el.description}</p>}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📷</span>
            </div>
            <p className="text-xs text-gray-600">Upload Photos</p>
            <p className="text-xs text-gray-400 mt-1">
              {el.photoSource === 'camera' ? 'Camera' : el.photoSource === 'gallery' ? 'Gallery' : 'Camera/Gallery'}
            </p>
            {(el.minUploadedPhotos || el.maxUploadedPhotos) && (
              <p className="text-xs text-gray-400 mt-1">
                {el.minUploadedPhotos || 0}-{el.maxUploadedPhotos || 30} photos
              </p>
            )}
          </div>
        </div>
      )
    case 'DocumentPicker':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm font-medium text-gray-700 block mb-2">{el.label || 'Document Picker'}</label>
          {el.description && <p className="text-xs text-gray-500 mb-2">{el.description}</p>}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-xl">📄</span>
            </div>
            <p className="text-xs text-gray-600">Upload Documents</p>
            {el.allowedMimeTypes && el.allowedMimeTypes.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {el.allowedMimeTypes.slice(0, 2).join(', ')}
                {el.allowedMimeTypes.length > 2 && '...'}
              </p>
            )}
            {(el.minUploadedDocuments || el.maxUploadedDocuments) && (
              <p className="text-xs text-gray-400 mt-1">
                {el.minUploadedDocuments || 0}-{el.maxUploadedDocuments || 30} docs
              </p>
            )}
          </div>
        </div>
      )
    case 'NavigationList':
      return (
        <div onClick={onClick} className={baseClass}>
          <label className="text-sm text-gray-700 block mb-2">{el.label || 'Navigation List'}</label>
          <div className="space-y-2">
            {el.listItems?.slice(0, 2).map((item: any) => (
              <div key={item.id} className="flex items-center gap-3 p-2 bg-white border border-gray-300 rounded">
                <div className="w-8 h-8 bg-gray-100 rounded border border-gray-300"></div>
                <div className="flex-1">
                  <div className="text-sm text-gray-700">{item.mainContent?.title}</div>
                  {item.mainContent?.description && (
                    <div className="text-xs text-gray-500">{item.mainContent.description}</div>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <button className="w-full btn-primary py-3">
            {el.label}
          </button>
        </div>
      )
    default:
      return null
  }
}
