import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, X, ChevronDown, ChevronRight, Search } from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { ElementType } from '../types'


const componentCategories = {
  'Text': [
    { key: 'TextHeading', label: 'Heading', desc: 'Main title' },
    { key: 'TextSubheading', label: 'Subheading', desc: 'Section title' },
    { key: 'TextBody', label: 'Body Text', desc: 'Paragraph' },
    { key: 'TextCaption', label: 'Caption', desc: 'Small text' },
    { key: 'RichText', label: 'Rich Text', desc: 'Markdown' },
  ],
  // Commented out Logic section for better performance
  // 'Logic': [
  //   { key: 'If', label: 'If Condition', desc: 'Conditional content' },
  //   { key: 'Switch', label: 'Switch', desc: 'Multi-case logic' },
  // ],
  'Input': [
    { key: 'TextInput', label: 'Text Input', desc: 'Single line' },
    { key: 'EmailInput', label: 'Email Input', desc: 'Email field' },
    { key: 'PasswordInput', label: 'Password Input', desc: 'Password field' },
    { key: 'PhoneInput', label: 'Phone Input', desc: 'Phone number' },
    { key: 'TextArea', label: 'Text Area', desc: 'Multi-line' },
  ],
  'Selection': [
    { key: 'RadioButtonsGroup', label: 'Radio Buttons', desc: 'Single choice' },
    { key: 'CheckboxGroup', label: 'Checkbox Group', desc: 'Multi choice' },
    { key: 'ChipsSelector', label: 'Chips Selector', desc: 'Chip selection' },
    { key: 'Dropdown', label: 'Dropdown', desc: 'Select list' },
    { key: 'OptIn', label: 'Opt In', desc: 'Agreement' },
  ],
  'Date': [
    { key: 'DatePicker', label: 'Date Picker', desc: 'Select date' },
    { key: 'CalendarPicker', label: 'Calendar Picker', desc: 'Calendar UI' },
  ],
  'Media': [
    { key: 'Image', label: 'Image', desc: 'Display image' },
    { key: 'ImageCarousel', label: 'Image Carousel', desc: 'Image slideshow' },
    { key: 'PhotoPicker', label: 'Photo Picker', desc: 'Upload photos' },
    { key: 'DocumentPicker', label: 'Document Picker', desc: 'Upload docs' },
  ],
  'Navigation': [
    { key: 'EmbeddedLink', label: 'Embedded Link', desc: 'Clickable link' },
    { key: 'NavigationList', label: 'Navigation List', desc: 'List nav' },
    { key: 'Footer', label: 'Footer Button', desc: 'Action button' },
  ],
}

export default function HyprScreenDesigner() {
  const { screens, selectedScreenId, selectScreen, removeScreen, addElement, addScreen } = useFlowStore()
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>(() => {
    return Object.keys(componentCategories).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
  })
  const [searchTerm, setSearchTerm] = useState('')

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const addComponent = (type: ElementType) => {
    if (!selectedScreenId) return
    addElement(selectedScreenId, type)
  }

  const filteredCategories = Object.entries(componentCategories).reduce((acc, [category, components]) => {
    if (!searchTerm) {
      acc[category] = components
    } else {
      const filtered = components.filter(comp => 
        comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.desc.toLowerCase().includes(searchTerm.toLowerCase())
      )
      if (filtered.length > 0) {
        acc[category] = filtered
      }
    }
    return acc
  }, {} as Record<string, typeof componentCategories[keyof typeof componentCategories]>)

  return (
    <div className="hypr-panel h-full flex flex-col">
      {/* Screens Section */}
      <div className="hypr-section">
        <div className="hypr-section-header">
          <span className="hypr-section-title">SCREENS</span>
          <button
            onClick={() => addScreen()}
            className="hypr-btn-icon"
            title="Add Screen"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        
        <div className="hypr-section-content">
          <div className="flex flex-wrap gap-1">
            {screens.map((screen) => (
              <div key={screen.id} className="relative group">
                <button
                  onClick={() => selectScreen(screen.id)}
                  className={`hypr-chip ${
                    screen.id === selectedScreenId ? 'hypr-chip-active' : 'hypr-chip-inactive'
                  }`}
                >
                  {screen.id}
                </button>
                {screens.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeScreen(screen.id)
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    title="Delete screen"
                  >
                    <X className="w-2 h-2" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hypr-divider"></div>

      {/* Components Section */}
      <div className="hypr-section flex-1 overflow-hidden">
        <div className="hypr-section-header">
          <span className="hypr-section-title">COMPONENTS</span>
        </div>
        
        {/* Search */}
        <div className="hypr-section-content">
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hypr-input pl-7 text-xs"
            />
          </div>
        </div>

        {/* Component Categories */}
        <div className="flex-1 overflow-y-auto hypr-scrollbar">
          <div className="space-y-1">
            {Object.entries(filteredCategories).map(([category, components]) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="hypr-category-header"
                >
                  {collapsedCategories[category] ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  <span className="hypr-category-title">{category}</span>
                  <span className="hypr-category-count">{components.length}</span>
                </button>
                
                {!collapsedCategories[category] && (
                  <div className="hypr-category-content">
                    {components.map((comp) => (
                      <motion.button
                        key={comp.key}
                        onClick={() => addComponent(comp.key as ElementType)}
                        className="hypr-component-item group"
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-1 text-left">
                          <div className="hypr-component-name">{comp.label}</div>
                          <div className="hypr-component-desc">{comp.desc}</div>
                        </div>
                        <Plus className="w-3 h-3 text-gray-400 group-hover:text-blue-400" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      
    </div>
  )
}