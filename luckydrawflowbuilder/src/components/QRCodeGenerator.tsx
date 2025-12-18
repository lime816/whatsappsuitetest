import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { QrCode, Download, Copy, Share2, ExternalLink } from 'lucide-react'

interface QRCodeGeneratorProps {
  businessPhoneNumber: string
  prefillMessage: string
  onCopySuccess?: () => void
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  businessPhoneNumber,
  prefillMessage,
  onCopySuccess
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [whatsappUrl, setWhatsappUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate WhatsApp deep link to business number with prefilled message
  const generateWhatsAppUrl = () => {
    const encodedMessage = encodeURIComponent(prefillMessage)
    const cleanPhoneNumber = businessPhoneNumber.replace(/\D/g, '') // Remove non-digits
    
    // WhatsApp deep link format: https://wa.me/BUSINESS_NUMBER?text=PREFILLED_MESSAGE
    return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
  }

  // Generate QR code
  const generateQRCode = async () => {
    try {
      setIsGenerating(true)
      const url = generateWhatsAppUrl()
      setWhatsappUrl(url)

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
      console.error('Error generating QR code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (businessPhoneNumber && prefillMessage) {
      generateQRCode()
    }
  }, [businessPhoneNumber, prefillMessage])

  const downloadQR = () => {
    if (!qrCodeUrl) return
    
    const link = document.createElement('a')
    link.download = `whatsapp-business-qr-${Date.now()}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(whatsappUrl)
      onCopySuccess?.()
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const openWhatsApp = () => {
    window.open(whatsappUrl, '_blank')
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Contact us on WhatsApp',
          text: prefillMessage,
          url: whatsappUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      copyUrl()
    }
  }

  if (!businessPhoneNumber || !prefillMessage) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
        <div className="text-center">
          <QrCode className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
            QR Code Generator Ready
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Configure business phone number and message to generate QR code
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* QR Code Display */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">WhatsApp Business QR Code</h3>
            <p className="text-sm text-gray-600">Scan to chat with prefilled message</p>
          </div>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center h-80">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-whatsapp-200 border-t-whatsapp-500"></div>
              <QrCode className="w-6 h-6 text-whatsapp-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        ) : qrCodeUrl ? (
          <div className="text-center">
            <div className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-6">
              <img 
                src={qrCodeUrl} 
                alt="WhatsApp Business QR Code" 
                className="mx-auto rounded-lg"
              />
            </div>
            
            <div className="bg-primary-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-primary-800 font-medium mb-2">
                📱 How it works:
              </p>
              <ul className="text-xs text-primary-700 space-y-1 text-left max-w-md mx-auto">
                <li>1. User scans QR code with phone camera</li>
                <li>2. WhatsApp opens with your business chat</li>
                <li>3. Message is prefilled, user can edit if needed</li>
                <li>4. User taps send to start conversation</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={downloadQR}
                className="inline-flex items-center gap-2 px-4 py-2 bg-whatsapp-600 text-white rounded-lg hover:bg-whatsapp-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download QR
              </button>
              
              <button
                onClick={copyUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Test Link
              </button>
              
              <button
                onClick={shareUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            <QrCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Failed to generate QR code</p>
          </div>
        )}
      </div>

      {/* Configuration Preview */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
          Configuration Preview
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Business Number:</span>
            <code className="text-primary-600 font-mono">+{businessPhoneNumber}</code>
          </div>
          
          <div>
            <span className="text-gray-600 block mb-1">Prefilled Message:</span>
            <div className="bg-white p-3 rounded border text-gray-800">
              "{prefillMessage}"
            </div>
          </div>
          
          <div>
            <span className="text-gray-600 block mb-1">Generated URL:</span>
            <code className="text-xs bg-white p-2 rounded border block break-all text-primary-600">
              {whatsappUrl}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeGenerator