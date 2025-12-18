import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileSpreadsheet, Download, CheckCircle, XCircle, Eye } from 'lucide-react'

type ParsedData = [string, string][]

interface ImportResult {
  success: boolean
  message?: string
  summary?: {
    totalMessages: number
    totalTriggers: number
    timestamp: string
  }
  error?: string
}

export default function ExcelImporter() {
  const [rawData, setRawData] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://whatsappbackend-production-8946.up.railway.app'

  const parseData = () => {
    if (!rawData.trim()) {
      setResult({ success: false, error: 'Please paste your Excel data first.' })
      return
    }

    try {
      const lines = rawData.split('\n')
      const parsed: ParsedData = []
      
      lines.forEach((line) => {
        if (line.trim()) {
          const parts = line.split(',')
          if (parts.length >= 2) {
            const trigger = parts[0].trim()
            const message = parts.slice(1).join(',').trim()
            parsed.push([trigger, message])
          }
        }
      })

      setParsedData(parsed)
      setResult({ 
        success: true, 
        message: `Parsed ${parsed.length} trigger-message pairs successfully!` 
      })
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Error parsing data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    }
  }

  const importData = async () => {
    if (parsedData.length === 0) {
      setResult({ success: false, error: 'Please parse your data first.' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${backendUrl}/api/message-library/import-excel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: parsedData })
      })

      const result = await response.json()
      
      if (result.success) {
        setResult({
          success: true,
          message: `Successfully imported ${result.summary.totalMessages} messages and ${result.summary.totalTriggers} triggers!`,
          summary: result.summary
        })
      } else {
        setResult({ success: false, error: result.error || 'Import failed' })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testImport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${backendUrl}/api/message-library/test-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setResult({
          success: true,
          message: `Test successful! Imported ${result.summary.totalMessages} sample messages and ${result.summary.totalTriggers} triggers.`,
          summary: result.summary
        })
      } else {
        setResult({ success: false, error: result.error || 'Test failed' })
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: `Error testing import: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadSampleData = () => {
    const sampleData = `hello,Welcome to Daya Hospital! How can I help you today? 🏥
appointment,To book an appointment please call us at +91-XXX-XXXX or visit our website. Our timings are 9 AM to 6 PM.
emergency,For medical emergencies please call our 24/7 helpline: +91-XXX-XXXX or visit our emergency department immediately.
services,We offer: General Medicine Cardiology Orthopedics Pediatrics Gynecology and Emergency Care. Which service do you need?
location,Daya Hospital is located at [Your Address]. We are easily accessible by public transport and have parking facilities.
hours,Our hospital timings: 🕘 OPD: 9:00 AM - 6:00 PM 🚨 Emergency: 24/7 📞 Phone: 9:00 AM - 8:00 PM
doctor,Our experienced doctors are available for consultation. Please specify which department you need: Cardiology Orthopedics Pediatrics etc.
fees,Consultation fees vary by department. Please call +91-XXX-XXXX for current fee structure or visit our reception.
reports,Lab reports are usually ready within 24-48 hours. You can collect them from the lab or we can email them to you.
insurance,We accept most major insurance plans. Please bring your insurance card and ID for verification during your visit.`
    
    setRawData(sampleData)
    parseData()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Excel Data Importer</h1>
        </div>
        <p className="text-slate-300">Import triggers and messages from your Excel file</p>
      </div>

      {/* Step 1: Data Input */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Step 1: Paste Excel Data
        </h2>
        <p className="text-slate-300 mb-4">
          Copy data from your Excel file (Column A: triggers, Column B: messages) and paste below:
        </p>
        
        <textarea
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="Example:
hello,Welcome to Daya Hospital! How can I help you today? 🏥
appointment,To book an appointment please call us at +91-XXX-XXXX
emergency,For medical emergencies call our 24/7 helpline: +91-XXX-XXXX"
          className="w-full h-40 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono text-sm"
        />
        
        <div className="flex gap-3 mt-4">
          <button
            onClick={parseData}
            className="btn-primary flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Parse Data
          </button>
          <button
            onClick={loadSampleData}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Load Sample Data
          </button>
        </div>
      </div>

      {/* Step 2: Preview */}
      {parsedData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Step 2: Preview ({parsedData.length} pairs)
            </h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-secondary text-sm"
            >
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
          
          {showPreview && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {parsedData.map(([trigger, message], index) => (
                <div key={index} className="bg-slate-900 p-3 rounded-lg border-l-4 border-blue-500">
                  <div className="font-medium text-blue-400">
                    {index + 1}. Trigger: "{trigger}"
                  </div>
                  <div className="text-slate-300 text-sm mt-1">
                    Message: "{message.substring(0, 100)}{message.length > 100 ? '...' : ''}"
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Import */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Step 3: Import to Backend
        </h2>
        
        <div className="flex gap-3 mb-4">
          <button
            onClick={importData}
            disabled={isLoading || parsedData.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Import Data
          </button>
          
          <button
            onClick={testImport}
            disabled={isLoading}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Test with Sample
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 rounded-lg flex items-start gap-3 ${
            result.success 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <div className={`font-medium ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'Success!' : 'Error'}
              </div>
              <div className="text-slate-300 text-sm mt-1">
                {result.message || result.error}
              </div>
              {result.summary && (
                <div className="text-slate-400 text-xs mt-2">
                  Imported at: {new Date(result.summary.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">📖 Instructions</h2>
        <ol className="text-slate-300 space-y-2 list-decimal list-inside">
          <li>Open your Excel file (Daya_Hospital_Existing_User_Flow.xlsx)</li>
          <li>Select all data (triggers in column A, messages in column B)</li>
          <li>Copy the data (Ctrl+C)</li>
          <li>Paste here in the text area above</li>
          <li>Click "Parse Data" to preview</li>
          <li>Click "Import Data" to save to backend</li>
        </ol>
      </div>
    </motion.div>
  )
}
