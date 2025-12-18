import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { nanoid } from 'nanoid/non-secure'
import type { InteractiveListContent, ListSection, ListRow } from '../../../types'

type InteractiveListEditorProps = {
  content: InteractiveListContent
  onChange: (content: InteractiveListContent) => void
}

export default function InteractiveListEditor({ content, onChange }: InteractiveListEditorProps) {
  const handleFieldChange = (field: keyof InteractiveListContent, value: string) => {
    onChange({ ...content, [field]: value })
  }

  const handleSectionChange = (sectionIndex: number, field: keyof ListSection, value: string) => {
    const updatedSections = content.sections.map((section, index) =>
      index === sectionIndex ? { ...section, [field]: value } : section
    )
    onChange({ ...content, sections: updatedSections })
  }

  const handleRowChange = (sectionIndex: number, rowIndex: number, field: keyof ListRow, value: string) => {
    const updatedSections = content.sections.map((section, sIndex) => {
      if (sIndex === sectionIndex) {
        const updatedRows = section.rows.map((row, rIndex) =>
          rIndex === rowIndex ? { ...row, [field]: value } : row
        )
        return { ...section, rows: updatedRows }
      }
      return section
    })
    onChange({ ...content, sections: updatedSections })
  }

  const addSection = () => {
    if (content.sections.length >= 10) return // WhatsApp limit
    
    const newSection: ListSection = {
      title: `Section ${content.sections.length + 1}`,
      rows: [
        {
          id: nanoid(6),
          title: 'Option 1',
          rowId: `opt_${content.sections.length + 1}_1`,
          description: 'Description for option 1'
        }
      ]
    }
    
    onChange({ ...content, sections: [...content.sections, newSection] })
  }

  const removeSection = (sectionIndex: number) => {
    const updatedSections = content.sections.filter((_, index) => index !== sectionIndex)
    onChange({ ...content, sections: updatedSections })
  }

  const addRow = (sectionIndex: number) => {
    const section = content.sections[sectionIndex]
    if (section.rows.length >= 10) return // WhatsApp limit per section
    
    const newRow: ListRow = {
      id: nanoid(6),
      title: `Option ${section.rows.length + 1}`,
      rowId: `opt_${sectionIndex + 1}_${section.rows.length + 1}`,
      description: `Description for option ${section.rows.length + 1}`
    }
    
    const updatedSections = content.sections.map((s, index) =>
      index === sectionIndex ? { ...s, rows: [...s.rows, newRow] } : s
    )
    onChange({ ...content, sections: updatedSections })
  }

  const removeRow = (sectionIndex: number, rowIndex: number) => {
    const updatedSections = content.sections.map((section, sIndex) => {
      if (sIndex === sectionIndex) {
        const updatedRows = section.rows.filter((_, rIndex) => rIndex !== rowIndex)
        return { ...section, rows: updatedRows }
      }
      return section
    })
    onChange({ ...content, sections: updatedSections })
  }

  const totalRows = content.sections.reduce((total, section) => total + section.rows.length, 0)

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

      {/* Button Text */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          List Button Text *
        </label>
        <input
          type="text"
          value={content.buttonText || ''}
          onChange={(e) => handleFieldChange('buttonText', e.target.value)}
          placeholder="e.g., View Options, Select Item"
          className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          This button opens the list of options
        </p>
      </div>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="text-sm font-medium text-slate-300">
              List Sections & Options
            </label>
            <p className="text-xs text-slate-500">
              Total rows: {totalRows}/10 (WhatsApp limit)
            </p>
          </div>
          <button
            onClick={addSection}
            disabled={content.sections.length >= 10}
            className="btn-secondary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        <div className="space-y-4">
          {content.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="border border-slate-600 rounded-lg p-4 bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-slate-300">Section {sectionIndex + 1}</h4>
                <button
                  onClick={() => removeSection(sectionIndex)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1">Section Title</label>
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => handleSectionChange(sectionIndex, 'title', e.target.value)}
                  placeholder="Section title"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Rows ({section.rows.length}/10)</label>
                  <button
                    onClick={() => addRow(sectionIndex)}
                    disabled={section.rows.length >= 10 || totalRows >= 10}
                    className="text-xs btn-secondary px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    Add Row
                  </button>
                </div>

                {section.rows.map((row, rowIndex) => (
                  <div key={row.id} className="border border-slate-700 rounded p-3 bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Row {rowIndex + 1}</span>
                      <button
                        onClick={() => removeRow(sectionIndex, rowIndex)}
                        className="text-red-400 hover:text-red-300 p-0.5"
                        title="Remove row"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Title</label>
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'title', e.target.value)}
                          placeholder="Row title"
                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-1">Row ID</label>
                        <input
                          type="text"
                          value={row.rowId}
                          onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'rowId', e.target.value)}
                          placeholder="row_id"
                          className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Description (Optional)</label>
                      <input
                        type="text"
                        value={row.description || ''}
                        onChange={(e) => handleRowChange(sectionIndex, rowIndex, 'description', e.target.value)}
                        placeholder="Row description"
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}

                {section.rows.length === 0 && (
                  <div className="text-center py-4 text-slate-500">
                    <p className="text-xs">No rows in this section</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {content.sections.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No sections added yet</p>
            <p className="text-xs">Click "Add Section" to create list options</p>
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

          <div className="px-3 pb-3">
            <div className="bg-white/20 text-center py-2 px-3 rounded text-sm font-medium">
              {content.buttonText || 'View Options'}
            </div>
          </div>
        </div>

        {/* List Preview */}
        {content.sections.length > 0 && (
          <div className="mt-3 bg-slate-800 rounded-lg p-3 max-w-xs">
            <p className="text-xs text-slate-400 mb-2">List Options Preview:</p>
            {content.sections.map((section, sIndex) => (
              <div key={sIndex} className="mb-3">
                <p className="text-xs font-medium text-slate-300 mb-1">{section.title}</p>
                {section.rows.map((row, rIndex) => (
                  <div key={row.id} className="text-xs text-slate-400 ml-2 mb-1">
                    • {row.title}
                    {row.description && <span className="text-slate-500"> - {row.description}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
