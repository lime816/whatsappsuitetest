import type { Screen, AnyElement } from '../types'

// Flow JSON 7.3 version-specific features and validation
const FLOW_JSON_VERSION = '7.3'
const DATA_API_VERSION = '4.0'

// Facebook Flow JSON 7.3 specifications
const FLOW_LIMITS = {
  MAX_SCREENS: 20,
  MAX_COMPONENTS_PER_SCREEN: 50,
  MAX_FORM_COMPONENTS_PER_SCREEN: 20,
  MAX_TEXT_LENGTH: {
    TextHeading: 80,
    TextSubheading: 80,
    TextBody: 4096,
    TextCaption: 400,
    RichText: 4096
  },
  MAX_INPUT_LENGTH: {
    TextInput: 128,
    TextArea: 4096,
    label: 40,
    helperText: 80,
    description: 300
  }
}

export function buildFlowJson(screens: Screen[]) {
  console.log('🔨 buildFlowJson called with screens:', JSON.stringify(screens, null, 2))
  
  // CRITICAL: If no screens provided, return empty structure
  if (!screens || screens.length === 0) {
    console.warn('⚠️ No screens provided to buildFlowJson')
    return {
      version: FLOW_JSON_VERSION,
      data_api_version: DATA_API_VERSION,
      screens: []
    }
  }

  // Validate Flow JSON 7.3 limits
  validateFlowLimits(screens)

  const flowJson: any = {
    version: FLOW_JSON_VERSION,
    data_api_version: DATA_API_VERSION
  }
  
  // Build routing model if there are multiple screens
  if (screens.length > 1) {
    const routingModel: Record<string, string[]> = {}
    screens.forEach((screen) => {
      const nextScreens: string[] = []
      
      // Check Footer navigation
      const footer = screen.elements.find(e => e.type === 'Footer') as any
      if (footer && footer.action === 'navigate' && footer.nextScreen) {
        nextScreens.push(footer.nextScreen)
      }
      
      // Check NavigationList items
      const navList = screen.elements.find(e => e.type === 'NavigationList') as any
      if (navList && navList.listItems) {
        navList.listItems.forEach((item: any) => {
          if (item.nextScreen && !nextScreens.includes(item.nextScreen)) {
            nextScreens.push(item.nextScreen)
          }
        })
      }
      
      routingModel[screen.id] = nextScreens
    })
    flowJson.routing_model = routingModel
  }
  
  // Build screens array - this is THE MOST CRITICAL PART
  flowJson.screens = screens.map((screen, index) => {
    console.log(`🔨 Building screen ${index}:`, screen.id, screen.title)
    return buildScreen(screen, index, screens)
  })
  
  // Add global data model schema for dynamic components
  const globalDataModel = generateGlobalDataModel(screens)
  if (Object.keys(globalDataModel).length > 0) {
    flowJson.data = globalDataModel
  }
  
  // Validate the final JSON against Flow JSON 7.3 specifications
  validateFlowJson(flowJson)
  
  console.log('✅ Final JSON built:', JSON.stringify(flowJson, null, 2))
  return flowJson
}

function validateFlowJson(flowJson: any): void {
  // Validate required top-level properties
  if (!flowJson.version) {
    console.error('❌ Missing required property: version')
  }
  
  if (!flowJson.data_api_version) {
    console.error('❌ Missing required property: data_api_version')
  }
  
  if (!flowJson.screens || !Array.isArray(flowJson.screens)) {
    console.error('❌ Missing or invalid screens array')
    return
  }
  
  // Validate each screen
  flowJson.screens.forEach((screen: any, index: number) => {
    if (!screen.id) {
      console.error(`❌ Screen ${index}: Missing required property 'id'`)
    }
    
    if (!screen.title) {
      console.error(`❌ Screen ${screen.id}: Missing required property 'title'`)
    }
    
    if (!screen.layout || !screen.layout.type) {
      console.error(`❌ Screen ${screen.id}: Missing or invalid layout`)
    }
    
    if (!screen.layout.children || !Array.isArray(screen.layout.children)) {
      console.error(`❌ Screen ${screen.id}: Missing or invalid layout children`)
    }
    
    // Validate terminal screens
    if (screen.terminal && typeof screen.success !== 'boolean') {
      console.error(`❌ Screen ${screen.id}: Terminal screen missing success property`)
    }
  })
  
  console.log('✅ Flow JSON validation completed')
}

function validateFlowLimits(screens: Screen[]) {
  // Validate screen count
  if (screens.length > FLOW_LIMITS.MAX_SCREENS) {
    console.warn(`⚠️ Flow exceeds maximum screens: ${screens.length}/${FLOW_LIMITS.MAX_SCREENS}`)
  }

  screens.forEach((screen, index) => {
    // Validate component count per screen
    if (screen.elements.length > FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN) {
      console.warn(`⚠️ Screen ${screen.id} exceeds maximum components: ${screen.elements.length}/${FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN}`)
    }

    // Validate form component count
    const formComponents = screen.elements.filter(el => isFormElement({ type: el.type }))
    if (formComponents.length > FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN) {
      console.warn(`⚠️ Screen ${screen.id} exceeds maximum form components: ${formComponents.length}/${FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN}`)
    }

    // Validate text length limits
    screen.elements.forEach(el => {
      if ('text' in el && el.text && typeof el.text === 'string') {
        const limit = FLOW_LIMITS.MAX_TEXT_LENGTH[el.type as keyof typeof FLOW_LIMITS.MAX_TEXT_LENGTH]
        if (limit && el.text.length > limit) {
          console.warn(`⚠️ ${el.type} text exceeds limit: ${el.text.length}/${limit} chars`)
        }
      }
    })
  })
}

function generateGlobalDataModel(screens: Screen[]): Record<string, any> {
  const dataModel: Record<string, any> = {}
  
  screens.forEach((screen, screenIndex) => {
    screen.elements.forEach(el => {
      // Add form field data models
      if ('name' in el && el.name) {
        const fieldSchema = generateFieldSchema(el)
        if (fieldSchema) {
          dataModel[el.name] = fieldSchema
        }
      }
      
      // Add conditional component data models
      if (el.type === 'If' && 'condition' in el) {
        const conditionVars = extractDataVariables(el.condition)
        conditionVars.forEach(varName => {
          if (!dataModel[varName]) {
            dataModel[varName] = {
              type: 'boolean',
              __example__: true,
              __description__: `Condition variable for If component`
            }
          }
        })
      }
      
      if (el.type === 'Switch' && 'value' in el) {
        const switchVars = extractDataVariables(el.value)
        switchVars.forEach(varName => {
          if (!dataModel[varName]) {
            dataModel[varName] = {
              type: 'string',
              __example__: 'default_value',
              __description__: `Switch value variable`
            }
          }
        })
      }
    })
  })
  
  return dataModel
}

function generateFieldSchema(el: AnyElement): any {
  const baseSchema = {
    __example__: getExampleValue(el.type),
    __description__: `Data from ${el.type} component`
  }

  switch (el.type) {
    case 'TextInput':
    case 'EmailInput':
    case 'PasswordInput':
    case 'PhoneInput':
    case 'TextArea':
      return {
        type: 'string',
        ...baseSchema,
        ...(('maxChars' in el && el.maxChars) && { maxLength: el.maxChars }),
        ...(('minChars' in el && el.minChars) && { minLength: el.minChars })
      }
    
    case 'CheckboxGroup':
    case 'ChipsSelector':
      return {
        type: 'array',
        items: { type: 'string' },
        ...baseSchema,
        __example__: ['option_1', 'option_2']
      }
    
    case 'RadioButtonsGroup':
    case 'Dropdown':
      return {
        type: 'string',
        ...baseSchema
      }
    
    case 'OptIn':
      return {
        type: 'boolean',
        ...baseSchema,
        __example__: true
      }
    
    case 'DatePicker':
    case 'CalendarPicker':
      return {
        type: 'string',
        format: 'date',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        ...baseSchema,
        __example__: '2024-01-01'
      }
    
    case 'PhotoPicker':
    case 'DocumentPicker':
      return {
        type: 'array',
        items: { type: 'string' },
        ...baseSchema,
        __example__: ['media_id_1'],
        __description__: `Media IDs from ${el.type} component`
      }
    
    default:
      return {
        type: 'string',
        ...baseSchema
      }
  }
}

function extractDataVariables(expression: string): string[] {
  const regex = /\$\{data\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g
  const variables: string[] = []
  let match
  
  while ((match = regex.exec(expression)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }
  
  return variables
}

function buildScreen(s: Screen, si: number, all: Screen[]) {
  console.log(`📄 buildScreen: ${s.id} - "${s.title}"`)
  console.log(`   Elements count: ${s.elements.length}`)
  console.log(`   Element order: ${s.elements.map((el, idx) => `${idx}:${el.type}(${el.id})`).join(', ')}`)
  
  // Map all elements - CRITICAL: Maintain exact order from screens array
  const elements = s.elements.map((el, ei) => {
    const mapped = mapElement(el, si, ei, s, all)
    console.log(`   ✓ Mapped element ${ei}: ${el.type}(${el.id}) -> ${mapped.type}`)
    return mapped
  })
  
  // Separate form elements from non-form elements while preserving relative order
  const formElements = elements.filter(el => isFormElement(el))
  const nonFormElements = elements.filter(el => !isFormElement(el))
  
  console.log(`   Form elements: ${formElements.length}, Non-form: ${nonFormElements.length}`)
  
  const children: any[] = []
  
  // Add non-form elements first (in their original order)
  children.push(...nonFormElements)
  
  // If there are form elements, wrap them in a Form component
  if (formElements.length > 0) {
    // CRITICAL: Footer MUST be the last element in Form children
    // BUT maintain the relative order of other form elements
    const footerElements = formElements.filter(el => el.type === 'Footer')
    const otherFormElements = formElements.filter(el => el.type !== 'Footer')
    
    children.push({
      type: 'Form',
      name: 'flow_path',
      children: [...otherFormElements, ...footerElements]  // Footer at the end
    })
  }
  
  const screen: any = {
    id: s.id,
    title: s.title,
    layout: {
      type: 'SingleColumnLayout',
      children: children
    }
  }

  // Check if this is a terminal screen
  const footer = s.elements.find(e => e.type === 'Footer') as any
  if (footer && footer.action === 'complete') {
    screen.terminal = true
    screen.success = true
    screen.data = {}
    console.log(`   ✓ Terminal screen: ${s.id}`)
  }

  // Add enhanced data schema from previous screens for navigation
  if (si > 0 && (!footer || footer.action !== 'complete')) {
    const dataSchema: Record<string, any> = {}
    
    // Collect all form fields from previous screens with enhanced schema
    for (let i = 0; i < si; i++) {
      const prevScreen = all[i]
      prevScreen.elements.forEach(el => {
        if ('name' in el && el.name) {
          const fieldSchema = generateFieldSchema(el)
          if (fieldSchema) {
            dataSchema[el.name] = fieldSchema
          }
        }
      })
    }
    
    // Add current screen's conditional data requirements
    s.elements.forEach(el => {
      if (el.type === 'If' && 'condition' in el) {
        const conditionVars = extractDataVariables(el.condition)
        conditionVars.forEach(varName => {
          if (!dataSchema[varName]) {
            dataSchema[varName] = {
              type: 'boolean',
              __example__: true,
              __description__: `Condition variable for If component`
            }
          }
        })
      }
      
      if (el.type === 'Switch' && 'value' in el) {
        const switchVars = extractDataVariables(el.value)
        switchVars.forEach(varName => {
          if (!dataSchema[varName]) {
            dataSchema[varName] = {
              type: 'string',
              __example__: 'default_value',
              __description__: `Switch value variable`
            }
          }
        })
      }
    })
    
    if (Object.keys(dataSchema).length > 0) {
      screen.data = dataSchema
    }
  }

  console.log(`   ✅ Screen built:`, screen.id)
  return screen
}

function getExampleValue(elementType: string): any {
  switch (elementType) {
    case 'TextInput':
      return 'Sample text input'
    case 'EmailInput':
      return 'user@example.com'
    case 'PasswordInput':
      return 'SecurePass123'
    case 'PhoneInput':
      return '+1234567890'
    case 'TextArea':
      return 'Multi-line text content'
    case 'CheckboxGroup':
    case 'ChipsSelector':
      return ['option_1', 'option_2']
    case 'RadioButtonsGroup':
    case 'Dropdown':
      return 'option_1'
    case 'OptIn':
      return true
    case 'DatePicker':
    case 'CalendarPicker':
      return '2024-01-01'
    case 'PhotoPicker':
      return ['photo_media_id_1', 'photo_media_id_2']
    case 'DocumentPicker':
      return ['document_media_id_1']
    default:
      return 'Sample value'
  }
}

function mapElement(el: AnyElement, si: number, ei: number, currentScreen?: Screen, allScreens?: Screen[]): any {
  switch (el.type) {
    case 'TextHeading':
      return { type: 'TextHeading', text: el.text, ...(el.visible !== undefined && { visible: el.visible }) }
    case 'TextSubheading':
      return { type: 'TextSubheading', text: el.text, ...(el.visible !== undefined && { visible: el.visible }) }
    case 'TextBody': {
      const result: any = { type: 'TextBody', text: el.text }
      if (el.fontWeight) result['font-weight'] = el.fontWeight
      if (el.strikethrough) result.strikethrough = el.strikethrough
      if (el.visible !== undefined) result.visible = el.visible
      if (el.markdown) result.markdown = el.markdown
      return result
    }
    case 'TextCaption': {
      const result: any = { type: 'TextCaption', text: el.text }
      if (el.fontWeight) result['font-weight'] = el.fontWeight
      if (el.strikethrough) result.strikethrough = el.strikethrough
      if (el.visible !== undefined) result.visible = el.visible
      if (el.markdown) result.markdown = el.markdown
      return result
    }
    case 'RichText': {
      const result: any = { type: 'RichText', text: el.text }
      if (el.visible !== undefined) result.visible = el.visible
      // Flow JSON 7.3 feature: RichText supports markdown by default
      result.markdown = true
      return result
    }
    case 'If': {
      const result: any = { 
        type: 'If', 
        condition: el.condition,
        then: el.then.map((childEl, idx) => mapElement(childEl, si, idx, currentScreen, allScreens))
      }
      if (el.else && el.else.length > 0) {
        result.else = el.else.map((childEl, idx) => mapElement(childEl, si, idx, currentScreen, allScreens))
      }
      if (el.visible !== undefined) result.visible = el.visible
      return result
    }
    case 'Switch': {
      const result: any = { 
        type: 'Switch', 
        value: el.value,
        cases: el.cases.map(caseItem => ({
          case: caseItem.case,
          elements: caseItem.elements.map((childEl, idx) => mapElement(childEl, si, idx, currentScreen, allScreens))
        }))
      }
      if (el.default && el.default.length > 0) {
        result.default = el.default.map((childEl, idx) => mapElement(childEl, si, idx, currentScreen, allScreens))
      }
      if (el.visible !== undefined) result.visible = el.visible
      return result
    }
    case 'TextInput': {
      const result: any = { 
        type: 'TextInput',
        'input-type': el.inputType || 'text',  // Default to 'text' if not specified
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.pattern) result.pattern = el.pattern
      if (el.helperText) result['helper-text'] = el.helperText
      if (el.minChars) result['min-chars'] = el.minChars
      if (el.maxChars) result['max-chars'] = el.maxChars
      if (el.labelVariant) result['label-variant'] = el.labelVariant
      if (el.initValue) result['init-value'] = el.initValue
      if (el.errorMessage) result['error-message'] = el.errorMessage
      return result
    }
    case 'EmailInput': {
      const result: any = { 
        type: 'TextInput', 
        'input-type': 'email',
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.helperText) result['helper-text'] = el.helperText
      return result
    }
    case 'PasswordInput': {
      const result: any = { 
        type: 'TextInput', 
        'input-type': 'password',
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.helperText) result['helper-text'] = el.helperText
      if (el.minChars) result['min-chars'] = el.minChars
      if (el.maxChars) result['max-chars'] = el.maxChars
      return result
    }
    case 'PhoneInput': {
      const result: any = { 
        type: 'TextInput', 
        'input-type': 'phone',
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.helperText) result['helper-text'] = el.helperText
      return result
    }
    case 'CheckboxGroup': {
      const result: any = { 
        type: 'CheckboxGroup', 
        label: el.label, 
        name: el.name, 
        'data-source': el.dataSource
      }
      if (el.required !== undefined) result.required = el.required
      if (el.minSelectedItems) result['min-selected-items'] = el.minSelectedItems
      if (el.maxSelectedItems) result['max-selected-items'] = el.maxSelectedItems
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.visible !== undefined) result.visible = el.visible
      if (el.description) result.description = el.description
      if (el.onSelectAction) result['on-select-action'] = el.onSelectAction
      if (el.onUnselectAction) result['on-unselect-action'] = el.onUnselectAction
      if (el.mediaSize) result['media-size'] = el.mediaSize
      return result
    }
    case 'RadioButtonsGroup': {
      const result: any = { 
        type: 'RadioButtonsGroup', 
        label: el.label, 
        name: el.name, 
        'data-source': el.options
      }
      if (el.required !== undefined) result.required = el.required
      return result
    }
    case 'ChipsSelector': {
      const result: any = { 
        type: 'ChipsSelector', 
        label: el.label, 
        name: el.name, 
        'data-source': el.dataSource
      }
      if (el.required !== undefined) result.required = el.required
      if (el.minSelectedItems) result['min-selected-items'] = el.minSelectedItems
      if (el.maxSelectedItems) result['max-selected-items'] = el.maxSelectedItems
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.visible !== undefined) result.visible = el.visible
      if (el.description) result.description = el.description
      if (el.onSelectAction) result['on-select-action'] = el.onSelectAction
      if (el.onUnselectAction) result['on-unselect-action'] = el.onUnselectAction
      if (el.mediaSize) result['media-size'] = el.mediaSize
      return result
    }
    case 'TextArea': {
      const result: any = { 
        type: 'TextArea', 
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.maxLength) result['max-length'] = el.maxLength
      if (el.helperText) result['helper-text'] = el.helperText
      if (el.labelVariant) result['label-variant'] = el.labelVariant
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.initValue) result['init-value'] = el.initValue
      if (el.errorMessage) result['error-message'] = el.errorMessage
      return result
    }
    case 'Dropdown': {
      const result: any = { 
        type: 'Dropdown', 
        label: el.label, 
        name: el.name, 
        'data-source': el.options
      }
      if (el.required !== undefined) result.required = el.required
      return result
    }
    case 'OptIn': {
      const result: any = { 
        type: 'OptIn', 
        label: el.label, 
        name: el.name
      }
      if (el.required !== undefined) result.required = el.required
      if (el.visible !== undefined) result.visible = el.visible
      return result
    }
    case 'EmbeddedLink': {
      const result: any = { type: 'EmbeddedLink', text: el.text }
      if (el.url) result['on-click-action'] = { name: 'open_url', url: el.url }
      if (el.visible !== undefined) result.visible = el.visible
      return result
    }
    case 'DatePicker': {
      const result: any = { type: 'DatePicker', label: el.label, name: el.name }
      if (el.minDate) result['min-date'] = el.minDate
      if (el.maxDate) result['max-date'] = el.maxDate
      if (el.unavailableDates) result['unavailable-dates'] = el.unavailableDates
      if (el.visible !== undefined) result.visible = el.visible
      if (el.helperText) result['helper-text'] = el.helperText
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.required !== undefined) result.required = el.required
      return result
    }
    case 'CalendarPicker': {
      const result: any = { type: 'CalendarPicker', name: el.name, label: el.label }
      if (el.title) result.title = el.title
      if (el.description) result.description = el.description
      if (el.helperText) result['helper-text'] = el.helperText
      if (el.required !== undefined) result.required = el.required
      if (el.visible !== undefined) result.visible = el.visible
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.mode) result.mode = el.mode
      if (el.minDate) result['min-date'] = el.minDate
      if (el.maxDate) result['max-date'] = el.maxDate
      if (el.unavailableDates) result['unavailable-dates'] = el.unavailableDates
      return result
    }
    case 'Image': {
      const result: any = { type: 'Image', src: el.src }
      if (el.width) result.width = el.width
      if (el.height) result.height = el.height
      if (el.scaleType) result['scale-type'] = el.scaleType
      if (el.aspectRatio) result['aspect-ratio'] = el.aspectRatio
      if (el.altText) result['alt-text'] = el.altText
      return result
    }
    case 'ImageCarousel': {
      const result: any = { 
        type: 'ImageCarousel', 
        images: el.images?.map((img: any) => ({
          src: img.src,
          ...(img.altText && { 'alt-text': img.altText })
        })) || []
      }
      if (el.aspectRatio) result['aspect-ratio'] = el.aspectRatio
      if (el.scaleType) result['scale-type'] = el.scaleType
      return result
    }
    case 'PhotoPicker': {
      const result: any = { 
        type: 'PhotoPicker', 
        name: el.name,
        label: el.label,
        'photo-source': el.photoSource || 'camera_gallery',
        'min-uploaded-photos': el.minUploadedPhotos !== undefined ? el.minUploadedPhotos : 0,
        'max-uploaded-photos': el.maxUploadedPhotos || 10,
        'max-file-size-kb': el.maxFileSizeKb || 10240
      }
      if (el.description) result.description = el.description
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.visible !== undefined) result.visible = el.visible
      if (el.errorMessage) result['error-message'] = el.errorMessage
      return result
    }
    case 'DocumentPicker': {
      const result: any = { 
        type: 'DocumentPicker', 
        name: el.name,
        label: el.label,
        'min-uploaded-documents': el.minUploadedDocuments !== undefined ? el.minUploadedDocuments : 0,
        'max-uploaded-documents': el.maxUploadedDocuments || 10,
        'max-file-size-kb': el.maxFileSizeKb || 10240
      }
      if (el.description) result.description = el.description
      if (el.allowedMimeTypes && el.allowedMimeTypes.length > 0) result['allowed-mime-types'] = el.allowedMimeTypes
      if (el.enabled !== undefined) result.enabled = el.enabled
      if (el.visible !== undefined) result.visible = el.visible
      if (el.errorMessage) result['error-message'] = el.errorMessage
      return result
    }
    case 'NavigationList': {
      const result: any = { 
        type: 'NavigationList', 
        name: el.name, 
        'list-items': el.listItems.map(item => {
          const listItem: any = {
            id: item.id,
            'main-content': item.mainContent,
            ...(item.start && { start: item.start }),
            ...(item.end && { end: item.end })
          }
          
          // Add on-click-action for each list item if it has navigation
          if (item.nextScreen) {
            listItem['on-click-action'] = {
              name: 'navigate',
              next: {
                type: 'screen',
                name: item.nextScreen
              },
              payload: item.payload || {}
            }
          }
          
          return listItem
        })
      }
      if (el.label) result.label = el.label
      if (el.description) result.description = el.description
      return result
    }
    case 'Footer': {
      const result: any = {
        type: 'Footer',
        label: el.label
      }
      
      // Add new Footer properties
      if (el.leftCaption) result['left-caption'] = el.leftCaption
      if (el.centerCaption) result['center-caption'] = el.centerCaption
      if (el.rightCaption) result['right-caption'] = el.rightCaption
      if (el.enabled !== undefined) result.enabled = el.enabled
      
      if (el.action === 'navigate') {
        const payload: Record<string, string> = {}
        
        // Collect form fields from current screen (exclude Footer itself)
        if (currentScreen) {
          const currentScreenFormFields = currentScreen.elements.filter((elem: any) => 
            'name' in elem && elem.name && elem.type !== 'Footer'
          )
          currentScreenFormFields.forEach((field: any) => {
            if ('name' in field && field.name) {
              payload[field.name] = `\${form.${field.name}}`
            }
          })
        }
        
        result['on-click-action'] = {
          name: 'navigate',
          next: {
            type: 'screen',
            name: el.nextScreen
          },
          payload: payload
        }
      } else if (el.action === 'complete') {
        const payload: Record<string, string> = {}
        
        // Collect form fields from current screen (exclude Footer itself)
        if (currentScreen) {
          const currentScreenFormFields = currentScreen.elements.filter((elem: any) => 
            'name' in elem && elem.name && elem.type !== 'Footer'
          )
          currentScreenFormFields.forEach((field: any) => {
            if ('name' in field && field.name) {
              payload[field.name] = `\${form.${field.name}}`
            }
          })
        }
        
        // Collect data from previous screens (exclude Footer)
        if (allScreens) {
          for (let i = 0; i < si; i++) {
            const prevScreen = allScreens[i]
            prevScreen.elements.forEach((elem: any) => {
              if ('name' in elem && elem.name && elem.type !== 'Footer') {
                payload[elem.name] = `\${data.${elem.name}}`
              }
            })
          }
        }
        
        result['on-click-action'] = {
          name: 'complete',
          payload: payload
        }
      }
      
      return result
    }
  }
}

function inferPayloadVar(key: string, si: number) {
  // expected key format like screen_0_Choose_one_0
  const parts = key.split('_')
  const name = parts.slice(2, parts.length - 1).join('_')
  return `form.${name}`
}

function extractFieldName(key: string): string {
  // If key is already a simple field name, return as is
  if (!key.includes('screen_')) {
    return key
  }
  
  // Handle complex format like "screen_0_Choose_0" -> "Choose_one"
  // or "screen_0_Leave_a_1" -> "Leave_a_comment"
  const parts = key.split('_')
  if (parts.length >= 3 && parts[0] === 'screen') {
    // Extract the field name part (everything between screen_X_ and _Y)
    return parts.slice(2, parts.length - 1).join('_')
  }
  
  // Fallback: return the key as is
  return key
}

function isFormElement(element: any): boolean {
  const formElementTypes = [
    'TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea',
    'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
    'DatePicker', 'CalendarPicker',
    'PhotoPicker', 'DocumentPicker',  // Media upload components MUST be in Form
    'Footer'  // Footer should be in Form when collecting form data
  ]
  return formElementTypes.includes(element.type)
}
