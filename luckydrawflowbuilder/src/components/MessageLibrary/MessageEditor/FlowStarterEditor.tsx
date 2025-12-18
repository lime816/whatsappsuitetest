import { } from 'react'
import { ExternalLink } from 'lucide-react'
import type { FlowStarterContent } from '../../../types'

type FlowStarterEditorProps = {
  content: FlowStarterContent
  onChange: (content: FlowStarterContent) => void
}

export default function FlowStarterEditor({ content, onChange }: FlowStarterEditorProps) {
  const handleFieldChange = (field: keyof FlowStarterContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  return (
    <div className="space-y-6">
      {/* Flow ID */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Flow ID *
        </label>
        <input
          type="text"
          value={content.flowId || ''}
          onChange={(e) => handleFieldChange('flowId', e.target.value)}
          placeholder="Enter WhatsApp Flow ID (e.g., 1234567890)"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          The ID of the WhatsApp Flow to launch when this message is triggered
        </p>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Activation Message *
        </label>
        <textarea
          value={content.message || ''}
          onChange={(e) => handleFieldChange('message', e.target.value)}
          placeholder="Enter the message that will be sent with the flow..."
          rows={4}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-vertical"
        />
        <p className="text-xs text-slate-500 mt-1">
          This message will be sent along with the flow activation button
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-400 mb-2">Flow Starter Information</h4>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• This will send an interactive message with a button to start the specified flow</li>
              <li>• The Flow ID must be from a published WhatsApp Flow in your Business Manager</li>
              <li>• Users will see the activation message and a "Start Flow" button</li>
              <li>• When clicked, it will open the WhatsApp Flow interface</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="border border-slate-600 rounded-lg p-4 bg-slate-900">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
        <div className="bg-whatsapp-500 text-white rounded-lg max-w-xs">
          <div className="px-3 py-3">
            <p className="text-sm whitespace-pre-wrap">
              {content.message || 'Your activation message will appear here...'}
            </p>
          </div>

          <div className="px-3 pb-3">
            <div className="bg-white/20 text-center py-2 px-3 rounded text-sm font-medium">
              🚀 Start Flow
            </div>
          </div>
        </div>

        {content.flowId && (
          <div className="mt-3 text-xs text-slate-400">
            <p><strong>Target Flow ID:</strong> {content.flowId}</p>
          </div>
        )}
      </div>
    </div>
  )
}
