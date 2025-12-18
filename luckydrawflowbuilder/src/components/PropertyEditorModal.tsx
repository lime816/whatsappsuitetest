import React from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { AnyElement } from '../types'

interface PropertyEditorModalProps {
  screenId: string
  element: AnyElement
  onClose: () => void
}

export default function PropertyEditorModal({ screenId, element, onClose }: PropertyEditorModalProps) {
  const { updateElement } = useFlowStore()
  const [localElement, setLocalElement] = React.useState(element)

  const handleSave = () => {
    updateElement(screenId, localElement)
    onClose()
  }

  const updateField = (field: string, value: any) => {
    setLocalElement({ ...localElement, [field]: value } as AnyElement)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl glass-panel z-50 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit {element.type}</h2>
            <p className="text-sm text-slate-400">Configure component properties</p>
          </div>
          <button onClick={onClose} className="btn-secondary p-2" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {renderFields(localElement, updateField)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-700">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            Save Changes
          </button>
        </div>
      </motion.div>
    </>
  )
}

function renderFields(el: AnyElement, update: (field: string, value: any) => void) {
  switch (el.type) {
    case 'TextSubheading':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Text</label>
          <input
            type="text"
            value={el.text}
            onChange={(e) => update('text', e.target.value)}
            className="input-field"
            placeholder="Enter heading text"
          />
        </div>
      )

    case 'RadioButtonsGroup':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor="required" className="text-sm text-slate-300">Required field</label>
          </div>
          <OptionsEditor
            options={el.options}
            onChange={(opts) => update('options', opts)}
          />
        </>
      )

    case 'TextArea':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor="required" className="text-sm text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'Dropdown':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor="required" className="text-sm text-slate-300">Required field</label>
          </div>
          <OptionsEditor
            options={el.options}
            onChange={(opts) => update('options', opts)}
          />
        </>
      )

    case 'Footer':
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Button Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Action</label>
            <select
              value={el.action}
              onChange={(e) => update('action', e.target.value)}
              className="input-field"
            >
              <option value="navigate">Navigate to next screen</option>
              <option value="complete">Complete flow</option>
            </select>
          </div>
          {el.action === 'navigate' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Next Screen ID</label>
              <input
                type="text"
                value={el.nextScreen ?? ''}
                onChange={(e) => update('nextScreen', e.target.value)}
                className="input-field"
                placeholder="e.g., RATE"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Payload Keys (comma-separated)
            </label>
            <input
              type="text"
              value={el.payloadKeys.join(', ')}
              onChange={(e) => update('payloadKeys', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="input-field"
              placeholder="e.g., Choose_one, Leave_a_comment"
            />
            <p className="text-xs text-slate-500 mt-1">
              Data keys to pass to the next screen or final payload
            </p>
          </div>
        </>
      )

    default:
      return null
  }
}

function OptionsEditor({ options, onChange }: { options: { id: string; title: string }[]; onChange: (v: { id: string; title: string }[]) => void }) {
  const addOption = () => {
    onChange([...options, { id: `${options.length}_Option`, title: 'New Option' }])
  }

  const updateOption = (index: number, field: 'id' | 'title', value: string) => {
    const updated = options.map((opt, i) => i === index ? { ...opt, [field]: value } : opt)
    onChange(updated)
  }

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-slate-300">Options</label>
        <button onClick={addOption} className="btn-secondary text-xs flex items-center gap-1 py-1 px-2">
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {options.map((opt, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={opt.id}
              onChange={(e) => updateOption(idx, 'id', e.target.value)}
              className="input-field flex-1"
              placeholder="ID"
            />
            <input
              type="text"
              value={opt.title}
              onChange={(e) => updateOption(idx, 'title', e.target.value)}
              className="input-field flex-1"
              placeholder="Title"
            />
            <button
              onClick={() => removeOption(idx)}
              className="btn-danger p-2"
              aria-label="Remove option"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
