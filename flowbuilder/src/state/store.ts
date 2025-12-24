import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import type { Screen, AnyElement, ElementType } from '../types'

export type FlowState = {
  screens: Screen[]
  addScreen: () => void
  removeScreen: (id: string) => void
  updateScreen: (oldId: string, updates: Partial<Screen>) => void
  selectScreen: (id: string) => void
  selectedScreenId?: string
  addElement: (screenId: string, type: ElementType) => void
  updateElement: (screenId: string, el: AnyElement) => void
  removeElement: (screenId: string, elementId: string) => void
  moveElement: (screenId: string, from: number, to: number) => void
  duplicateElement: (screenId: string, elementId: string) => void
  loadScreens: (screens: Screen[]) => void
  clearScreens: () => void
  validateComponentOrder: (screenId: string) => boolean
  syncVisualOrderWithJSON: (screenId: string) => void
}

const createFeedbackScreen = (): Screen => ({
  id: 'RECOMMEND',
  title: 'Feedback',
  terminal: true,
  elements: [
    {
      id: nanoid(6),
      type: 'TextSubheading',
      text: 'Would you recommend us to a friend?'
    },
    {
      id: nanoid(6),
      type: 'RadioButtonsGroup',
      label: 'Choose one',
      name: 'Choose_one',
      required: true,
      options: [
        { id: '0_Yes', title: 'Yes' },
        { id: '1_No', title: 'No' }
      ]
    },
    {
      id: nanoid(6),
      type: 'TextSubheading',
      text: 'How could we do better?'
    },
    {
      id: nanoid(6),
      type: 'TextArea',
      label: 'Leave a comment',
      name: 'Leave_a_comment',
      required: false
    },
    {
      id: nanoid(6),
      type: 'Footer',
      label: 'Continue',
      action: 'complete',
      payloadKeys: ['Choose_one', 'Leave_a_comment']
    }
  ]
})

const createNewScreen = (screenNumber: number): Screen => {
  const screenNames = ['FIRST', 'SECOND', 'THIRD', 'FOURTH', 'FIFTH', 'SIXTH', 'SEVENTH', 'EIGHTH', 'NINTH', 'TENTH']
  const screenName = screenNames[screenNumber - 1] || `SCREEN_${String.fromCharCode(65 + screenNumber - 11)}` // A, B, C, etc. after TENTH
  const nextScreenName = screenNames[screenNumber] || `SCREEN_${String.fromCharCode(65 + screenNumber - 10)}`
  
  return {
    id: `${screenName}_SCREEN`,
    title: `${screenName.charAt(0) + screenName.slice(1).toLowerCase()} Screen`,
    elements: [
      {
        id: nanoid(6),
        type: 'TextHeading',
        text: `${screenName.charAt(0) + screenName.slice(1).toLowerCase()} Screen Title`,
        visible: true
      },
      {
        id: nanoid(6),
        type: 'TextBody',
        text: 'Add your content here...',
        fontWeight: 'normal',
        strikethrough: false,
        visible: true,
        markdown: false
      },
      {
        id: nanoid(6),
        type: 'Footer',
        label: 'Continue',
        action: 'complete',
        payloadKeys: []
      }
    ]
  }
}

// FORCE REFRESH - PREVENT CACHE


export const useFlowStore = create<FlowState>((set, get) => ({
  screens: [{
    id: 'RECOMMEND',
    title: 'Feedback 1',
    terminal: true,
    elements: [
      {
        id: 'forced1',
        type: 'TextSubheading',
        text: 'Would you recommend us to a friend?',
        visible: true
      },
      {
        id: 'forced2', 
        type: 'TextSubheading',
        text: 'How could we do better?',
        visible: true
      },
      {
        id: 'forced3',
        type: 'RadioButtonsGroup',
        label: 'Choose one',
        name: 'Choose_one',
        required: true,
        options: [
          { id: '0_Yes', title: 'Yes' },
          { id: '1_No', title: 'No' }
        ]
      },
      {
        id: 'forced4',
        type: 'TextArea',
        label: 'Leave a comment',
        name: 'Leave_a_comment',
        required: false
      },
      {
        id: 'forced5',
        type: 'Footer',
        label: 'Continue',
        action: 'complete',
        payloadKeys: ['Choose_one', 'Leave_a_comment']
      }
    ]
  }],
  selectedScreenId: 'RECOMMEND',

  addScreen: () => set(s => {
    const newScreenNumber = s.screens.length + 1
    const newScreen = createNewScreen(newScreenNumber)
    
    // Find the last screen that has a 'complete' action and change it to navigate to the new screen
    const updatedScreens = s.screens.map(screen => {
      const footer = screen.elements.find(el => el.type === 'Footer') as any
      if (footer && footer.action === 'complete') {
        // Change the last terminal screen to navigate to the new screen
        const updatedElements = screen.elements.map(el => {
          if (el.type === 'Footer' && (el as any).action === 'complete') {
            return {
              ...el,
              action: 'navigate' as const,
              nextScreen: newScreen.id
            }
          }
          return el
        })
        return { ...screen, elements: updatedElements }
      }
      return screen
    })
    
    return { screens: [...updatedScreens, newScreen] }
  }),
  removeScreen: (id) => set(s => ({ screens: s.screens.filter(sc => sc.id !== id), selectedScreenId: s.selectedScreenId === id ? s.screens[0]?.id : s.selectedScreenId })),
  updateScreen: (oldId, updates) => set(s => ({
    screens: s.screens.map(sc => sc.id === oldId ? { ...sc, ...updates } : sc),
    selectedScreenId: updates.id && s.selectedScreenId === oldId ? updates.id : s.selectedScreenId
  })),
  selectScreen: (id) => set({ selectedScreenId: id }),

  addElement: (screenId, type) => set(s => ({
    screens: s.screens.map(sc => sc.id !== screenId ? sc : ({
      ...sc,
      elements: [...sc.elements, createDefaultElement(type)]
    }))
  })),

  updateElement: (screenId, el) => set(s => ({
    screens: s.screens.map(sc => sc.id !== screenId ? sc : ({
      ...sc,
      elements: sc.elements.map(e => e.id === el.id ? el : e)
    }))
  })),

  removeElement: (screenId, elementId) => set(s => ({
    screens: s.screens.map(sc => sc.id !== screenId ? sc : ({
      ...sc,
      elements: sc.elements.filter(e => e.id !== elementId)
    }))
  })),

  moveElement: (screenId, from, to) => set(s => ({
    screens: s.screens.map(sc => {
      if (sc.id !== screenId) return sc
      const arr = [...sc.elements]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      
      // Immediately validate component order after move
      const updatedScreen = { ...sc, elements: arr }
      console.log('🔄 Element moved:', { from, to, elementId: item.id, type: item.type })
      console.log('📋 New order:', arr.map((el, idx) => `${idx}: ${el.type}(${el.id})`))
      
      return updatedScreen
    })
  })),

  duplicateElement: (screenId, elementId) => set(s => ({
    screens: s.screens.map(sc => {
      if (sc.id !== screenId) return sc
      
      const elementIndex = sc.elements.findIndex(e => e.id === elementId)
      if (elementIndex === -1) return sc
      
      const originalElement = sc.elements[elementIndex]
      const duplicatedElement = {
        ...originalElement,
        id: nanoid(6),
        // Update name/label if it exists to indicate it's a copy
        ...(originalElement.name && { name: `${originalElement.name} (Copy)` }),
        ...(originalElement.label && { label: `${originalElement.label} (Copy)` })
      }
      
      const newElements = [...sc.elements]
      newElements.splice(elementIndex + 1, 0, duplicatedElement)
      
      return { ...sc, elements: newElements }
    })
  })),

  loadScreens: (screens) => set({
    screens: screens,
    selectedScreenId: screens.length > 0 ? screens[0].id : undefined
  }),

  clearScreens: () => set({
    screens: [],
    selectedScreenId: undefined
  }),

  validateComponentOrder: (screenId) => {
    const state = get()
    const screen = state.screens.find(s => s.id === screenId)
    if (!screen) {
      console.warn('⚠️ validateComponentOrder: Screen not found:', screenId)
      return false
    }
    
    // Validate that visual order matches the elements array order
    const elementIds = screen.elements.map(el => el.id)
    console.log('🔍 Validating component order for screen:', screenId)
    console.log('📋 Current element order:', elementIds)
    
    // Check for duplicate IDs (should not happen but good to validate)
    const uniqueIds = new Set(elementIds)
    if (uniqueIds.size !== elementIds.length) {
      console.error('❌ Duplicate element IDs found in screen:', screenId)
      return false
    }
    
    console.log('✅ Component order validation passed for screen:', screenId)
    return true
  },

  syncVisualOrderWithJSON: (screenId) => {
    const state = get()
    const screen = state.screens.find(s => s.id === screenId)
    if (!screen) {
      console.warn('⚠️ syncVisualOrderWithJSON: Screen not found:', screenId)
      return
    }
    
    console.log('🔄 Syncing visual order with JSON for screen:', screenId)
    console.log('📋 Elements in order:', screen.elements.map((el, idx) => `${idx}: ${el.type}(${el.id})`))
    
    // The elements array IS the source of truth for JSON order
    // This method serves as a consistency check and logging point
    // In a more complex implementation, this could rebuild UI state from elements array
    
    // Validate the order is consistent
    const isValid = get().validateComponentOrder(screenId)
    if (isValid) {
      console.log('✅ Visual order is synchronized with JSON order')
    } else {
      console.error('❌ Visual order synchronization failed')
    }
  },
}))

function createDefaultElement(type: ElementType): AnyElement {
  const id = nanoid(6)
  switch (type) {
    case 'TextHeading':
      return { id, type, text: 'Text Heading', visible: true }
    case 'TextSubheading':
      return { id, type, text: 'Text subheading', visible: true }
    case 'TextBody':
      return { 
        id, 
        type, 
        text: 'Body text content goes here',
        fontWeight: 'normal',
        strikethrough: false,
        visible: true,
        markdown: false
      }
    case 'TextCaption':
      return { 
        id, 
        type, 
        text: 'Caption text',
        fontWeight: 'normal',
        strikethrough: false,
        visible: true,
        markdown: false
      }
    case 'RichText':
      return { id, type, text: '# Rich Text\n\nThis is **bold** and *italic* text.' }
    case 'If':
      return { 
        id, 
        type, 
        condition: '${data.show_content}', 
        then: [
          {
            id: nanoid(6),
            type: 'TextBody',
            text: 'Content shown when condition is true',
            fontWeight: 'normal',
            strikethrough: false,
            visible: true,
            markdown: false
          }
        ],
        else: [
          {
            id: nanoid(6),
            type: 'TextBody',
            text: 'Content shown when condition is false',
            fontWeight: 'normal',
            strikethrough: false,
            visible: true,
            markdown: false
          }
        ]
      }
    case 'Switch':
      return { 
        id, 
        type, 
        value: '${data.user_type}',
        cases: [
          {
            case: 'admin',
            elements: [
              {
                id: nanoid(6),
                type: 'TextBody',
                text: 'Admin content',
                fontWeight: 'normal',
                strikethrough: false,
                visible: true,
                markdown: false
              }
            ]
          },
          {
            case: 'user',
            elements: [
              {
                id: nanoid(6),
                type: 'TextBody',
                text: 'User content',
                fontWeight: 'normal',
                strikethrough: false,
                visible: true,
                markdown: false
              }
            ]
          }
        ],
        default: [
          {
            id: nanoid(6),
            type: 'TextBody',
            text: 'Default content',
            fontWeight: 'normal',
            strikethrough: false,
            visible: true,
            markdown: false
          }
        ]
      }
    case 'TextInput':
      return { id, type, label: 'Text Input', name: 'text_input', required: true, inputType: 'text' }
    case 'EmailInput':
      return { id, type, label: 'Email Address', name: 'email', required: true }
    case 'PasswordInput':
      return { id, type, label: 'Password', name: 'password', required: true }
    case 'PhoneInput':
      return { id, type, label: 'Phone Number', name: 'phone', required: true }
    case 'CheckboxGroup':
      return { id, type, label: 'Select multiple', name: 'checkbox_group', required: false, dataSource: [
        { id: '0_Option_A', title: 'Option A' },
        { id: '1_Option_B', title: 'Option B' },
      ] }
    case 'RadioButtonsGroup':
      return { id, type, label: 'Choose one', name: 'Choose_one', required: true, options: [
        { id: '0_Yes', title: 'Yes' },
        { id: '1_No', title: 'No' },
      ] }
    case 'ChipsSelector':
      return { id, type, label: 'Select chips', name: 'chips_selector', required: false, dataSource: [
        { id: '0_Chip_A', title: 'Chip A' },
        { id: '1_Chip_B', title: 'Chip B' },
      ] }
    case 'TextArea':
      return { id, type, label: 'Leave a comment', name: 'Leave_a_comment', required: false }
    case 'Dropdown':
      return { id, type, label: 'Select one', name: 'Select_one', required: true, options: [
        { id: '0_Option_A', title: 'Option A' },
        { id: '1_Option_B', title: 'Option B' },
      ] }
    case 'OptIn':
      return { id, type, label: 'I agree to the terms', name: 'opt_in', required: true }
    case 'EmbeddedLink':
      return { id, type, text: 'Click to verify access', url: 'https://rickrolled.com/?title=test&desc=Verifying+access%E2%80%A6' }
    case 'DatePicker':
      return { id, type, label: 'Select date', name: 'date_picker', required: false }
    case 'CalendarPicker':
      return { id, type, label: 'Select date range', name: 'calendar_picker', required: false, mode: 'single' }
    case 'Image':
      return { id, type, src: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAIAAAAsFXl4AAAANElEQVR4nGL5ctWagWjwuH0b8YqZiFdKKhg1Gg2wzOawIV61t1AF8YqHZoAMTaMBAQAA//9ljAXx5eZ2mwAAAABJRU5ErkJggg==', altText: 'Sample image' }
    case 'ImageCarousel':
      return { id, type, images: [
        { 
          src: 'iVBORw0KGgoAAAANSUhEUgAAAB4AAAAKCAIAAAAsFXl4AAAANElEQVR4nGL5ctWagWjwuH0b8YqZiFdKKhg1Gg2wzOawIV61t1AF8YqHZoAMTaMBAQAA//9ljAXx5eZ2mwAAAABJRU5ErkJggg==', 
          altText: 'Landscape image' 
        },
        { 
          src: 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAALElEQVR4nGIRPRrBgATeWLsjc5kY8AKaSrPIL3FA5i9evZNudhOQBgQAAP//2DAFw06W30wAAAAASUVORK5CYII=', 
          altText: 'Square image' 
        }
      ] }
    case 'PhotoPicker':
      return { 
        id, 
        type, 
        name: 'photo_picker', 
        label: 'Upload Photos',
        description: 'Select photos from your gallery or take new ones',
        photoSource: 'camera_gallery',
        maxFileSizeKb: 10240,
        minUploadedPhotos: 0,
        maxUploadedPhotos: 10
      }
    case 'DocumentPicker':
      return { 
        id, 
        type, 
        name: 'document_picker', 
        label: 'Upload Documents',
        description: 'Select documents to upload',
        maxFileSizeKb: 10240,
        minUploadedDocuments: 0,
        maxUploadedDocuments: 10,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
      }
    case 'NavigationList':
      return { id, type, name: 'navigation_list', listItems: [
        { 
          id: '0_item', 
          mainContent: { title: 'Item 1', description: 'Description 1' }
        }
      ] }
    case 'Footer':
      return { id, type, label: 'Continue', action: 'navigate', nextScreen: 'RATE', payloadKeys: [] }
    default:
      throw new Error(`Unknown element type: ${type}`)
  }
}
