import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Eye, Loader, AlertCircle, ExternalLink, Code2 } from 'lucide-react'
import { WhatsAppService } from '../utils/whatsappService'
import type { ElementType } from '../types'

interface FlowPreviewPaneProps {
  flowId: string
  flowName: string
  onClose: () => void
}

interface FlowAsset {
  screens?: any[]
  version?: string
  routing_model?: any
  data_api_version?: string
  _note?: string
  _flowInfo?: {
    preview?: {
      preview_url?: string
      download_url?: string
    }
    [key: string]: any
  }
  [key: string]: any
}

export default function FlowPreviewPane({ flowId, flowName, onClose }: FlowPreviewPaneProps) {
  const [flowAsset, setFlowAsset] = useState<FlowAsset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedScreen, setSelectedScreen] = useState<number>(0)
  const [showIframePreview, setShowIframePreview] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showJsonInput, setShowJsonInput] = useState(false)
  const [jsonInput, setJsonInput] = useState('')

  useEffect(() => {
    loadFlowAsset()
  }, [flowId])

  const loadFlowAsset = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const service = new WhatsAppService()
      const asset = await service.getFlowAsset(flowId)
      
      console.log('Loaded flow asset:', asset)
      
      if (asset) {
        setFlowAsset(asset)
        if (asset.screens && asset.screens.length > 0) {
          setSelectedScreen(0)
        }
        
        // Extract preview URL if available
        if (asset._flowInfo?.preview?.preview_url) {
          setPreviewUrl(asset._flowInfo.preview.preview_url)
        }
      } else {
        setError('No flow data available. The flow may be empty or not yet configured.')
      }
    } catch (err) {
      console.error('Error loading flow asset:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load flow preview'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadFromJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      console.log('Parsed JSON:', parsed)
      
      if (parsed.screens && Array.isArray(parsed.screens)) {
        setFlowAsset({
          ...parsed,
          _flowInfo: flowAsset?._flowInfo
        })
        setSelectedScreen(0)
        setShowJsonInput(false)
        setJsonInput('')
        setError(null)
      } else {
        setError('Invalid JSON: No screens array found')
      }
    } catch (err) {
      setError('Invalid JSON format: ' + (err instanceof Error ? err.message : 'Parse error'))
    }
  }

  const renderScreenPreview = (screen: any) => {
    if (!screen) return null

    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-gray-900 mb-1">{typeof screen.title === 'string' ? screen.title : 'Untitled Screen'}</h4>
          <p className="text-sm text-gray-500">ID: {typeof screen.id === 'string' ? screen.id : JSON.stringify(screen.id)}</p>
          {screen.terminal && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              Terminal Screen
            </span>
          )}
        </div>

        {/* Screen Layout */}
        {screen.layout && (
          <div className="space-y-3">
            <h5 className="font-semibold text-gray-700 text-sm">Layout: {typeof screen.layout.type === 'string' ? screen.layout.type : 'Unknown'}</h5>
            
            {/* Render Children */}
            {screen.layout.children && screen.layout.children.length > 0 && (
              <div className="space-y-3">
                {/* Separate Footer from other components */}
                {screen.layout.children
                  .filter((child: any) => child.type !== 'Footer')
                  .map((child: any, idx: number) => {
                    console.log('Rendering child:', child);
                    
                    // Handle Form component - render its children instead
                    if (child.type === 'Form' && child.children && Array.isArray(child.children)) {
                      return (
                        <div key={idx} className="space-y-3">
                          {child.children.map((formChild: any, formIdx: number) => (
                            <div key={`${idx}-${formIdx}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                              {renderFormElement(formChild)}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    return (
                      <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        {renderFormElement(child)}
                      </div>
                    );
                  })}
                
                {/* Render Footer at the bottom */}
                {screen.layout.children
                  .filter((child: any) => child.type === 'Footer')
                  .map((child: any, idx: number) => (
                    <div key={`footer-${idx}`} className="mt-4 pt-4 border-t border-gray-200">
                      {renderFormElement(child)}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Data API */}
        {screen.data && typeof screen.data === 'string' && screen.data.trim() && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">Data API Endpoint</p>
            <p className="text-xs text-blue-600 break-all">{screen.data}</p>
          </div>
        )}
        {screen.data && typeof screen.data === 'object' && Object.keys(screen.data).length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-semibold text-blue-700 mb-1">Data API Configuration</p>
            <pre className="text-xs text-blue-600 break-all overflow-x-auto">{JSON.stringify(screen.data, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }
  
  // Helper function to render form elements
  const renderFormElement = (child: any) => {
    return (
      <>
        {/* Text Elements */}
        {(child.type === 'TextHeading' || child.type === 'TextSubheading' || child.type === 'TextBody' || child.type === 'TextCaption') && child.text && typeof child.text === 'string' && (
          <div>
            {child.type === 'TextHeading' && <h3 className="text-xl font-bold text-gray-900">{child.text}</h3>}
            {child.type === 'TextSubheading' && <h4 className="text-lg font-semibold text-gray-800">{child.text}</h4>}
            {child.type === 'TextBody' && <p className="text-base text-gray-700">{child.text}</p>}
            {child.type === 'TextCaption' && <p className="text-sm text-gray-600">{child.text}</p>}
          </div>
        )}
        {child.text && typeof child.text === 'object' && Object.keys(child.text).length > 0 && (
          <pre className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{JSON.stringify(child.text, null, 2)}</pre>
        )}
                    
                    {/* Input Elements */}
                    {(child.type === 'TextInput' || child.type === 'EmailInput' || child.type === 'PhoneInput') && (
                      <div>
                        {child.label && typeof child.label === 'string' && (
                          <label className="block text-base font-semibold text-gray-900 mb-2">{child.label}</label>
                        )}
                        <input
                          type={child.type === 'EmailInput' ? 'email' : child.type === 'PhoneInput' ? 'tel' : 'text'}
                          placeholder={typeof child.label === 'string' ? child.label : 'Input field'}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all"
                          disabled
                        />
                        {(child['helper-text'] || child.helperText) && typeof (child['helper-text'] || child.helperText) === 'string' && (
                          <p className="text-sm text-gray-500 mt-2">{child['helper-text'] || child.helperText}</p>
                        )}
                        {child.required && (
                          <p className="text-sm text-red-500 mt-1">* Required</p>
                        )}
                      </div>
                    )}
                    
                    {/* Dropdown */}
                    {child.type === 'Dropdown' && (
                      <div className="mt-2">
                        {child.label && typeof child.label === 'string' && (
                          <label className="block text-sm font-medium text-gray-700 mb-1">{child.label}</label>
                        )}
                        <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm" disabled>
                          <option>Select an option</option>
                          {(child['data-source'] || child.dataSource || child.options)?.map((option: any, i: number) => (
                            <option key={i}>{typeof option.title === 'string' ? option.title : option.id || 'Option'}</option>
                          ))}
                        </select>
                        {child.required && (
                          <p className="text-xs text-red-500 mt-1">* Required</p>
                        )}
                      </div>
                    )}
                    
                    {/* CheckboxGroup */}
                    {child.type === 'CheckboxGroup' && (
                      <div className="mt-2">
                        {child.label && typeof child.label === 'string' && (
                          <p className="text-sm font-medium text-gray-700 mb-2">{child.label}</p>
                        )}
                        <div className="space-y-2">
                          {(child['data-source'] || child.dataSource || child.options)?.map((option: any, i: number) => (
                            <label key={i} className="flex items-center gap-2 text-sm">
                              <input type="checkbox" disabled />
                              <span>{typeof option.title === 'string' ? option.title : option.id || 'Option'}</span>
                            </label>
                          ))}
                        </div>
                        {child.required && (
                          <p className="text-xs text-red-500 mt-1">* Required</p>
                        )}
                      </div>
                    )}
                    
                    {/* RadioButtonsGroup */}
                    {child.type === 'RadioButtonsGroup' && (
                      <div>
                        {child.label && typeof child.label === 'string' && (
                          <p className="text-base font-semibold text-gray-900 mb-3">{child.label}</p>
                        )}
                        <div className="space-y-3">
                          {(child['data-source'] || child.dataSource || child.options)?.map((option: any, i: number) => (
                            <label key={i} className="flex items-center gap-3 text-base cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                              <input 
                                type="radio" 
                                name={child.name} 
                                className="w-5 h-5 text-[#25D366] focus:ring-[#25D366]" 
                                disabled 
                              />
                              <span className="text-gray-800">{typeof option.title === 'string' ? option.title : option.id || 'Option'}</span>
                            </label>
                          ))}
                        </div>
                        {child.required && (
                          <p className="text-sm text-red-500 mt-2">* Required</p>
                        )}
                      </div>
                    )}
                    
                    {/* Image Component */}
                    {child.type === 'Image' && (
                      <div className="mt-2">
                        {child.src && typeof child.src === 'string' ? (
                          <img
                            src={child.src}
                            alt={typeof child['alt-text'] === 'string' ? child['alt-text'] : 'Image'}
                            className={`rounded ${child['scale-type'] === 'cover' ? 'object-cover' : 'object-contain'}`}
                            style={{
                              width: child.width ? `${child.width}px` : '100%',
                              height: child.height ? `${child.height}px` : 'auto',
                              aspectRatio: child['aspect-ratio'] || 'auto'
                            }}
                          />
                        ) : (
                          <div className="bg-gray-100 rounded p-4 text-center text-gray-500 text-sm">
                            📷 Image: {typeof child.src === 'object' ? JSON.stringify(child.src) : 'No source'}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Image Carousel */}
                    {child.type === 'ImageCarousel' && (
                      <div className="mt-2">
                        <div className="relative bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">📸 Image Carousel</p>
                          {child.images && Array.isArray(child.images) && child.images.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {child.images.map((img: any, i: number) => (
                                <div key={i} className="flex-shrink-0">
                                  {img.src && typeof img.src === 'string' ? (
                                    <img
                                      src={img.src}
                                      alt={typeof img['alt-text'] === 'string' ? img['alt-text'] : `Image ${i + 1}`}
                                      className={`rounded ${child['scale-type'] === 'cover' ? 'object-cover' : 'object-contain'}`}
                                      style={{
                                        width: '200px',
                                        height: '150px',
                                        aspectRatio: child['aspect-ratio'] || '4/3'
                                      }}
                                    />
                                  ) : (
                                    <div className="w-[200px] h-[150px] bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                      Image {i + 1}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No images in carousel</p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">← Swipe to view more →</p>
                        </div>
                      </div>
                    )}
                    
                    {/* PhotoPicker (Media Upload) */}
                    {child.type === 'PhotoPicker' && (
                      <div className="mt-2">
                        {child.label && typeof child.label === 'string' && (
                          <label className="block text-sm font-medium text-gray-700 mb-1">{child.label}</label>
                        )}
                        {child.description && typeof child.description === 'string' && (
                          <p className="text-xs text-gray-600 mb-2">{child.description}</p>
                        )}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">📷</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">Upload Photos</p>
                            <p className="text-xs text-gray-500">
                              {(child['photo-source'] || child.photoSource) === 'camera' ? 'Take a photo' : 
                               (child['photo-source'] || child.photoSource) === 'gallery' ? 'Select from gallery' : 
                               'Camera or Gallery'}
                            </p>
                            {(child['max-file-size-kb'] || child.maxFileSizeKb) && (
                              <p className="text-xs text-gray-400">Max size: {child['max-file-size-kb'] || child.maxFileSizeKb} KB</p>
                            )}
                            {(child['min-uploaded-photos'] || child.minUploadedPhotos || child['max-uploaded-photos'] || child.maxUploadedPhotos) && (
                              <p className="text-xs text-gray-400">
                                {child['min-uploaded-photos'] || child.minUploadedPhotos || 0} - {child['max-uploaded-photos'] || child.maxUploadedPhotos || 30} photos
                              </p>
                            )}
                          </div>
                        </div>
                        {(child['min-uploaded-photos'] || child.minUploadedPhotos) > 0 && (
                          <p className="text-xs text-red-500 mt-1">* Required (min {child['min-uploaded-photos'] || child.minUploadedPhotos} photos)</p>
                        )}
                      </div>
                    )}
                    
                    {/* DocumentPicker */}
                    {child.type === 'DocumentPicker' && (
                      <div className="mt-2">
                        {child.label && typeof child.label === 'string' && (
                          <label className="block text-sm font-medium text-gray-700 mb-1">{child.label}</label>
                        )}
                        {child.description && typeof child.description === 'string' && (
                          <p className="text-xs text-gray-600 mb-2">{child.description}</p>
                        )}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-2xl">📄</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">Upload Documents</p>
                            {(child['allowed-mime-types'] || child.allowedMimeTypes) && Array.isArray(child['allowed-mime-types'] || child.allowedMimeTypes) && (
                              <p className="text-xs text-gray-500">
                                Allowed: {(child['allowed-mime-types'] || child.allowedMimeTypes).slice(0, 3).join(', ')}
                                {(child['allowed-mime-types'] || child.allowedMimeTypes).length > 3 && '...'}
                              </p>
                            )}
                            {(child['max-file-size-kb'] || child.maxFileSizeKb) && (
                              <p className="text-xs text-gray-400">Max size: {child['max-file-size-kb'] || child.maxFileSizeKb} KB</p>
                            )}
                            {(child['min-uploaded-documents'] || child.minUploadedDocuments || child['max-uploaded-documents'] || child.maxUploadedDocuments) && (
                              <p className="text-xs text-gray-400">
                                {child['min-uploaded-documents'] || child.minUploadedDocuments || 0} - {child['max-uploaded-documents'] || child.maxUploadedDocuments || 30} documents
                              </p>
                            )}
                          </div>
                        </div>
                        {(child['min-uploaded-documents'] || child.minUploadedDocuments) > 0 && (
                          <p className="text-xs text-red-500 mt-1">* Required (min {child['min-uploaded-documents'] || child.minUploadedDocuments} documents)</p>
                        )}
                      </div>
                    )}
                    
                    {/* Footer Buttons */}
                    {child.type === 'Footer' && (
                      <button className="w-full px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg text-base font-semibold shadow-md transition-colors">
                        {typeof child.label === 'string' ? child.label : 'Continue'}
                      </button>
                    )}
                    
                    {/* Unknown/Other Components - Show raw data */}
                    {!['TextBody', 'TextHeading', 'TextSubheading', 'TextCaption', 'RichText', 'TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea', 'Dropdown', 'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'OptIn', 'Footer', 'Image', 'ImageCarousel', 'PhotoPicker', 'DocumentPicker', 'EmbeddedLink', 'DatePicker', 'CalendarPicker', 'NavigationList', 'Form'].includes(child.type) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Component Properties:</p>
                        <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(child, null, 2)}</pre>
                      </div>
                    )}
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-white border-l border-gray-200 shadow-2xl z-[9999] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Flow Preview
            </h2>
            <p className="text-sm text-gray-600">{flowName}</p>
            <p className="text-xs text-gray-500">Flow ID: {flowId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader className="w-12 h-12 text-primary-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading flow preview...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Failed to load preview</p>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadFlowAsset}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : flowAsset ? (
            <div>
              {/* Check if flow has screens */}
              {flowAsset.screens && flowAsset.screens.length > 0 ? (
                <>
                  {/* Screen Tabs */}
                  {flowAsset.screens.length > 1 && (
                    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                      {flowAsset.screens.map((screen: any, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedScreen(index)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                            selectedScreen === index
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {typeof screen.title === 'string' ? screen.title : `Screen ${index + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Screen Preview */}
                  {renderScreenPreview(flowAsset.screens[selectedScreen])}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
                  <p className="text-gray-900 font-medium mb-2">Screen Data Not Accessible</p>
                  <p className="text-sm text-gray-600 mb-4 text-center max-w-md">
                    {flowAsset._note || "Unable to load flow screens due to CORS restrictions. This is a limitation of WhatsApp's API."}
                  </p>
                  
                  <div className="space-y-3 w-full max-w-md">
                    {previewUrl && (
                      <button
                        onClick={() => window.open(previewUrl, '_blank', 'width=400,height=700')}
                        className="w-full px-4 py-3 bg-whatsapp-500 hover:bg-whatsapp-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open WhatsApp Preview
                      </button>
                    )}
                    
                    {flowAsset._flowInfo?.preview?.download_url && (
                      <button
                        onClick={() => {
                          const url = flowAsset._flowInfo?.preview?.download_url;
                          if (url) window.open(url, '_blank');
                        }}
                        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Download Flow JSON
                      </button>
                    )}
                    
                    <button
                      onClick={() => setShowJsonInput(!showJsonInput)}
                      className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Code2 className="w-4 h-4" />
                      {showJsonInput ? 'Hide' : 'Paste'} JSON Manually
                    </button>
                    
                    {showJsonInput && (
                      <div className="space-y-2">
                        <textarea
                          value={jsonInput}
                          onChange={(e) => setJsonInput(e.target.value)}
                          placeholder="Paste the downloaded JSON here..."
                          className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleLoadFromJson}
                          disabled={!jsonInput.trim()}
                          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                        >
                          Load Preview from JSON
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <p className="text-sm text-amber-800 mb-2">
                        <strong>Why can't I see the screens?</strong>
                      </p>
                      <p className="text-xs text-amber-700 mb-2">
                        WhatsApp's download URLs have CORS restrictions that prevent direct access from web browsers.
                      </p>
                      <p className="text-xs text-amber-700">
                        <strong>Workaround:</strong> Use the buttons above to view the flow in WhatsApp's preview or download the JSON directly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Flow Info */}
              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Flow Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium text-gray-900">{flowAsset.version || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Screens:</span>
                    <span className="font-medium text-gray-900">{flowAsset.screens?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data API Version:</span>
                    <span className="font-medium text-gray-900">{flowAsset.data_api_version || 'N/A'}</span>
                  </div>
                  {flowAsset._flowInfo?.preview?.preview_url && (
                    <div className="pt-2 border-t border-gray-200">
                      <a
                        href={flowAsset._flowInfo.preview.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View in WhatsApp Preview
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">No flow data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <a
              href={`https://business.facebook.com/wa/manage/flows/${flowId}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open in WhatsApp Manager
            </a>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
