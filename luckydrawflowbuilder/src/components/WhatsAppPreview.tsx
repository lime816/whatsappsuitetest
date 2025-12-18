import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, MessageCircle, Phone, Video, MoreVertical, Send, Wifi, WifiOff } from 'lucide-react'
import type { Screen, AnyElement } from '../types'
import { whatsAppService } from '../utils/whatsappService'

interface WhatsAppPreviewProps {
  screens: Screen[]
  onClose: () => void
}

interface WhatsAppElementProps {
  element: AnyElement
  onNavigate?: (screenId: string) => void
}

// WhatsApp Element Renderers
const WhatsAppElement: React.FC<WhatsAppElementProps> = ({ element, onNavigate }) => {
  const baseClasses = "mb-3"

  switch (element.type) {
    case 'TextHeading':
      return (
        <div className={`${baseClasses} text-lg font-semibold text-gray-900 leading-tight`}>
          {element.text}
        </div>
      )

    case 'TextSubheading':
      return (
        <div className={`${baseClasses} text-base font-medium text-gray-800 leading-snug`}>
          {element.text}
        </div>
      )

    case 'TextBody':
      return (
        <div className={`${baseClasses} text-sm text-gray-700 leading-relaxed ${
          element.fontWeight === 'bold' ? 'font-semibold' : ''
        } ${element.strikethrough ? 'line-through' : ''}`}>
          {element.text}
        </div>
      )

    case 'TextCaption':
      return (
        <div className={`${baseClasses} text-xs text-gray-500 ${
          element.fontWeight === 'bold' ? 'font-semibold' : ''
        } ${element.strikethrough ? 'line-through' : ''}`}>
          {element.text}
        </div>
      )

    case 'RichText':
      return (
        <div className={`${baseClasses} text-sm text-gray-700 leading-relaxed prose prose-sm`}>
          <div dangerouslySetInnerHTML={{ __html: element.text }} />
        </div>
      )

    case 'TextInput':
    case 'EmailInput':
    case 'PasswordInput':
    case 'PhoneInput':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type={element.type === 'EmailInput' ? 'email' : 
                  element.type === 'PasswordInput' ? 'password' :
                  element.type === 'PhoneInput' ? 'tel' : 'text'}
            placeholder={element.helperText || `Enter ${element.label?.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )

    case 'TextArea':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            placeholder={`Enter ${element.label?.toLowerCase()}`}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )

    case 'RadioButtonsGroup':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {element.options?.map((option: { id: string; title: string }, index: number) => (
              <label key={option.id || index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={element.name}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{option.title}</span>
              </label>
            ))}
          </div>
        </div>
      )

    case 'CheckboxGroup':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="space-y-2">
            {element.dataSource?.map((option: { id: string; title: string }, index: number) => (
              <label key={option.id || index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{option.title}</span>
              </label>
            ))}
          </div>
        </div>
      )

    case 'ChipsSelector':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-2">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {element.description && (
            <p className="text-xs text-gray-500 mb-2">{element.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {element.dataSource?.map((option: { id: string; title: string }, index: number) => (
              <button
                key={option.id || index}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-green-50 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {option.title}
              </button>
            ))}
          </div>
        </div>
      )

    case 'Dropdown':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">Select an option</option>
            {element.options?.map((option: { id: string; title: string }, index: number) => (
              <option key={option.id || index} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </div>
      )

    case 'OptIn':
      return (
        <div className={baseClasses}>
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500 focus:ring-2 mt-0.5"
            />
            <span className="text-sm text-gray-700">{element.label}</span>
          </label>
        </div>
      )

    case 'NavigationList':
      return (
        <div className={baseClasses}>
          {element.label && (
            <label className="block text-sm text-gray-600 mb-2">{element.label}</label>
          )}
          <div className="space-y-1">
            {element.listItems?.map((item: any, index: number) => (
              <button
                key={item.id || index}
                onClick={() => item.nextScreen && onNavigate?.(item.nextScreen)}
                className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                {item.mainContent?.title}
              </button>
            ))}
          </div>
        </div>
      )

    case 'EmbeddedLink':
      return (
        <div className={baseClasses}>
          <a
            href={element.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline hover:text-blue-800 text-sm"
          >
            {element.text}
          </a>
        </div>
      )

    case 'DatePicker':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="date"
            min={element.minDate}
            max={element.maxDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {element.helperText && (
            <p className="text-xs text-gray-500 mt-1">{element.helperText}</p>
          )}
        </div>
      )

    case 'CalendarPicker':
      return (
        <div className={baseClasses}>
          <label className="block text-sm text-gray-600 mb-1">
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {element.title && (
            <div className="text-sm font-medium text-gray-800 mb-1">{element.title}</div>
          )}
          {element.description && (
            <div className="text-xs text-gray-600 mb-2">{element.description}</div>
          )}
          <input
            type={element.mode === 'range' ? 'date' : 'date'}
            min={element.minDate}
            max={element.maxDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {element.helperText && (
            <p className="text-xs text-gray-500 mt-1">{element.helperText}</p>
          )}
        </div>
      )

    case 'Image':
      return (
        <div className={baseClasses}>
          <div className="relative">
            <img
              src={element.src}
              alt={element.altText || 'Image'}
              className="w-full rounded-lg object-cover"
              style={{
                aspectRatio: element.aspectRatio || 'auto',
                objectFit: element.scaleType || 'cover',
                ...(element.width && { maxWidth: `${element.width}px` }),
                ...(element.height && { height: `${element.height}px` })
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'
              }}
            />
          </div>
        </div>
      )

    case 'ImageCarousel':
      return (
        <div className={baseClasses}>
          <div className="relative">
            {element.images && element.images.length > 0 ? (
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {element.images.map((img: { src: string; altText?: string }, index: number) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={img.src}
                      alt={img.altText || `Image ${index + 1}`}
                      className="w-48 h-32 rounded-lg object-cover"
                      style={{
                        aspectRatio: element.aspectRatio || 'auto',
                        objectFit: element.scaleType || 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">No images</span>
              </div>
            )}
          </div>
        </div>
      )

    case 'Footer':
      return (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => element.nextScreen && onNavigate?.(element.nextScreen)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            {element.label || 'Continue'}
          </button>
        </div>
      )

    default:
      return (
        <div className={`${baseClasses} p-2 bg-gray-100 rounded text-xs text-gray-500`}>
          Unsupported element: {(element as any).type}
        </div>
      )
  }
}

export default function WhatsAppPreview({ screens, onClose }: WhatsAppPreviewProps) {
  const [currentScreenId, setCurrentScreenId] = useState(screens[0]?.id || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const currentScreen = screens.find(s => s.id === currentScreenId) || screens[0]

  // Test WhatsApp connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await whatsAppService.testConnection()
        setIsConnected(result.success)
      } catch (error) {
        setIsConnected(false)
      }
    }
    testConnection()
  }, [])

  const handleNavigate = (screenId: string) => {
    setCurrentScreenId(screenId)
  }

  const handleSendTestMessage = async () => {
    if (!phoneNumber || !testMessage || !isConnected) return

    setIsLoading(true)
    try {
      await whatsAppService.sendTextMessage(phoneNumber, testMessage)
      setTestMessage('')
      alert('Message sent successfully!')
    } catch (error) {
      alert('Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-lg p-6 text-center">
          <p className="text-gray-600">No screens available to preview</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WhatsApp Header */}
        <div className="bg-green-600 text-white px-3 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <button
              onClick={onClose}
              className="text-white hover:bg-green-700 rounded-full p-1 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm sm:text-base truncate">{currentScreen.title || 'WhatsApp Flow'}</h3>
                <div className="flex items-center space-x-1">
                  {isConnected ? (
                    <Wifi className="w-3 h-3 text-green-200" />
                  ) : (
                    <WifiOff className="w-3 h-3 text-red-300" />
                  )}
                  <p className="text-xs text-green-100">
                    {isConnected ? 'Connected' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button className="text-white hover:bg-green-700 rounded-full p-1 transition-colors hidden sm:block">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="text-white hover:bg-green-700 rounded-full p-1 transition-colors hidden sm:block">
              <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="text-white hover:bg-green-700 rounded-full p-1 transition-colors">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Screen Navigation */}
        {screens.length > 1 && (
          <div className="bg-gray-50 px-3 sm:px-4 py-2 border-b">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">Screen:</span>
              <select
                value={currentScreenId}
                onChange={(e) => setCurrentScreenId(e.target.value)}
                className="text-xs sm:text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 flex-1 max-w-[200px]"
              >
                {screens.map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.title || screen.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Chat Background */}
        <div 
          className="flex-1 overflow-y-auto h-96 sm:h-[500px] md:h-[600px] p-3 sm:p-4"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#f0f2f5'
          }}
        >
          {/* Message Bubble */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 relative mx-1 sm:mx-0">
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white"></div>
            
            {/* Screen Content */}
            <div className="space-y-3">
              {currentScreen.elements?.map((element) => (
                <WhatsAppElement
                  key={element.id}
                  element={element}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>

            {/* Screen Info */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
              Screen ID: {currentScreen.id}
              {currentScreen.terminal && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded">Terminal</span>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Test Panel */}
        {isConnected && (
          <div className="bg-blue-50 border-t border-blue-200 px-3 sm:px-4 py-3">
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-blue-800 flex items-center gap-1">
                <Send className="w-3 h-3" />
                Test WhatsApp Message
              </h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  placeholder="Phone (e.g., 918281348343)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Test message..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendTestMessage}
                  disabled={isLoading || !phoneNumber || !testMessage}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-xs rounded transition-colors flex items-center gap-1"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3 h-3" />
                  )}
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-gray-100 px-3 sm:px-4 py-3 border-t">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-white rounded-full px-3 sm:px-4 py-2 text-sm text-gray-400 min-w-0">
              Type a message...
            </div>
            <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
