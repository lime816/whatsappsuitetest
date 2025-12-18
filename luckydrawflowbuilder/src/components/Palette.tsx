import React from 'react'
import { motion } from 'framer-motion'
import { 
  Type, CheckCircle, MessageSquare, ChevronDown, ArrowRight, Plus, Edit3, Mail, Lock, Phone,
  FileText, Hash, AlignLeft, Calendar, CalendarDays, Image, Link, 
  CheckSquare, Navigation, Layers, Palette as PaletteIcon, Images, Camera, Upload
} from 'lucide-react'
import { useFlowStore } from '../state/store'
import type { ElementType } from '../types'

const types: { key: ElementType; label: string; icon: React.ReactNode; description: string; category: string }[] = [
  // Text Components
  { key: 'TextHeading', label: 'Heading', icon: <Hash className="w-4 h-4" />, description: 'Main page title', category: 'Text' },
  { key: 'TextSubheading', label: 'Subheading', icon: <Type className="w-4 h-4" />, description: 'Section title', category: 'Text' },
  { key: 'TextBody', label: 'Body Text', icon: <AlignLeft className="w-4 h-4" />, description: 'Paragraph text', category: 'Text' },
  { key: 'TextCaption', label: 'Caption', icon: <FileText className="w-4 h-4" />, description: 'Small text', category: 'Text' },
  { key: 'RichText', label: 'Rich Text', icon: <FileText className="w-4 h-4" />, description: 'Markdown text', category: 'Text' },
  
  // Input Components
  { key: 'TextInput', label: 'Text Input', icon: <Edit3 className="w-4 h-4" />, description: 'Single line input', category: 'Input' },
  { key: 'EmailInput', label: 'Email Input', icon: <Mail className="w-4 h-4" />, description: 'Email address', category: 'Input' },
  { key: 'PasswordInput', label: 'Password Input', icon: <Lock className="w-4 h-4" />, description: 'Password field', category: 'Input' },
  { key: 'PhoneInput', label: 'Phone Input', icon: <Phone className="w-4 h-4" />, description: 'Phone number', category: 'Input' },
  { key: 'TextArea', label: 'Text Area', icon: <MessageSquare className="w-4 h-4" />, description: 'Multi-line input', category: 'Input' },
  
  // Selection Components
  { key: 'RadioButtonsGroup', label: 'Radio Buttons', icon: <CheckCircle className="w-4 h-4" />, description: 'Single choice', category: 'Selection' },
  { key: 'CheckboxGroup', label: 'Checkbox Group', icon: <CheckSquare className="w-4 h-4" />, description: 'Multiple choice', category: 'Selection' },
  { key: 'ChipsSelector', label: 'Chips Selector', icon: <PaletteIcon className="w-4 h-4" />, description: 'Chip selection', category: 'Selection' },
  { key: 'Dropdown', label: 'Dropdown', icon: <ChevronDown className="w-4 h-4" />, description: 'Select from list', category: 'Selection' },
  { key: 'OptIn', label: 'Opt In', icon: <CheckSquare className="w-4 h-4" />, description: 'Agreement checkbox', category: 'Selection' },
  
  // Date Components
  { key: 'DatePicker', label: 'Date Picker', icon: <Calendar className="w-4 h-4" />, description: 'Select date', category: 'Date' },
  { key: 'CalendarPicker', label: 'Calendar Picker', icon: <CalendarDays className="w-4 h-4" />, description: 'Calendar interface', category: 'Date' },
  
  // Media Components
  { key: 'Image', label: 'Image', icon: <Image className="w-4 h-4" />, description: 'Display image', category: 'Media' },
  { key: 'ImageCarousel', label: 'Image Carousel', icon: <Images className="w-4 h-4" />, description: 'Image slideshow', category: 'Media' },
  { key: 'PhotoPicker', label: 'Photo Picker', icon: <Camera className="w-4 h-4" />, description: 'Upload photos', category: 'Media' },
  { key: 'DocumentPicker', label: 'Document Picker', icon: <Upload className="w-4 h-4" />, description: 'Upload documents', category: 'Media' },
  
  // Navigation Components
  { key: 'EmbeddedLink', label: 'Embedded Link', icon: <Link className="w-4 h-4" />, description: 'Clickable link', category: 'Navigation' },
  { key: 'NavigationList', label: 'Navigation List', icon: <Navigation className="w-4 h-4" />, description: 'List navigation', category: 'Navigation' },
  { key: 'Footer', label: 'Footer Button', icon: <ArrowRight className="w-4 h-4" />, description: 'Action button', category: 'Navigation' },
]

export default function Palette() {
  const { addElement, selectedScreenId } = useFlowStore()
  const add = (t: ElementType) => {
    if (!selectedScreenId) return
    addElement(selectedScreenId, t)
  }

  // Group components by category
  const categories = types.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, typeof types>)

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center gap-2 mb-4">
        <Plus className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800">Components</h3>
      </div>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {Object.entries(categories).map(([category, categoryTypes]) => (
          <div key={category}>
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-2">
              {categoryTypes.map((t, idx) => (
                <motion.button
                  key={t.key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => add(t.key)}
                  className="w-full component-card flex items-start gap-3 text-left"
                >
                  <div className="mt-0.5 text-primary-600">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm">{t.label}</div>
                    <div className="text-xs text-gray-500 truncate">{t.description}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
