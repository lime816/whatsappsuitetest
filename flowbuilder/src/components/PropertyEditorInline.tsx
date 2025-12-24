import React from 'react'
import { X, Plus, Trash2, Settings } from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { AnyElement } from '../types'

interface PropertyEditorInlineProps {
  screenId: string
  element: AnyElement
  onClose: () => void
}

export default function PropertyEditorInline({ screenId, element, onClose }: PropertyEditorInlineProps) {
  const { updateElement } = useFlowStore()
  const [localElement, setLocalElement] = React.useState(element)

  React.useEffect(() => {
    setLocalElement(element)
  }, [element])

  const handleSave = () => {
    updateElement(screenId, localElement)
    onClose()
  }

  const updateField = (field: string, value: any) => {
    const updated = { ...localElement, [field]: value } as AnyElement
    setLocalElement(updated)
    // Auto-save on change
    updateElement(screenId, updated)
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-whatsapp-500" />
          <h4 className="font-semibold text-white text-sm">Edit {element.type}</h4>
        </div>
        <button 
          onClick={onClose} 
          className="text-slate-400 hover:text-white transition-colors p-1"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {renderFields(localElement, updateField)}
      </div>
    </div>
  )
}

function renderFields(el: AnyElement, update: (field: string, value: any) => void) {
  switch (el.type) {
    case 'TextHeading':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              placeholder="Enter heading text"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={el.visible !== false}
                onChange={(e) => update('visible', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Visible
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.is_visible}'} | Default: True
            </p>
          </div>
        </div>
      )
    case 'TextSubheading':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              placeholder="Enter subheading text"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={el.visible !== false}
                onChange={(e) => update('visible', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Visible
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.is_visible}'} | Default: True
            </p>
          </div>
        </div>
      )
    case 'TextBody':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
            <textarea
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              rows={3}
              placeholder="Enter body text"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.text}'}
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Font Weight</label>
            <select
              value={el.fontWeight || 'normal'}
              onChange={(e) => update('fontWeight', e.target.value)}
              className="input-field text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
              <option value="bold_italic">Bold Italic</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.font_weight}'}
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={!!el.strikethrough}
                onChange={(e) => update('strikethrough', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Strikethrough
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.strikethrough}'}
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={el.visible !== false}
                onChange={(e) => update('visible', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Visible
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.is_visible}'} | Default: True
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={!!el.markdown}
                onChange={(e) => update('markdown', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Markdown Support
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Default: False | Requires Flow JSON V5.1+
            </p>
          </div>
        </div>
      )
    case 'TextCaption':
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
            <textarea
              value={el.text}
              onChange={(e) => {
                const value = e.target.value
                // Enforce 400 character limit
                if (value.length <= 400) {
                  update('text', value)
                }
              }}
              className={`input-field text-sm ${el.text && el.text.length > 400 ? 'border-red-500' : ''}`}
              rows={2}
              placeholder="Enter caption text"
              maxLength={400}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-slate-500">
                Dynamic: ${'{data.text}'}
              </p>
              <p className={`text-xs ${el.text && el.text.length > 380 ? 'text-red-400' : 'text-slate-500'}`}>
                {el.text ? el.text.length : 0}/400 chars
              </p>
            </div>
            {!el.text && (
              <p className="text-xs text-red-400 mt-1">
                Empty or blank value is not accepted
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Font Weight</label>
            <select
              value={el.fontWeight || 'normal'}
              onChange={(e) => update('fontWeight', e.target.value)}
              className="input-field text-sm"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="italic">Italic</option>
              <option value="bold_italic">Bold Italic</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.font_weight}'}
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={!!el.strikethrough}
                onChange={(e) => update('strikethrough', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Strikethrough
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.strikethrough}'}
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={el.visible !== false}
                onChange={(e) => update('visible', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Visible
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.is_visible}'} | Default: True
            </p>
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <input
                type="checkbox"
                checked={!!el.markdown}
                onChange={(e) => update('markdown', e.target.checked)}
                className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
              />
              Markdown Support
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Default: False | Requires Flow JSON V5.1+
            </p>
          </div>
        </div>
      )
    case 'RichText':
      return (
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Markdown Text</label>
          <textarea
            value={el.text}
            onChange={(e) => update('text', e.target.value)}
            className="input-field text-sm font-mono"
            rows={6}
            placeholder="# Heading&#10;&#10;**Bold** and *italic* text"
          />
          <p className="text-xs text-slate-500 mt-1">
            Supports Markdown syntax: **bold**, *italic*, # headings, etc.
          </p>
        </div>
      )

    case 'TextInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Input label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="field_name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Input Type</label>
            <select
              value={el.inputType || 'text'}
              onChange={(e) => update('inputType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="email">Email</option>
              <option value="password">Password</option>
              <option value="passcode">Passcode</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Pattern (Regex)</label>
            <input
              type="text"
              value={el.pattern || ''}
              onChange={(e) => update('pattern', e.target.value)}
              className="input-field text-sm"
              placeholder="^[0-9]+$"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Enter your phone number"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.helper_text}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label Variant</label>
            <select
              value={el.labelVariant || 'standard'}
              onChange={(e) => update('labelVariant', e.target.value)}
              className="input-field text-sm"
            >
              <option value="standard">Standard</option>
              <option value="floating">Floating</option>
              <option value="stacked">Stacked</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.label_variant}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Initial Value</label>
            <input
              type="text"
              value={el.initValue || ''}
              onChange={(e) => update('initValue', e.target.value)}
              className="input-field text-sm"
              placeholder="Default value"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.init_value}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Error Message</label>
            <input
              type="text"
              value={typeof el.errorMessage === 'string' ? el.errorMessage : ''}
              onChange={(e) => update('errorMessage', e.target.value)}
              className="input-field text-sm"
              placeholder="Custom error message"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.error_message}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'EmailInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Email label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="email_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Enter your email address"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'PasswordInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Password label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="password_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Characters</label>
            <input
              type="number"
              value={el.minChars || ''}
              onChange={(e) => update('minChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Characters</label>
            <input
              type="number"
              value={el.maxChars || ''}
              onChange={(e) => update('maxChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Must be at least 8 characters"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'PhoneInput':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Phone label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="phone_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Include country code"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'CheckboxGroup':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Checkbox group label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="checkbox_group"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="No limit"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Additional description"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.description}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">On Select Action</label>
            <input
              type="text"
              value={el.onSelectAction || ''}
              onChange={(e) => update('onSelectAction', e.target.value)}
              className="input-field text-sm"
              placeholder="Action when item selected"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.on_select_action}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">On Unselect Action</label>
            <input
              type="text"
              value={el.onUnselectAction || ''}
              onChange={(e) => update('onUnselectAction', e.target.value)}
              className="input-field text-sm"
              placeholder="Action when item unselected"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.on_unselect_action}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Media Size</label>
            <select
              value={el.mediaSize || 'medium'}
              onChange={(e) => update('mediaSize', e.target.value)}
              className="input-field text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.media_size}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`enabled-checkbox-${el.id}`}
              checked={el.enabled !== false}
              onChange={(e) => update('enabled', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`enabled-checkbox-${el.id}`} className="text-xs text-slate-300">Enabled</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`visible-checkbox-${el.id}`}
              checked={el.visible !== false}
              onChange={(e) => update('visible', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`visible-checkbox-${el.id}`} className="text-xs text-slate-300">Visible</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
          <OptionsEditor
            options={el.dataSource || []}
            onChange={(opts) => update('dataSource', opts)}
          />
        </>
      )

    case 'ChipsSelector':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Chips selector label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="chips_selector"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="No limit"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Additional description"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.description}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">On Select Action</label>
            <input
              type="text"
              value={el.onSelectAction || ''}
              onChange={(e) => update('onSelectAction', e.target.value)}
              className="input-field text-sm"
              placeholder="Action when item selected"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.on_select_action}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">On Unselect Action</label>
            <input
              type="text"
              value={el.onUnselectAction || ''}
              onChange={(e) => update('onUnselectAction', e.target.value)}
              className="input-field text-sm"
              placeholder="Action when item unselected"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.on_unselect_action}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Media Size</label>
            <select
              value={el.mediaSize || 'medium'}
              onChange={(e) => update('mediaSize', e.target.value)}
              className="input-field text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.media_size}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`enabled-chips-${el.id}`}
              checked={el.enabled !== false}
              onChange={(e) => update('enabled', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`enabled-chips-${el.id}`} className="text-xs text-slate-300">Enabled</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`visible-chips-${el.id}`}
              checked={el.visible !== false}
              onChange={(e) => update('visible', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`visible-chips-${el.id}`} className="text-xs text-slate-300">Visible</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
          <OptionsEditor
            options={el.dataSource || []}
            onChange={(opts) => update('dataSource', opts)}
          />
        </>
      )

    case 'OptIn':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="I agree to the terms"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="opt_in"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'EmbeddedLink':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Text</label>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className="input-field text-sm"
              placeholder="Click here"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
            <input
              type="url"
              value={el.url || ''}
              onChange={(e) => update('url', e.target.value)}
              className="input-field text-sm"
              placeholder="https://example.com"
            />
          </div>
        </>
      )

    case 'DatePicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Select date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="date_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Date</label>
            <input
              type="date"
              value={el.minDate || ''}
              onChange={(e) => update('minDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Date</label>
            <input
              type="date"
              value={el.maxDate || ''}
              onChange={(e) => update('maxDate', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="Select your preferred date"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'CalendarPicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Select date range"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="calendar_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mode</label>
            <select
              value={el.mode || 'single'}
              onChange={(e) => update('mode', e.target.value)}
              className="input-field text-sm"
            >
              <option value="single">Single Date</option>
              <option value="range">Date Range</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
            <input
              type="text"
              value={el.title || ''}
              onChange={(e) => update('title', e.target.value)}
              className="input-field text-sm"
              placeholder="Calendar title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Calendar description"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'Image':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Image URL</label>
            <input
              type="url"
              value={el.src}
              onChange={(e) => update('src', e.target.value)}
              className="input-field text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Alt Text</label>
            <input
              type="text"
              value={el.altText || ''}
              onChange={(e) => update('altText', e.target.value)}
              className="input-field text-sm"
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
            <input
              type="number"
              value={el.width || ''}
              onChange={(e) => update('width', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
            <input
              type="number"
              value={el.height || ''}
              onChange={(e) => update('height', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scale Type</label>
            <select
              value={el.scaleType || 'cover'}
              onChange={(e) => update('scaleType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
        </>
      )

    case 'ImageCarousel':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scale Type</label>
            <select
              value={el.scaleType || 'cover'}
              onChange={(e) => update('scaleType', e.target.value)}
              className="input-field text-sm"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Aspect Ratio</label>
            <input
              type="text"
              value={el.aspectRatio || ''}
              onChange={(e) => update('aspectRatio', e.target.value)}
              className="input-field text-sm"
              placeholder="16:9"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">Images</label>
              <button 
                onClick={() => {
                  const newImages = [...(el.images || []), { src: '', altText: '' }]
                  update('images', newImages)
                }}
                className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(el.images || []).map((img: any, idx: number) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={img.src}
                    onChange={(e) => {
                      const newImages = [...(el.images || [])]
                      newImages[idx] = { ...img, src: e.target.value }
                      update('images', newImages)
                    }}
                    className="input-field flex-1 text-xs"
                    placeholder="Image URL"
                  />
                  <input
                    type="text"
                    value={img.altText || ''}
                    onChange={(e) => {
                      const newImages = [...(el.images || [])]
                      newImages[idx] = { ...img, altText: e.target.value }
                      update('images', newImages)
                    }}
                    className="input-field flex-1 text-xs"
                    placeholder="Alt text"
                  />
                  <button
                    onClick={() => {
                      const newImages = (el.images || []).filter((_: any, i: number) => i !== idx)
                      update('images', newImages)
                    }}
                    className="text-red-500 hover:text-red-400 p-1"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )

    case 'PhotoPicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="photo_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Upload Photos"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Select photos from gallery or camera"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Photo Source</label>
            <select
              value={el.photoSource || 'camera_gallery'}
              onChange={(e) => update('photoSource', e.target.value)}
              className="input-field text-sm"
            >
              <option value="camera_gallery">Camera & Gallery</option>
              <option value="camera">Camera Only</option>
              <option value="gallery">Gallery Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max File Size (KB)</label>
            <input
              type="number"
              value={el.maxFileSizeKb || 10240}
              onChange={(e) => update('maxFileSizeKb', parseInt(e.target.value))}
              className="input-field text-sm"
              placeholder="10240"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Photos</label>
            <input
              type="number"
              value={el.minUploadedPhotos || 0}
              onChange={(e) => update('minUploadedPhotos', parseInt(e.target.value))}
              className="input-field text-sm"
              min="0"
              max="30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Photos</label>
            <input
              type="number"
              value={el.maxUploadedPhotos || 10}
              onChange={(e) => update('maxUploadedPhotos', parseInt(e.target.value))}
              className="input-field text-sm"
              min="1"
              max="30"
            />
          </div>
        </>
      )

    case 'DocumentPicker':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="document_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Upload Documents"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="Select documents to upload"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max File Size (KB)</label>
            <input
              type="number"
              value={el.maxFileSizeKb || 10240}
              onChange={(e) => update('maxFileSizeKb', parseInt(e.target.value))}
              className="input-field text-sm"
              placeholder="10240"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Documents</label>
            <input
              type="number"
              value={el.minUploadedDocuments || 0}
              onChange={(e) => update('minUploadedDocuments', parseInt(e.target.value))}
              className="input-field text-sm"
              min="0"
              max="30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Documents</label>
            <input
              type="number"
              value={el.maxUploadedDocuments || 10}
              onChange={(e) => update('maxUploadedDocuments', parseInt(e.target.value))}
              className="input-field text-sm"
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Allowed MIME Types</label>
            <input
              type="text"
              value={(el.allowedMimeTypes || []).join(', ')}
              onChange={(e) => update('allowedMimeTypes', e.target.value.split(',').map((s: string) => s.trim()))}
              className="input-field text-sm"
              placeholder="application/pdf, image/jpeg, image/png"
            />
            <p className="text-xs text-slate-500 mt-1">Comma-separated list</p>
          </div>
        </>
      )

    case 'NavigationList':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
              placeholder="navigation_list"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label || ''}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
              placeholder="Navigation list label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className="input-field text-sm"
              placeholder="List description"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-400">List Items</label>
              <button 
                onClick={() => {
                  const newItems = [...(el.listItems || []), { 
                    id: `item_${Date.now()}`, 
                    mainContent: { title: 'New Item', description: '' }
                  }]
                  update('listItems', newItems)
                }}
                className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <div className="space-y-2">
              {(el.listItems || []).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-600 rounded p-2 space-y-2">
                  <input
                    type="text"
                    value={item.mainContent?.title || ''}
                    onChange={(e) => {
                      const newItems = [...(el.listItems || [])]
                      newItems[idx] = { 
                        ...item, 
                        mainContent: { ...item.mainContent, title: e.target.value }
                      }
                      update('listItems', newItems)
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Item title"
                  />
                  <input
                    type="text"
                    value={item.mainContent?.description || ''}
                    onChange={(e) => {
                      const newItems = [...(el.listItems || [])]
                      newItems[idx] = { 
                        ...item, 
                        mainContent: { ...item.mainContent, description: e.target.value }
                      }
                      update('listItems', newItems)
                    }}
                    className="input-field w-full text-xs"
                    placeholder="Item description"
                  />
                  <button
                    onClick={() => {
                      const newItems = (el.listItems || []).filter((_: any, i: number) => i !== idx)
                      update('listItems', newItems)
                    }}
                    className="text-red-500 hover:text-red-400 text-xs"
                  >
                    Remove Item
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )

    case 'RadioButtonsGroup':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Length</label>
            <input
              type="number"
              value={el.maxLength || ''}
              onChange={(e) => update('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
              className="input-field text-sm"
              placeholder="4096"
            />
            <p className="text-xs text-slate-500 mt-1">
              Character limit for text area
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className="input-field text-sm"
              placeholder="E.g. Enter your comments"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.helper_text}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label Variant</label>
            <select
              value={el.labelVariant || 'standard'}
              onChange={(e) => update('labelVariant', e.target.value)}
              className="input-field text-sm"
            >
              <option value="standard">Standard</option>
              <option value="floating">Floating</option>
              <option value="stacked">Stacked</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.label_variant}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Initial Value</label>
            <input
              type="text"
              value={el.initValue || ''}
              onChange={(e) => update('initValue', e.target.value)}
              className="input-field text-sm"
              placeholder="Default text"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.init_value}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Error Message</label>
            <input
              type="text"
              value={typeof el.errorMessage === 'string' ? el.errorMessage : ''}
              onChange={(e) => update('errorMessage', e.target.value)}
              className="input-field text-sm"
              placeholder="Custom error message"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.error_message}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`enabled-${el.id}`}
              checked={el.enabled !== false}
              onChange={(e) => update('enabled', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`enabled-${el.id}`} className="text-xs text-slate-300">Enabled</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
          </div>
        </>
      )

    case 'Dropdown':
      return (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${el.id}`}
              checked={!!el.required}
              onChange={(e) => update('required', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
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
            <label className="block text-xs font-medium text-slate-400 mb-1">Button Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Action</label>
            <select
              value={el.action}
              onChange={(e) => update('action', e.target.value)}
              className="input-field text-sm"
            >
              <option value="navigate">Navigate to next screen</option>
              <option value="complete">Complete flow</option>
            </select>
          </div>
          {el.action === 'navigate' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Next Screen ID</label>
              <input
                type="text"
                value={el.nextScreen ?? ''}
                onChange={(e) => update('nextScreen', e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., RATE"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Left Caption</label>
            <input
              type="text"
              value={el.leftCaption || ''}
              onChange={(e) => update('leftCaption', e.target.value)}
              className="input-field text-sm"
              placeholder="Left side caption"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.left_caption}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Center Caption</label>
            <input
              type="text"
              value={el.centerCaption || ''}
              onChange={(e) => update('centerCaption', e.target.value)}
              className="input-field text-sm"
              placeholder="Center caption"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.center_caption}'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Right Caption</label>
            <input
              type="text"
              value={el.rightCaption || ''}
              onChange={(e) => update('rightCaption', e.target.value)}
              className="input-field text-sm"
              placeholder="Right side caption"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.right_caption}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`enabled-footer-${el.id}`}
              checked={el.enabled !== false}
              onChange={(e) => update('enabled', e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
            />
            <label htmlFor={`enabled-footer-${el.id}`} className="text-xs text-slate-300">Enabled</label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Payload Keys
            </label>
            <input
              type="text"
              value={el.payloadKeys.join(', ')}
              onChange={(e) => update('payloadKeys', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="input-field text-sm"
              placeholder="Choose_one, Leave_a_comment"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated data keys
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
        <label className="block text-xs font-medium text-slate-400">Options</label>
        <button onClick={addOption} className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1">
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
              className="input-field flex-1 text-xs"
              placeholder="ID"
            />
            <input
              type="text"
              value={opt.title}
              onChange={(e) => updateOption(idx, 'title', e.target.value)}
              className="input-field flex-1 text-xs"
              placeholder="Title"
            />
            <button
              onClick={() => removeOption(idx)}
              className="text-red-500 hover:text-red-400 p-1"
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
