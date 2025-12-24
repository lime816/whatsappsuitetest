import type { Screen, AnyElement } from '../types'

export interface ValidationError {
  type: 'error' | 'warning'
  message: string
  field?: string
  limit?: number
  current?: number
}

export interface ComponentValidation {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// Flow JSON 7.3 limits and constraints
const LIMITS = {
  TEXT_HEADING: 80,
  TEXT_SUBHEADING: 80,
  TEXT_BODY: 4096,
  TEXT_CAPTION: 400,
  RICH_TEXT: 4096,
  INPUT_LABEL: 40,
  HELPER_TEXT: 80,
  DESCRIPTION: 300,
  TEXT_INPUT: 128,
  TEXT_AREA: 4096,
  EMBEDDED_LINK_TEXT: 25,
  MAX_COMPONENTS_PER_SCREEN: 50,
  MAX_FORM_COMPONENTS_PER_SCREEN: 20,
  MAX_SCREENS: 20,
  MAX_EMBEDDED_LINKS_PER_SCREEN: 2,
  MAX_NAVIGATION_LIST_ITEMS: 20
}

export function validateComponent(element: AnyElement): ComponentValidation {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  switch (element.type) {
    case 'TextHeading':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Heading text is required' })
      } else if (element.text.length > LIMITS.TEXT_HEADING) {
        errors.push({ 
          type: 'error', 
          message: `Heading text exceeds limit`, 
          field: 'text',
          limit: LIMITS.TEXT_HEADING,
          current: element.text.length
        })
      }
      break

    case 'TextSubheading':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Subheading text is required' })
      } else if (element.text.length > LIMITS.TEXT_SUBHEADING) {
        errors.push({ 
          type: 'error', 
          message: `Subheading text exceeds limit`, 
          field: 'text',
          limit: LIMITS.TEXT_SUBHEADING,
          current: element.text.length
        })
      }
      break

    case 'TextBody':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Body text is required' })
      } else if (element.text.length > LIMITS.TEXT_BODY) {
        errors.push({ 
          type: 'error', 
          message: `Body text exceeds limit`, 
          field: 'text',
          limit: LIMITS.TEXT_BODY,
          current: element.text.length
        })
      }
      break

    case 'TextCaption':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Caption text is required' })
      } else if (element.text.length > LIMITS.TEXT_CAPTION) {
        errors.push({ 
          type: 'error', 
          message: `Caption text exceeds limit`, 
          field: 'text',
          limit: LIMITS.TEXT_CAPTION,
          current: element.text.length
        })
      }
      // Warning when approaching limit
      else if (element.text.length > LIMITS.TEXT_CAPTION * 0.9) {
        warnings.push({ 
          type: 'warning', 
          message: `Caption text approaching limit`, 
          field: 'text',
          limit: LIMITS.TEXT_CAPTION,
          current: element.text.length
        })
      }
      break

    case 'RichText':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Rich text content is required' })
      } else if (element.text.length > LIMITS.RICH_TEXT) {
        errors.push({ 
          type: 'error', 
          message: `Rich text exceeds limit`, 
          field: 'text',
          limit: LIMITS.RICH_TEXT,
          current: element.text.length
        })
      }
      break

    case 'TextInput':
    case 'EmailInput':
    case 'PasswordInput':
    case 'PhoneInput':
      if (!('label' in element) || !element.label) {
        errors.push({ type: 'error', message: 'Input label is required' })
      } else if (element.label.length > LIMITS.INPUT_LABEL) {
        errors.push({ 
          type: 'error', 
          message: `Input label exceeds limit`, 
          field: 'label',
          limit: LIMITS.INPUT_LABEL,
          current: element.label.length
        })
      }

      if (!('name' in element) || !element.name) {
        errors.push({ type: 'error', message: 'Input name is required' })
      }

      if ('helperText' in element && element.helperText && element.helperText.length > LIMITS.HELPER_TEXT) {
        errors.push({ 
          type: 'error', 
          message: `Helper text exceeds limit`, 
          field: 'helperText',
          limit: LIMITS.HELPER_TEXT,
          current: element.helperText.length
        })
      }
      break

    case 'TextArea':
      if (!('label' in element) || !element.label) {
        errors.push({ type: 'error', message: 'TextArea label is required' })
      } else if (element.label.length > LIMITS.INPUT_LABEL) {
        errors.push({ 
          type: 'error', 
          message: `TextArea label exceeds limit`, 
          field: 'label',
          limit: LIMITS.INPUT_LABEL,
          current: element.label.length
        })
      }

      if (!('name' in element) || !element.name) {
        errors.push({ type: 'error', message: 'TextArea name is required' })
      }
      break

    case 'CheckboxGroup':
    case 'ChipsSelector':
      if (!('label' in element) || !element.label) {
        errors.push({ type: 'error', message: 'Selection component label is required' })
      }
      if (!('name' in element) || !element.name) {
        errors.push({ type: 'error', message: 'Selection component name is required' })
      }
      if ('dataSource' in element && (!element.dataSource || element.dataSource.length === 0)) {
        errors.push({ type: 'error', message: 'At least one option is required' })
      }
      break

    case 'RadioButtonsGroup':
    case 'Dropdown':
      if (!('label' in element) || !element.label) {
        errors.push({ type: 'error', message: 'Selection component label is required' })
      }
      if (!('name' in element) || !element.name) {
        errors.push({ type: 'error', message: 'Selection component name is required' })
      }
      if ('options' in element && (!element.options || element.options.length === 0)) {
        errors.push({ type: 'error', message: 'At least one option is required' })
      }
      break

    case 'If':
      if (!('condition' in element) || !element.condition) {
        errors.push({ type: 'error', message: 'If condition is required' })
      }
      if (!('then' in element) || !element.then || element.then.length === 0) {
        warnings.push({ type: 'warning', message: 'If component has no "then" elements' })
      }
      break

    case 'Switch':
      if (!('value' in element) || !element.value) {
        errors.push({ type: 'error', message: 'Switch value is required' })
      }
      if (!('cases' in element) || !element.cases || element.cases.length === 0) {
        errors.push({ type: 'error', message: 'Switch component needs at least one case' })
      }
      break

    case 'EmbeddedLink':
      if (!element.text) {
        errors.push({ type: 'error', message: 'Link text is required' })
      } else if (element.text.length > LIMITS.EMBEDDED_LINK_TEXT) {
        errors.push({ 
          type: 'error', 
          message: `Link text exceeds limit`, 
          field: 'text',
          limit: LIMITS.EMBEDDED_LINK_TEXT,
          current: element.text.length
        })
      }
      break

    case 'NavigationList':
      if ('listItems' in element && element.listItems && element.listItems.length > LIMITS.MAX_NAVIGATION_LIST_ITEMS) {
        errors.push({ 
          type: 'error', 
          message: `Navigation list exceeds item limit`, 
          field: 'listItems',
          limit: LIMITS.MAX_NAVIGATION_LIST_ITEMS,
          current: element.listItems.length
        })
      }
      break

    case 'Footer':
      if (!('label' in element) || !element.label) {
        errors.push({ type: 'error', message: 'Footer button label is required' })
      }
      if (!('action' in element) || !element.action) {
        errors.push({ type: 'error', message: 'Footer action is required' })
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateScreen(screen: Screen): ComponentValidation {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check component count limits
  if (screen.elements.length > LIMITS.MAX_COMPONENTS_PER_SCREEN) {
    errors.push({ 
      type: 'error', 
      message: `Screen exceeds component limit`, 
      limit: LIMITS.MAX_COMPONENTS_PER_SCREEN,
      current: screen.elements.length
    })
  } else if (screen.elements.length > LIMITS.MAX_COMPONENTS_PER_SCREEN * 0.8) {
    warnings.push({ 
      type: 'warning', 
      message: `Screen approaching component limit`, 
      limit: LIMITS.MAX_COMPONENTS_PER_SCREEN,
      current: screen.elements.length
    })
  }

  // Check form component count
  const formComponents = screen.elements.filter(el => 
    ['TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea', 
     'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
     'DatePicker', 'CalendarPicker', 'PhotoPicker', 'DocumentPicker'].includes(el.type)
  )
  
  if (formComponents.length > LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN) {
    errors.push({ 
      type: 'error', 
      message: `Screen exceeds form component limit`, 
      limit: LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN,
      current: formComponents.length
    })
  }

  // Check EmbeddedLink count
  const embeddedLinks = screen.elements.filter(el => el.type === 'EmbeddedLink')
  if (embeddedLinks.length > LIMITS.MAX_EMBEDDED_LINKS_PER_SCREEN) {
    errors.push({ 
      type: 'error', 
      message: `Screen exceeds embedded link limit`, 
      limit: LIMITS.MAX_EMBEDDED_LINKS_PER_SCREEN,
      current: embeddedLinks.length
    })
  }

  // Validate individual components
  screen.elements.forEach((element, index) => {
    const validation = validateComponent(element)
    validation.errors.forEach(error => {
      errors.push({ ...error, message: `Component ${index + 1}: ${error.message}` })
    })
    validation.warnings.forEach(warning => {
      warnings.push({ ...warning, message: `Component ${index + 1}: ${warning.message}` })
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export function validateFlow(screens: Screen[]): ComponentValidation {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Check screen count limit
  if (screens.length > LIMITS.MAX_SCREENS) {
    errors.push({ 
      type: 'error', 
      message: `Flow exceeds screen limit`, 
      limit: LIMITS.MAX_SCREENS,
      current: screens.length
    })
  }

  // Validate individual screens
  screens.forEach((screen, index) => {
    const validation = validateScreen(screen)
    validation.errors.forEach(error => {
      errors.push({ ...error, message: `Screen "${screen.title}": ${error.message}` })
    })
    validation.warnings.forEach(warning => {
      warnings.push({ ...warning, message: `Screen "${screen.title}": ${warning.message}` })
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}