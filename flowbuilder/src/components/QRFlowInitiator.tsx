import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCode, Download, Copy, Share2, ExternalLink, Play, AlertCircle } from 'lucide-react'

interface Flow {
  id: string
  name: string
  status: string
}

interface QRFlowInitiatorProps {
  businessPhoneNumber: string
  activeFlowId: string
  allFlows: Flow[]
  flowActivationMessages: Record<string, string>
  onFlowTrigger?: (customerPhone: string, flowId: string) => Promise<void>
  onCopySuccess?: () => void
}

const QRFlowInitiator: React.FC<QRFlowInitiatorProps> = ({
  businessPhoneNumber,
  activeFlowId,
  allFlows,
  flowActivationMessages,
  onFlowTrigger,
  onCopySuccess
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [triggerUrl, setTriggerUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Find the active flow details
  const activeFlow = allFlows.find(f => f.id === activeFlowId)

  // Generate flow trigger URL
  const generateTriggerUrl = () => {
    if (!activeFlowId) return ''
    
    // Create a unique trigger URL that will initiate the flow
    // This could be a deep link to your web app that handles flow initiation
    const baseUrl = window.location.origin
    const flowName = activeFlow?.name || 'Flow'
    const encodedFlowName = encodeURIComponent(flowName)
    
    // Format: your-domain.com/trigger-flow?flowId=XXX&flowName=YYY&businessPhone=ZZZ
    return `${baseUrl}/trigger-flow?flowId=${activeFlowId}&flowName=${encodedFlowName}&businessPhone=${businessPhoneNumber}`
  }

  // Get the stored activation message for the selected flow
  const getFlowActivationMessage = () => {
    if (!activeFlowId) return 'Please select a flow first.'
    
    // Get the stored activation message for this specific flow
    const storedMessage = flowActivationMessages[activeFlowId]
    
    if (storedMessage) {
      return storedMessage
    }
    
    // Fallback if no stored message found
    return `Hi! Please complete the "${activeFlow?.name || 'form'}" - it will only take a few minutes!`
  }

  // Generate WhatsApp URL that includes flow trigger information
  const generateWhatsAppUrl = () => {
    if (!activeFlowId || !activeFlow) return ''
    
    const cleanPhoneNumber = businessPhoneNumber.replace(/\D/g, '')
    
    // Use the stored activation message for this flow
    const message = getFlowActivationMessage()
    const encodedMessage = encodeURIComponent(message)
    
    // WhatsApp deep link format with stored activation message
    return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
  }

  // Generate QR code
  const generateQRCode = async () => {
    if (!activeFlowId) {
      setQrCodeUrl('')
      setTriggerUrl('')
      return
    }

    try {
      setIsGenerating(true)
      
      // Use WhatsApp URL for now (simpler implementation)
      // Later can be enhanced to use custom trigger URL
      const url = generateWhatsAppUrl()
      setTriggerUrl(url)

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#25D366', // WhatsApp green
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M'
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating flow QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-generate when active flow or activation messages change
  useEffect(() => {
    generateQRCode()
  }, [activeFlowId, businessPhoneNumber, flowActivationMessages])

  // Download QR code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `whatsapp-flow-qr-${activeFlow?.name || 'flow'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copy QR code URL to clipboard
  const copyToClipboard = async () => {
    if (!triggerUrl) return
    
    try {
      await navigator.clipboard.writeText(triggerUrl)
      onCopySuccess?.()
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  // Share QR code
  const shareQRCode = async () => {
    if (!triggerUrl || !activeFlow) return
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activeFlow.name} - WhatsApp Flow`,
          text: `Scan this QR code to start the "${activeFlow.name}" flow on WhatsApp`,
          url: triggerUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard()
    }
  }

  // Test the flow trigger
  const testFlow = () => {
    if (triggerUrl) {
      window.open(triggerUrl, '_blank')
    }
  }

  // No active flow selected
  if (!activeFlowId) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No Active Flow Selected</h3>
        <p className="text-lg text-gray-700 mb-6 max-w-md mx-auto">
          Please select an active flow to generate a QR code that will automatically activate that flow.
        </p>
        
        <div className="bg-gradient-to-br from-blue-100 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 text-left mt-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white text-lg">💾</span>
            </div>
            <h4 className="text-xl font-bold text-blue-900">Stored Activation Messages</h4>
          </div>
          <p className="text-base text-blue-800 mb-4 font-medium">
            Each QR code uses the activation message you configured when creating that specific flow.
          </p>
          <div className="space-y-3">
            <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-start">
                <span className="text-green-600 text-lg mr-3">✅</span>
                <div>
                  <strong className="text-gray-900 text-sm">Your Custom Messages:</strong>
                  <p className="text-gray-700 text-sm mt-1">When you create a flow, the activation message you set is automatically stored and used for QR codes</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-start">
                <span className="text-purple-600 text-lg mr-3">🎯</span>
                <div>
                  <strong className="text-gray-900 text-sm">Flow-Specific:</strong>
                  <p className="text-gray-700 text-sm mt-1">Each flow keeps its own unique activation message - no generic messages!</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-blue-200 p-4 rounded-lg shadow-sm">
              <div className="flex items-start">
                <span className="text-orange-600 text-lg mr-3">💡</span>
                <div>
                  <strong className="text-gray-900 text-sm">Professional:</strong>
                  <p className="text-gray-700 text-sm mt-1">Customers see your exact branded message when they scan the QR code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Flow Information */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Play className="w-5 h-5 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Active Flow</h3>
            <p className="text-green-700">{activeFlow?.name}</p>
            <p className="text-sm text-green-600">Flow ID: {activeFlowId}</p>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      <div className="text-center">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Generating QR code...</p>
          </div>
        ) : qrCodeUrl ? (
          <div className="space-y-4">
            <img 
              src={qrCodeUrl} 
              alt={`QR Code for ${activeFlow?.name} Flow`}
              className="mx-auto rounded-lg shadow-lg"
            />
            <div className="bg-gradient-to-br from-gray-100 to-slate-50 border-2 border-gray-300 rounded-lg p-5 text-left shadow-sm">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📱</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900">How it works:</h4>
              </div>
              <ul className="text-base text-gray-800 space-y-2 font-medium">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-3 mt-1">1️⃣</span>
                  <span>Customer scans QR code with their phone</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">2️⃣</span>
                  <span>WhatsApp opens with your custom activation message</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-3 mt-1">3️⃣</span>
                  <span>Flow automatically starts for the customer</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-600 mr-3 mt-1">4️⃣</span>
                  <span>Customer can immediately interact with the flow</span>
                </li>
              </ul>
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <h5 className="font-medium text-blue-900 text-sm mb-1">Activation Message:</h5>
                <p className="text-xs text-blue-700 break-words">
                  "{getFlowActivationMessage()}"
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  � Using message configured when flow "{activeFlow?.name}" was created
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <QrCode className="w-8 h-8 mr-2" />
            <span>Unable to generate QR code</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {qrCodeUrl && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={downloadQRCode}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
          
          <button
            onClick={copyToClipboard}
            className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy URL
          </button>
          
          <button
            onClick={shareQRCode}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </button>
          
          <button
            onClick={testFlow}
            className="flex items-center justify-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Test
          </button>
        </div>
      )}

      {/* Technical Details */}
      {triggerUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">QR Code URL:</h4>
          <code className="text-xs text-gray-600 break-all bg-white p-2 rounded border block">
            {triggerUrl}
          </code>
        </div>
      )}
    </div>
  )
}

export default QRFlowInitiator