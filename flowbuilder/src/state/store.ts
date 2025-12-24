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
        text: `${screenName.charAt(0) + screenName.slice(1).toLowerCase()} Screen Title`
      },
      {
        id: nanoid(6),
        type: 'TextBody',
        text: 'Add your content here...'
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
        text: 'Would you recommend us to a friend?'
      },
      {
        id: 'forced2', 
        type: 'TextSubheading',
        text: 'How could we do better?'
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
      return { ...sc, elements: arr }
    })
  })),
}))

function createDefaultElement(type: ElementType): AnyElement {
  const id = nanoid(6)
  switch (type) {
    case 'TextHeading':
      return { id, type, text: 'Text Heading' }
    case 'TextSubheading':
      return { id, type, text: 'Text subheading' }
    case 'TextBody':
      return { id, type, text: 'Body text content goes here' }
    case 'TextCaption':
      return { id, type, text: 'Caption text' }
    case 'RichText':
      return { id, type, text: '# Rich Text\n\nThis is **bold** and *italic* text.' }
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
