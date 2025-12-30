import React from 'react'
import { X, Plus, Trash2, Settings, HelpCircle, Info } from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { AnyElement } from '../types'

interface PropertyEditorInlineProps {
  screenId: string
  element: AnyElement
  onClose: () => void
}

// Help content for component properties
interface HelpInfo {
  title: string
  description: string
  examples?: string[]
  options?: Record<string, string>
  limit?: number
}

const HELP_CONTENT: Record<string, HelpInfo> = {
  text: {
    title: 'Text Content',
    description: 'The main text content for this component. Supports dynamic data binding using ${data.field_name} syntax.',
    examples: ['Hello World', '${data.user_name}', 'Welcome ${data.first_name}!']
  },
  label: {
    title: 'Field Label',
    description: 'The label displayed above the input field. Keep it concise and descriptive.',
    examples: ['Full Name', 'Email Address', 'Phone Number'],
    limit: 40
  },
  name: {
    title: 'Field Name',
    description: 'Unique identifier for this field. Used in data collection and dynamic binding. Use snake_case format.',
    examples: ['full_name', 'email_address', 'phone_number']
  },
  helperText: {
    title: 'Helper Text',
    description: 'Additional guidance text shown below the field to help users understand what to enter.',
    examples: ['Enter your full legal name', 'We\'ll never share your email', 'Include country code'],
    limit: 80
  },
  condition: {
    title: 'If Condition',
    description: 'Boolean expression that determines when to show the "then" content. Use ${data.field} syntax.',
    examples: ['${data.is_premium}', '${data.age} > 18', '${data.country} == "US"']
  },
  value: {
    title: 'Switch Value',
    description: 'Expression to evaluate and match against case values. Use ${data.field} syntax.',
    examples: ['${data.user_type}', '${data.subscription_plan}', '${data.country}']
  },
  visible: {
    title: 'Visibility',
    description: 'Controls whether this component is visible. Can be dynamic using ${data.field} syntax.',
    examples: ['true', 'false', '${data.show_field}']
  },
  required: {
    title: 'Required Field',
    description: 'When enabled, users must fill this field before proceeding. Required fields show a red asterisk.'
  },
  inputType: {
    title: 'Input Type',
    description: 'Determines the type of input and validation applied.',
    options: {
      text: 'General text input',
      email: 'Email address with validation',
      password: 'Hidden password input',
      phone: 'Phone number input',
      number: 'Numeric input only'
    }
  },
  fontWeight: {
    title: 'Font Weight',
    description: 'Controls the visual weight of the text.',
    options: {
      normal: 'Regular text weight',
      bold: 'Bold text',
      italic: 'Italic text',
      bold_italic: 'Bold and italic text'
    }
  }
}

function HelpTooltip({ content, children }: { content: keyof typeof HELP_CONTENT; children: React.ReactNode }) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const helpInfo = HELP_CONTENT[content]

  if (!helpInfo) return <>{children}</>

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {children}
        <button
          type="button"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="text-slate-400 hover:text-slate-300 transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
        </button>
      </div>
      
      {showTooltip && (
        <div className="absolute top-6 left-0 z-50 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-white shadow-xl max-w-xs">
          <div className="font-semibold text-blue-400 mb-1">{helpInfo.title}</div>
          <div className="text-slate-300 mb-2">{helpInfo.description}</div>
          
          {helpInfo.examples && (
            <div className="mb-2">
              <div className="text-slate-400 font-medium mb-1">Examples:</div>
              {helpInfo.examples.map((example: string, idx: number) => (
                <div key={idx} className="text-green-400 font-mono text-xs">• {example}</div>
              ))}
            </div>
          )}
          
          {helpInfo.options && (
            <div className="mb-2">
              <div className="text-slate-400 font-medium mb-1">Options:</div>
              {Object.entries(helpInfo.options).map(([key, desc]) => (
                <div key={key} className="text-slate-300">
                  <span className="text-yellow-400 font-mono">{key}</span>: {desc}
                </div>
              ))}
            </div>
          )}
          
          {helpInfo.limit && (
            <div className="text-yellow-400 text-xs">
              <Info className="w-3 h-3 inline mr-1" />
              Character limit: {helpInfo.limit}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CharacterCounter({ text, limit, label }: { text: string; limit: number; label?: string }) {
  const length = text?.length || 0
  const isOverLimit = length > limit
  const isNearLimit = length > limit * 0.9

  return (
    <div className={`text-xs mt-1 flex justify-between items-center ${
      isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-slate-500'
    }`}>
      <span>{label && `${label}: `}Dynamic data binding: ${'${data.field_name}'}</span>
      <span className="font-mono">
        {length}/{limit}
        {isOverLimit && <span className="ml-1 font-semibold">OVER</span>}
        {isNearLimit && !isOverLimit && <span className="ml-1">NEAR</span>}
      </span>
    </div>
  )
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

      {/* Fields - Improved scrolling */}
      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
        {renderFields(localElement, updateField)}
      </div>
    </div>
  )
}

// Define consistent dark input styling
const darkInputClass = "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
const darkSelectClass = "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
const darkTextareaClass = "w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"

function renderFields(el: AnyElement, update: (field: string, value: any) => void) {
  switch (el.type) {
    case 'TextHeading':
      return (
        <div className="space-y-3">
          <div>
            <HelpTooltip content="text">
              <label className="block text-xs font-medium text-slate-400 mb-1">Text (max 80 chars)</label>
            </HelpTooltip>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className={`${darkInputClass} ${el.text && el.text.length > 80 ? 'border-red-500' : ''}`}
              placeholder="Enter heading text"
              maxLength={80}
            />
            <CharacterCounter text={el.text} limit={80} />
          </div>
          <div>
            <HelpTooltip content="visible">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <input
                  type="checkbox"
                  checked={el.visible !== false}
                  onChange={(e) => update('visible', e.target.checked)}
                  className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                />
                Visible
              </label>
            </HelpTooltip>
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
            <HelpTooltip content="text">
              <label className="block text-xs font-medium text-slate-400 mb-1">Text (max 80 chars)</label>
            </HelpTooltip>
            <input
              type="text"
              value={el.text}
              onChange={(e) => update('text', e.target.value)}
              className={`${darkInputClass} ${el.text && el.text.length > 80 ? 'border-red-500' : ''}`}
              placeholder="Enter subheading text"
              maxLength={80}
            />
            <CharacterCounter text={el.text} limit={80} />
          </div>
          <div>
            <HelpTooltip content="visible">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <input
                  type="checkbox"
                  checked={el.visible !== false}
                  onChange={(e) => update('visible', e.target.checked)}
                  className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
                />
                Visible
              </label>
            </HelpTooltip>
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
              className={darkTextareaClass}
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
              className={darkSelectClass}
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
              className={`${darkTextareaClass} ${el.text && el.text.length > 400 ? 'border-red-500' : ''}`}
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
              className={darkSelectClass}
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
            className={`${darkTextareaClass} font-mono`}
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
            <HelpTooltip content="label">
              <label className="block text-xs font-medium text-slate-400 mb-1">Label (max 40 chars)</label>
            </HelpTooltip>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className={`${darkInputClass} ${el.label && el.label.length > 40 ? 'border-red-500' : ''}`}
              placeholder="Input label"
              maxLength={40}
            />
            <CharacterCounter text={el.label} limit={40} />
          </div>
          <div>
            <HelpTooltip content="name">
              <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            </HelpTooltip>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="field_name"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use snake_case format (e.g., full_name, email_address)
            </p>
          </div>
          <div>
            <HelpTooltip content="inputType">
              <label className="block text-xs font-medium text-slate-400 mb-1">Input Type</label>
            </HelpTooltip>
            <select
              value={el.inputType || 'text'}
              onChange={(e) => update('inputType', e.target.value)}
              className={darkSelectClass}
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
              className={darkInputClass}
              placeholder="^[0-9]+$"
            />
            <p className="text-xs text-slate-500 mt-1">
              Regular expression for input validation
            </p>
          </div>
          <div>
            <HelpTooltip content="helperText">
              <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text (max 80 chars)</label>
            </HelpTooltip>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className={`${darkInputClass} ${el.helperText && el.helperText.length > 80 ? 'border-red-500' : ''}`}
              placeholder="E.g. Enter your phone number"
              maxLength={80}
            />
            <CharacterCounter text={el.helperText || ''} limit={80} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label Variant</label>
            <select
              value={el.labelVariant || 'standard'}
              onChange={(e) => update('labelVariant', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Custom error message"
            />
            <p className="text-xs text-slate-500 mt-1">
              Dynamic: ${'{data.error_message}'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <HelpTooltip content="required">
              <input
                type="checkbox"
                id={`required-${el.id}`}
                checked={!!el.required}
                onChange={(e) => update('required', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-whatsapp-500 focus:ring-whatsapp-500"
              />
              <label htmlFor={`required-${el.id}`} className="text-xs text-slate-300">Required field</label>
            </HelpTooltip>
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
              className={darkInputClass}
              placeholder="Email label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="email_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Password label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="password_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Characters</label>
            <input
              type="number"
              value={el.minChars || ''}
              onChange={(e) => update('minChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="8"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Characters</label>
            <input
              type="number"
              value={el.maxChars || ''}
              onChange={(e) => update('maxChars', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Phone label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="phone_field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Checkbox group label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="checkbox_group"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="No limit"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Chips selector label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="chips_selector"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Selected</label>
            <input
              type="number"
              value={el.minSelectedItems || ''}
              onChange={(e) => update('minSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Selected</label>
            <input
              type="number"
              value={el.maxSelectedItems || ''}
              onChange={(e) => update('maxSelectedItems', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="No limit"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="I agree to the terms"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Click here"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">URL</label>
            <input
              type="url"
              value={el.url || ''}
              onChange={(e) => update('url', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Select date"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="date_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Date</label>
            <input
              type="date"
              value={el.minDate || ''}
              onChange={(e) => update('minDate', e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Date</label>
            <input
              type="date"
              value={el.maxDate || ''}
              onChange={(e) => update('maxDate', e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Helper Text</label>
            <input
              type="text"
              value={el.helperText || ''}
              onChange={(e) => update('helperText', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Select date range"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="calendar_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mode</label>
            <select
              value={el.mode || 'single'}
              onChange={(e) => update('mode', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Calendar title"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Alt Text</label>
            <input
              type="text"
              value={el.altText || ''}
              onChange={(e) => update('altText', e.target.value)}
              className={darkInputClass}
              placeholder="Image description"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Width</label>
            <input
              type="number"
              value={el.width || ''}
              onChange={(e) => update('width', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Height</label>
            <input
              type="number"
              value={el.height || ''}
              onChange={(e) => update('height', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Scale Type</label>
            <select
              value={el.scaleType || 'cover'}
              onChange={(e) => update('scaleType', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
                    className={darkInputClass}
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
                    className={darkInputClass}
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
              className={darkInputClass}
              placeholder="photo_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className={darkInputClass}
              placeholder="Upload Photos"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
              placeholder="Select photos from gallery or camera"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Photo Source</label>
            <select
              value={el.photoSource || 'camera_gallery'}
              onChange={(e) => update('photoSource', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="10240"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Photos</label>
            <input
              type="number"
              value={el.minUploadedPhotos || 0}
              onChange={(e) => update('minUploadedPhotos', parseInt(e.target.value))}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="document_picker"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label}
              onChange={(e) => update('label', e.target.value)}
              className={darkInputClass}
              placeholder="Upload Documents"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
              placeholder="Select documents to upload"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max File Size (KB)</label>
            <input
              type="number"
              value={el.maxFileSizeKb || 10240}
              onChange={(e) => update('maxFileSizeKb', parseInt(e.target.value))}
              className={darkInputClass}
              placeholder="10240"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Min Documents</label>
            <input
              type="number"
              value={el.minUploadedDocuments || 0}
              onChange={(e) => update('minUploadedDocuments', parseInt(e.target.value))}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="navigation_list"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={el.label || ''}
              onChange={(e) => update('label', e.target.value)}
              className={darkInputClass}
              placeholder="Navigation list label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
            <input
              type="text"
              value={el.description || ''}
              onChange={(e) => update('description', e.target.value)}
              className={darkInputClass}
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
                    className={darkInputClass}
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
                    className={darkInputClass}
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
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
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
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Max Length</label>
            <input
              type="number"
              value={el.maxLength || ''}
              onChange={(e) => update('maxLength', e.target.value ? parseInt(e.target.value) : undefined)}
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Dropdown label"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              value={el.name}
              onChange={(e) => update('name', e.target.value)}
              className={darkInputClass}
              placeholder="dropdown_field"
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
              className={darkInputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Action</label>
            <select
              value={el.action}
              onChange={(e) => update('action', e.target.value)}
              className={darkInputClass}
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
                className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
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
              className={darkInputClass}
              placeholder="Choose_one, Leave_a_comment"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma-separated data keys
            </p>
          </div>
        </>
      )

    // Commented out conditional components for better performance
    // case 'If':
    //   return (
    //     <div className="space-y-3">
    //       <div>
    //         <HelpTooltip content="condition">
    //           <label className="block text-xs font-medium text-slate-400 mb-1">Condition</label>
    //         </HelpTooltip>
    //         <input
    //           type="text"
    //           value={el.condition}
    //           onChange={(e) => update('condition', e.target.value)}
    //           className={darkInputClass}
    //           placeholder="${data.show_content}"
    //         />
    //         <p className="text-xs text-slate-500 mt-1">
    //           Dynamic expression that evaluates to true/false
    //         </p>
    //       </div>
    //       
    //       <div>
    //         <HelpTooltip content="visible">
    //           <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
    //             <input
    //               type="checkbox"
    //               checked={el.visible !== false}
    //               onChange={(e) => update('visible', e.target.checked)}
    //               className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
    //             />
    //             Visible
    //           </label>
    //         </HelpTooltip>
    //         <p className="text-xs text-slate-500 mt-1">
    //           Dynamic: ${'{data.is_visible}'} | Default: True
    //         </p>
    //       </div>
    //       
    //       <div className="border-t border-slate-600 pt-3">
    //         <p className="text-xs text-slate-400 mb-2">
    //           Configure "then" and "else" content by editing the nested elements in the preview
    //         </p>
    //         <div className="text-xs text-slate-500 space-y-1">
    //           <div>• Then: {el.then?.length || 0} element(s)</div>
    //           <div>• Else: {el.else?.length || 0} element(s)</div>
    //         </div>
    //       </div>
    //     </div>
    //   )

    // case 'Switch':
    //   return (
    //     <div className="space-y-3">
    //       <div>
    //         <HelpTooltip content="value">
    //           <label className="block text-xs font-medium text-slate-400 mb-1">Switch Value</label>
    //         </HelpTooltip>
    //         <input
    //           type="text"
    //           value={el.value}
    //           onChange={(e) => update('value', e.target.value)}
    //           className={darkInputClass}
    //           placeholder="${data.user_type}"
    //         />
    //         <p className="text-xs text-slate-500 mt-1">
    //           Dynamic expression to match against cases
    //         </p>
    //       </div>
    //       
    //       <div>
    //         <HelpTooltip content="visible">
    //           <label className="flex items-center gap-2 text-xs font-medium text-slate-400">
    //             <input
    //               type="checkbox"
    //               checked={el.visible !== false}
    //               onChange={(e) => update('visible', e.target.checked)}
    //               className="w-3 h-3 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500"
    //             />
    //             Visible
    //           </label>
    //         </HelpTooltip>
    //         <p className="text-xs text-slate-500 mt-1">
    //           Dynamic: ${'{data.is_visible}'} | Default: True
    //         </p>
    //       </div>
    //       
    //       <div>
    //         <div className="flex items-center justify-between mb-2">
    //           <label className="block text-xs font-medium text-slate-400">Cases</label>
    //           <button 
    //             onClick={() => {
    //               const newCases = [...(el.cases || []), { 
    //                 case: 'new_case', 
    //                 elements: [{
    //                   id: `case_${Date.now()}`,
    //                   type: 'TextBody',
    //                   text: 'New case content',
    //                   fontWeight: 'normal',
    //                   strikethrough: false,
    //                   visible: true,
    //                   markdown: false
    //                 }]
    //               }]
    //               update('cases', newCases)
    //             }}
    //             className="text-xs text-whatsapp-500 hover:text-whatsapp-400 flex items-center gap-1"
    //           >
    //             <Plus className="w-3 h-3" />
    //             Add Case
    //           </button>
    //         </div>
    //         <div className="space-y-2">
    //           {(el.cases || []).map((caseItem: any, idx: number) => (
    //             <div key={idx} className="border border-slate-600 rounded p-2 space-y-2">
    //               <div className="flex gap-2 items-center">
    //                 <input
    //                   type="text"
    //                   value={caseItem.case}
    //                   onChange={(e) => {
    //                     const newCases = [...(el.cases || [])]
    //                     newCases[idx] = { ...caseItem, case: e.target.value }
    //                     update('cases', newCases)
    //                   }}
    //                   className={darkInputClass}
    //                   placeholder="case_value"
    //                 />
    //                 <button
    //                   onClick={() => {
    //                     const newCases = (el.cases || []).filter((_: any, i: number) => i !== idx)
    //                     update('cases', newCases)
    //                   }}
    //                   className="text-red-500 hover:text-red-400 p-1"
    //                   aria-label="Remove case"
    //                 >
    //                   <Trash2 className="w-3 h-3" />
    //                 </button>
    //               </div>
    //               <div className="text-xs text-slate-500">
    //                 Elements: {caseItem.elements?.length || 0}
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //         <p className="text-xs text-slate-500 mt-1">
    //           Each case value will be matched against the switch value
    //         </p>
    //       </div>
    //       
    //       <div className="border-t border-slate-600 pt-3">
    //         <p className="text-xs text-slate-400 mb-2">
    //           Configure case content and default by editing the nested elements in the preview
    //         </p>
    //         <div className="text-xs text-slate-500">
    //           Default: {el.default?.length || 0} element(s)
    //         </div>
    //       </div>
    //     </div>
    //   )

    default:
      return null
  }
}

function OptionsEditor({ options, onChange }: { options: { id: string; title: string }[]; onChange: (v: { id: string; title: string }[]) => void }) {
  const addOption = () => {
    onChange([...options, { id: `option_${options.length + 1}`, title: 'New Option' }])
  }

  // Auto-generate ID from title
  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      || `option_${Date.now()}` // Fallback if title is empty/invalid
  }

  const updateOption = (index: number, field: 'id' | 'title', value: string) => {
    const updated = options.map((opt, i) => {
      if (i === index) {
        if (field === 'title') {
          // Auto-generate ID when title changes
          return { ...opt, title: value, id: generateId(value) }
        } else {
          return { ...opt, [field]: value }
        }
      }
      return opt
    })
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
              value={opt.title}
              onChange={(e) => updateOption(idx, 'title', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Option Title"
            />
            <input
              type="text"
              value={opt.id}
              onChange={(e) => updateOption(idx, 'id', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-400 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated ID"
              readOnly
              title="Auto-generated from title (double-click to edit manually)"
              onDoubleClick={(e) => {
                e.currentTarget.readOnly = false
                e.currentTarget.className = e.currentTarget.className.replace('text-slate-400', 'text-slate-200')
                e.currentTarget.focus()
              }}
              onBlur={(e) => {
                e.currentTarget.readOnly = true
                e.currentTarget.className = e.currentTarget.className.replace('text-slate-200', 'text-slate-400')
              }}
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
      <p className="text-xs text-slate-500 mt-2">
        IDs are auto-generated from titles. Double-click ID field to edit manually.
      </p>
    </div>
  )
}
