const logger = require('./logger');

// Flow JSON 7.3 specifications and limits
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
  },
  MAX_OPTIONS: {
    RadioButtonsGroup: 20,
    CheckboxGroup: 20,
    ChipsSelector: 20,
    Dropdown: 20
  },
  MAX_LIST_ITEMS: {
    NavigationList: 10
  },
  MAX_IMAGES: {
    ImageCarousel: 10
  }
};

/**
 * Validation result structure
 */
class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
  }

  addError(message, field = null, limit = null, current = null) {
    this.isValid = false;
    this.errors.push({ message, field, limit, current });
  }

  addWarning(message, field = null, limit = null, current = null) {
    this.warnings.push({ message, field, limit, current });
  }

  hasIssues() {
    return this.errors.length > 0 || this.warnings.length > 0;
  }
}

/**
 * Validate a single component
 */
function validateComponent(element) {
  const result = new ValidationResult();

  if (!element || !element.type) {
    result.addError('Component missing type');
    return result;
  }

  // Validate based on component type
  switch (element.type) {
    case 'TextHeading':
      validateTextComponent(element, result, 'TextHeading');
      break;
    
    case 'TextSubheading':
      validateTextComponent(element, result, 'TextSubheading');
      break;
    
    case 'TextBody':
      validateTextComponent(element, result, 'TextBody');
      break;
    
    case 'TextCaption':
      validateTextComponent(element, result, 'TextCaption');
      break;
    
    case 'RichText':
      validateTextComponent(element, result, 'RichText');
      break;
    
    case 'TextInput':
    case 'EmailInput':
    case 'PasswordInput':
    case 'PhoneInput':
      validateInputComponent(element, result);
      break;
    
    case 'TextArea':
      validateTextAreaComponent(element, result);
      break;
    
    case 'RadioButtonsGroup':
      validateRadioComponent(element, result);
      break;
    
    case 'CheckboxGroup':
      validateCheckboxComponent(element, result);
      break;
    
    case 'ChipsSelector':
      validateChipsComponent(element, result);
      break;
    
    case 'Dropdown':
      validateDropdownComponent(element, result);
      break;
    
    case 'OptIn':
      validateOptInComponent(element, result);
      break;
    
    case 'DatePicker':
      validateDatePickerComponent(element, result);
      break;
    
    case 'CalendarPicker':
      validateCalendarPickerComponent(element, result);
      break;
    
    case 'Image':
      validateImageComponent(element, result);
      break;
    
    case 'ImageCarousel':
      validateImageCarouselComponent(element, result);
      break;
    
    case 'PhotoPicker':
      validatePhotoPickerComponent(element, result);
      break;
    
    case 'DocumentPicker':
      validateDocumentPickerComponent(element, result);
      break;
    
    case 'NavigationList':
      validateNavigationListComponent(element, result);
      break;
    
    case 'EmbeddedLink':
      validateEmbeddedLinkComponent(element, result);
      break;
    
    case 'Footer':
      validateFooterComponent(element, result);
      break;
    
    default:
      result.addWarning(`Unknown component type: ${element.type}`);
  }

  return result;
}

/**
 * Validate a screen
 */
function validateScreen(screen) {
  const result = new ValidationResult();

  if (!screen) {
    result.addError('Screen is null or undefined');
    return result;
  }

  // Validate screen properties
  if (!screen.id) {
    result.addError('Screen missing ID');
  }

  if (!screen.title) {
    result.addError('Screen missing title');
  }

  if (!screen.elements || !Array.isArray(screen.elements)) {
    result.addError('Screen missing elements array');
    return result;
  }

  // Validate screen limits
  if (screen.elements.length > FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN) {
    result.addError(
      `Too many components in screen`,
      'elements',
      FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN,
      screen.elements.length
    );
  }

  // Count form components
  const formComponents = screen.elements.filter(el => isFormElement(el));
  if (formComponents.length > FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN) {
    result.addError(
      `Too many form components in screen`,
      'formElements',
      FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN,
      formComponents.length
    );
  }

  // Validate each component
  screen.elements.forEach((element, index) => {
    const componentResult = validateComponent(element);
    
    // Merge component validation results
    componentResult.errors.forEach(error => {
      result.addError(`Component ${index + 1} (${element.type}): ${error.message}`, error.field, error.limit, error.current);
    });
    
    componentResult.warnings.forEach(warning => {
      result.addWarning(`Component ${index + 1} (${element.type}): ${warning.message}`, warning.field, warning.limit, warning.current);
    });
  });

  // Validate screen structure
  validateScreenStructure(screen, result);

  return result;
}

/**
 * Validate entire flow
 */
function validateFlow(screens) {
  const result = new ValidationResult();

  if (!screens || !Array.isArray(screens)) {
    result.addError('Flow missing screens array');
    return result;
  }

  if (screens.length === 0) {
    result.addError('Flow must have at least one screen');
    return result;
  }

  if (screens.length > FLOW_LIMITS.MAX_SCREENS) {
    result.addError(
      `Too many screens in flow`,
      'screens',
      FLOW_LIMITS.MAX_SCREENS,
      screens.length
    );
  }

  // Validate each screen
  screens.forEach((screen, index) => {
    const screenResult = validateScreen(screen);
    
    // Merge screen validation results
    screenResult.errors.forEach(error => {
      result.addError(`Screen ${index + 1} (${screen.id || 'unnamed'}): ${error.message}`, error.field, error.limit, error.current);
    });
    
    screenResult.warnings.forEach(warning => {
      result.addWarning(`Screen ${index + 1} (${screen.id || 'unnamed'}): ${warning.message}`, warning.field, warning.limit, warning.current);
    });
  });

  // Validate flow structure
  validateFlowStructure(screens, result);

  return result;
}

// === COMPONENT-SPECIFIC VALIDATION FUNCTIONS ===

function validateTextComponent(element, result, type) {
  if (!element.text) {
    result.addError('Text component missing text content');
    return;
  }

  const limit = FLOW_LIMITS.MAX_TEXT_LENGTH[type];
  if (limit && element.text.length > limit) {
    result.addError(
      `Text exceeds maximum length`,
      'text',
      limit,
      element.text.length
    );
  }

  // Warning for near limit
  if (limit && element.text.length > limit * 0.9) {
    result.addWarning(
      `Text approaching maximum length`,
      'text',
      limit,
      element.text.length
    );
  }
}

function validateInputComponent(element, result) {
  if (!element.label) {
    result.addError('Input component missing label');
  }

  if (!element.name) {
    result.addError('Input component missing name');
  }

  // Validate label length
  if (element.label && element.label.length > FLOW_LIMITS.MAX_INPUT_LENGTH.label) {
    result.addError(
      `Label exceeds maximum length`,
      'label',
      FLOW_LIMITS.MAX_INPUT_LENGTH.label,
      element.label.length
    );
  }

  // Validate helper text length
  if (element.helperText && element.helperText.length > FLOW_LIMITS.MAX_INPUT_LENGTH.helperText) {
    result.addError(
      `Helper text exceeds maximum length`,
      'helperText',
      FLOW_LIMITS.MAX_INPUT_LENGTH.helperText,
      element.helperText.length
    );
  }

  // Validate character limits
  if (element.minChars && element.maxChars && element.minChars > element.maxChars) {
    result.addError('Minimum characters cannot be greater than maximum characters');
  }

  // Validate input type specific rules
  if (element.type === 'EmailInput' && element.inputType && element.inputType !== 'email') {
    result.addWarning('EmailInput should use email input type');
  }
}

function validateTextAreaComponent(element, result) {
  validateInputComponent(element, result);

  if (element.maxLength && element.maxLength > FLOW_LIMITS.MAX_INPUT_LENGTH.TextArea) {
    result.addError(
      `TextArea max length exceeds limit`,
      'maxLength',
      FLOW_LIMITS.MAX_INPUT_LENGTH.TextArea,
      element.maxLength
    );
  }
}

function validateRadioComponent(element, result) {
  if (!element.label) {
    result.addError('Radio component missing label');
  }

  if (!element.name) {
    result.addError('Radio component missing name');
  }

  if (!element.options || !Array.isArray(element.options)) {
    result.addError('Radio component missing options array');
    return;
  }

  if (element.options.length === 0) {
    result.addError('Radio component must have at least one option');
  }

  if (element.options.length > FLOW_LIMITS.MAX_OPTIONS.RadioButtonsGroup) {
    result.addError(
      `Too many radio options`,
      'options',
      FLOW_LIMITS.MAX_OPTIONS.RadioButtonsGroup,
      element.options.length
    );
  }

  // Validate each option
  element.options.forEach((option, index) => {
    if (!option.id) {
      result.addError(`Radio option ${index + 1} missing id`);
    }
    if (!option.title) {
      result.addError(`Radio option ${index + 1} missing title`);
    }
  });
}

function validateCheckboxComponent(element, result) {
  validateRadioComponent(element, result); // Similar validation

  if (element.minSelectedItems && element.maxSelectedItems && 
      element.minSelectedItems > element.maxSelectedItems) {
    result.addError('Minimum selected items cannot be greater than maximum selected items');
  }
}

function validateChipsComponent(element, result) {
  validateCheckboxComponent(element, result); // Similar validation
}

function validateDropdownComponent(element, result) {
  validateRadioComponent(element, result); // Similar validation
}

function validateOptInComponent(element, result) {
  if (!element.label) {
    result.addError('OptIn component missing label');
  }

  if (!element.name) {
    result.addError('OptIn component missing name');
  }
}

function validateDatePickerComponent(element, result) {
  if (!element.label) {
    result.addError('DatePicker component missing label');
  }

  if (!element.name) {
    result.addError('DatePicker component missing name');
  }

  // Validate date format
  if (element.minDate && !isValidDateFormat(element.minDate)) {
    result.addError('Invalid minDate format (expected YYYY-MM-DD)');
  }

  if (element.maxDate && !isValidDateFormat(element.maxDate)) {
    result.addError('Invalid maxDate format (expected YYYY-MM-DD)');
  }

  if (element.minDate && element.maxDate && element.minDate > element.maxDate) {
    result.addError('Minimum date cannot be after maximum date');
  }
}

function validateCalendarPickerComponent(element, result) {
  validateDatePickerComponent(element, result);

  if (element.mode && !['single', 'range'].includes(element.mode)) {
    result.addError('Invalid calendar picker mode (must be "single" or "range")');
  }
}

function validateImageComponent(element, result) {
  if (!element.src) {
    result.addError('Image component missing src');
  }

  // Validate image dimensions
  if (element.width && element.width < 0) {
    result.addError('Image width cannot be negative');
  }

  if (element.height && element.height < 0) {
    result.addError('Image height cannot be negative');
  }
}

function validateImageCarouselComponent(element, result) {
  if (!element.images || !Array.isArray(element.images)) {
    result.addError('ImageCarousel missing images array');
    return;
  }

  if (element.images.length === 0) {
    result.addError('ImageCarousel must have at least one image');
  }

  if (element.images.length > FLOW_LIMITS.MAX_IMAGES.ImageCarousel) {
    result.addError(
      `Too many images in carousel`,
      'images',
      FLOW_LIMITS.MAX_IMAGES.ImageCarousel,
      element.images.length
    );
  }

  // Validate each image
  element.images.forEach((image, index) => {
    if (!image.src) {
      result.addError(`Image ${index + 1} missing src`);
    }
  });
}

function validatePhotoPickerComponent(element, result) {
  if (!element.name) {
    result.addError('PhotoPicker component missing name');
  }

  if (!element.label) {
    result.addError('PhotoPicker component missing label');
  }

  if (element.minUploadedPhotos && element.maxUploadedPhotos && 
      element.minUploadedPhotos > element.maxUploadedPhotos) {
    result.addError('Minimum uploaded photos cannot be greater than maximum uploaded photos');
  }

  if (element.maxFileSizeKb && element.maxFileSizeKb <= 0) {
    result.addError('Max file size must be positive');
  }
}

function validateDocumentPickerComponent(element, result) {
  validatePhotoPickerComponent(element, result); // Similar validation

  if (element.allowedMimeTypes && Array.isArray(element.allowedMimeTypes)) {
    element.allowedMimeTypes.forEach((mimeType, index) => {
      if (!isValidMimeType(mimeType)) {
        result.addWarning(`Invalid MIME type at index ${index}: ${mimeType}`);
      }
    });
  }
}

function validateNavigationListComponent(element, result) {
  if (!element.name) {
    result.addError('NavigationList component missing name');
  }

  if (!element.listItems || !Array.isArray(element.listItems)) {
    result.addError('NavigationList missing listItems array');
    return;
  }

  if (element.listItems.length === 0) {
    result.addError('NavigationList must have at least one item');
  }

  if (element.listItems.length > FLOW_LIMITS.MAX_LIST_ITEMS.NavigationList) {
    result.addError(
      `Too many navigation list items`,
      'listItems',
      FLOW_LIMITS.MAX_LIST_ITEMS.NavigationList,
      element.listItems.length
    );
  }

  // Validate each list item
  element.listItems.forEach((item, index) => {
    if (!item.id) {
      result.addError(`Navigation item ${index + 1} missing id`);
    }
    if (!item.mainContent || !item.mainContent.title) {
      result.addError(`Navigation item ${index + 1} missing main content title`);
    }
  });
}

function validateEmbeddedLinkComponent(element, result) {
  if (!element.text) {
    result.addError('EmbeddedLink component missing text');
  }

  if (element.url && !isValidUrl(element.url)) {
    result.addError('Invalid URL format');
  }
}

function validateFooterComponent(element, result) {
  if (!element.label) {
    result.addError('Footer component missing label');
  }

  if (!element.action) {
    result.addError('Footer component missing action');
  }

  if (element.action && !['navigate', 'complete'].includes(element.action)) {
    result.addError('Footer action must be "navigate" or "complete"');
  }

  if (element.action === 'navigate' && !element.nextScreen) {
    result.addError('Footer with navigate action missing nextScreen');
  }
}

// === STRUCTURE VALIDATION FUNCTIONS ===

function validateScreenStructure(screen, result) {
  // Check for required Footer in form screens
  const formElements = screen.elements.filter(el => isFormElement(el) && el.type !== 'Footer');
  const footers = screen.elements.filter(el => el.type === 'Footer');

  if (formElements.length > 0 && footers.length === 0) {
    result.addWarning('Screen with form elements should have a Footer component');
  }

  if (footers.length > 1) {
    result.addError('Screen cannot have more than one Footer component');
  }

  // Check for duplicate field names
  const fieldNames = screen.elements
    .filter(el => el.name)
    .map(el => el.name);
  
  const duplicateNames = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
  if (duplicateNames.length > 0) {
    result.addError(`Duplicate field names found: ${duplicateNames.join(', ')}`);
  }
}

function validateFlowStructure(screens, result) {
  // Check for terminal screens
  const terminalScreens = screens.filter(screen => {
    const footer = screen.elements.find(el => el.type === 'Footer');
    return footer && footer.action === 'complete';
  });

  if (terminalScreens.length === 0) {
    result.addWarning('Flow should have at least one terminal screen (with complete action)');
  }

  // Validate navigation references
  screens.forEach((screen, screenIndex) => {
    screen.elements.forEach(element => {
      if (element.type === 'Footer' && element.action === 'navigate') {
        if (element.nextScreen && !screens.find(s => s.id === element.nextScreen)) {
          result.addError(`Screen ${screenIndex + 1}: Footer references non-existent screen "${element.nextScreen}"`);
        }
      }

      if (element.type === 'NavigationList' && element.listItems) {
        element.listItems.forEach((item, itemIndex) => {
          if (item.nextScreen && !screens.find(s => s.id === item.nextScreen)) {
            result.addError(`Screen ${screenIndex + 1}: Navigation item ${itemIndex + 1} references non-existent screen "${item.nextScreen}"`);
          }
        });
      }
    });
  });
}

// === HELPER FUNCTIONS ===

function isFormElement(element) {
  const formElementTypes = [
    'TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea',
    'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
    'DatePicker', 'CalendarPicker',
    'PhotoPicker', 'DocumentPicker',
    'Footer'
  ];
  return formElementTypes.includes(element.type);
}

function isValidDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function isValidMimeType(mimeType) {
  const regex = /^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/;
  return regex.test(mimeType);
}

module.exports = {
  validateComponent,
  validateScreen,
  validateFlow,
  ValidationResult,
  FLOW_LIMITS
};