import React from 'react'
import type { StandardTextContent } from '../../../types'

type StandardTextEditorProps = {
  content: StandardTextContent
  onChange: (content: StandardTextContent) => void
}

export default function StandardTextEditor({ content, onChange }: StandardTextEditorProps) {
  const handleBodyChange = (body: string) => {
    onChange({ ...content, body })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Message Text *
        </label>
        <textarea
          value={content.body || ''}
          onChange={(e) => handleBodyChange(e.target.value)}
          placeholder="Enter your message text here..."
          rows={6}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-vertical"
        />
        <p className="text-xs text-slate-500 mt-1">
          This will be sent as a standard WhatsApp text message.
        </p>
      </div>

      {/* Preview */}
      <div className="border border-slate-600 rounded-lg p-4 bg-slate-900">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
        <div className="bg-whatsapp-500 text-white p-3 rounded-lg max-w-xs">
          <p className="text-sm whitespace-pre-wrap">
            {content.body || 'Your message text will appear here...'}
          </p>
        </div>
      </div>
    </div>
  )
}
