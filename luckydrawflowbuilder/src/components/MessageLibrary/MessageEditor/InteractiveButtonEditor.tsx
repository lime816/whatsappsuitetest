import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid/non-secure'
import type { InteractiveButtonContent, InteractiveButton } from '../../../types'

type InteractiveButtonEditorProps = {
  content: InteractiveButtonContent
  onChange: (content: InteractiveButtonContent) => void
}

export default function InteractiveButtonEditor({ content, onChange }: InteractiveButtonEditorProps) {
  const handleFieldChange = (field: keyof InteractiveButtonContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const handleButtonChange = (buttonId: string, field: keyof InteractiveButton, value: string) => {
    const updatedButtons = content.buttons.map(button =>
      button.id === buttonId ? { ...button, [field]: value } : button
    )
    onChange({ ...content, buttons: updatedButtons })
  }

  const addButton = () => {
    if (content.buttons.length >= 3) return // WhatsApp limit
    
    const newButton: InteractiveButton = {
      id: nanoid(6),
      title: `Button ${content.buttons.length + 1}`,
      buttonId: `btn_${content.buttons.length + 1}`
    }
    
    onChange({ ...content, buttons: [...content.buttons, newButton] })
  }

  const removeButton = (buttonId: string) => {
    const updatedButtons = content.buttons.filter(button => button.id !== buttonId)
    onChange({ ...content, buttons: updatedButtons })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Header Text (Optional)
        </label>
        <input
          type="text"
          value={content.header || ''}
          onChange={(e) => handleFieldChange('header', e.target.value)}
          placeholder="Header text (optional)"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Message Body *
        </label>
        <textarea
          value={content.body || ''}
          onChange={(e) => handleFieldChange('body', e.target.value)}
          placeholder="Enter your message body here..."
          rows={4}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-vertical"
        />
      </div>

      {/* Footer */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Footer Text (Optional)
        </label>
        <input
          type="text"
          value={content.footer || ''}
          onChange={(e) => handleFieldChange('footer', e.target.value)}
          placeholder="Footer text (optional)"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Buttons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-slate-300">
            Reply Buttons (Max 3)
          </label>
          <button
            onClick={addButton}
            disabled={content.buttons.length >= 3}
            className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Button
          </button>
        </div>

        <div className="space-y-3">
          {content.buttons.map((button, index) => (
            <div key={button.id} className="border border-slate-600 rounded-lg p-4 bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-300">Button {index + 1}</h4>
                <button
                  onClick={() => removeButton(button.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Button Title</label>
                  <input
                    type="text"
                    value={button.title}
                    onChange={(e) => handleButtonChange(button.id, 'title', e.target.value)}
                    placeholder="Button text"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Button ID</label>
                  <input
                    type="text"
                    value={button.buttonId}
                    onChange={(e) => handleButtonChange(button.id, 'buttonId', e.target.value)}
                    placeholder="btn_id"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {content.buttons.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No buttons added yet</p>
            <p className="text-xs">Click "Add Button" to create reply buttons</p>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="border border-slate-600 rounded-lg p-4 bg-slate-900">
        <h4 className="text-sm font-medium text-slate-300 mb-2">Preview</h4>
        <div className="bg-whatsapp-500 text-white rounded-lg max-w-xs">
          {content.header && (
            <div className="px-3 pt-3 pb-1">
              <p className="text-sm font-medium">{content.header}</p>
            </div>
          )}
          
          <div className="px-3 py-2">
            <p className="text-sm whitespace-pre-wrap">
              {content.body || 'Your message body will appear here...'}
            </p>
          </div>

          {content.footer && (
            <div className="px-3 pt-1 pb-2">
              <p className="text-xs opacity-75">{content.footer}</p>
            </div>
          )}

          {content.buttons.length > 0 && (
            <div className="px-3 pb-3 space-y-1">
              {content.buttons.map((button) => (
                <div
                  key={button.id}
                  className="bg-white/20 text-center py-2 px-3 rounded text-sm font-medium"
                >
                  {button.title || 'Button Text'}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
