# Design Document

## Overview

This design enhances the existing WhatsApp Flow components system to achieve full compliance with Facebook/Meta WhatsApp Flow specifications version 7.3 (the current recommended version). The system currently implements most component types using Flow JSON version 7.2 but requires improvements in property coverage, validation accuracy, JSON export consistency, and drag-and-drop positioning reliability.

The design focuses on bridging gaps between the current implementation and official Facebook specifications while maintaining backward compatibility and improving user experience. The target is Flow JSON version 7.3 which includes improved Flow JSON validations for routing model and data model.

## Architecture

### Current Architecture Analysis

The existing system follows a clean component-based architecture:

```
flowbuilder/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx              # Main component editor with drag-drop
│   │   ├── PropertyEditorInline.tsx # Property editing interface
│   │   ├── WhatsAppPreview.tsx     # Component preview system
│   │   └── FlowPreviewPane.tsx     # Flow preview
│   ├── state/
│   │   └── store.ts                # Zustand state management
│   └── types.ts                    # TypeScript type definitions
```

### Enhanced Architecture

The design maintains the existing architecture while adding new modules:

```
Enhanced System:
├── Validation Engine
├── JSON Export System  
├── Property Alignment Module
├── Drag-Drop Consistency Layer
└── Component Specification Matcher
```

## Components and Interfaces

### 1. Component Property Alignment System

**Purpose**: Ensure all component properties match Facebook specifications exactly.

**Current State Analysis**:
- TextHeading: ✅ Has `text`, `visible` - Missing: none (complete)
- TextSubheading: ✅ Has `text`, `visible` - Missing: none (complete)  
- TextBody: ✅ Has `text`, `fontWeight`, `strikethrough`, `visible`, `markdown` - Missing: none (complete)
- TextCaption: ✅ Has `text`, `fontWeight`, `strikethrough`, `visible`, `markdown` - Missing: none (complete)
- TextInput: ✅ Has basic properties - Missing: `label-variant`, `pattern`, `init-value`, `error-message`
- TextArea: ✅ Has basic properties - Missing: `label-variant`, `enabled`, `init-value`, `error-message`

**Interface**:
```typescript
interface ComponentSpecMatcher {
  validateProperties(component: AnyElement): ValidationResult[]
  getMissingProperties(componentType: ElementType): string[]
  getDeprecatedProperties(componentType: ElementType): string[]
  alignWithFacebookSpec(component: AnyElement): AnyElement
}
```

### 2. Enhanced Validation Engine

**Purpose**: Enforce all Facebook specification constraints and limits.

**Validation Rules**:
```typescript
interface ValidationRule {
  property: string
  constraint: 'character_limit' | 'required' | 'format' | 'count_limit' | 'enum_value'
  limit?: number
  pattern?: RegExp
  allowedValues?: string[]
  errorMessage: string
}

const FACEBOOK_CONSTRAINTS: Record<ElementType, ValidationRule[]> = {
  'TextHeading': [
    { property: 'text', constraint: 'character_limit', limit: 80, errorMessage: 'Heading text must be 80 characters or less' },
    { property: 'text', constraint: 'required', errorMessage: 'Heading text is required' }
  ],
  'TextCaption': [
    { property: 'text', constraint: 'character_limit', limit: 400, errorMessage: 'Caption text must be 400 characters or less' },
    { property: 'text', constraint: 'required', errorMessage: 'Caption text cannot be empty or blank' }
  ],
  // ... all other component constraints
}
```

### 3. Drag-and-Drop JSON Consistency System

**Purpose**: Maintain accurate JSON structure during drag-and-drop operations.

**Current Issue**: Component reordering may not immediately update JSON export order.

**Solution Architecture**:
```typescript
interface DragDropConsistencyLayer {
  onDragStart(elementId: string): void
  onDragEnd(result: DragEndEvent): void
  validateJSONOrder(screenId: string): boolean
  syncVisualOrderWithJSON(screenId: string): void
}

// Enhanced store methods
interface EnhancedFlowState extends FlowState {
  moveElement: (screenId: string, from: number, to: number) => void // Enhanced
  validateComponentOrder: (screenId: string) => boolean
  exportToFlowJSON: () => FlowJSONSchema // New method
}
```

### 4. Missing Properties Implementation

**TextInput Enhancements**:
```typescript
interface EnhancedTextInputEl extends TextInputEl {
  labelVariant?: 'large'  // New: Flow JSON 7.0+
  pattern?: string        // New: Flow JSON 6.2+
  initValue?: string      // New: Flow JSON 4.0+
  errorMessage?: string   // New: Flow JSON 4.0+
}
```

**Selection Component Enhancements**:
```typescript
interface EnhancedCheckboxGroupEl extends CheckboxGroupEl {
  onSelectAction?: Action     // New: Flow JSON 6.0+
  onUnselectAction?: Action   // New: Flow JSON 6.0+
  mediaSize?: 'regular' | 'large'  // New: Flow JSON 5.0+
  initValue?: string[]        // New: Flow JSON 4.0+
  errorMessage?: string       // New: Flow JSON 4.0+
}
```

### 5. New Component Types

**RichText Component** (Currently Missing):
```typescript
interface RichTextEl extends BaseElement {
  type: 'RichText'
  text: string | string[]  // Supports markdown
  visible?: boolean
}
```

**Conditional Components** (Currently Missing):
```typescript
interface IfEl extends BaseElement {
  type: 'If'
  condition: string        // Boolean expression
  then: AnyElement[]      // Components when true
  else?: AnyElement[]     // Components when false
}

interface SwitchEl extends BaseElement {
  type: 'Switch'
  value: string           // Variable to evaluate
  cases: Record<string, AnyElement[]>  // Key-value component mapping
}
```

## Data Models

### Enhanced Component Type System

```typescript
// Extended element types
export type ElementType = 
  | 'TextHeading' | 'TextSubheading' | 'TextBody' | 'TextCaption' | 'RichText'
  | 'TextInput' | 'EmailInput' | 'PasswordInput' | 'PhoneInput' | 'TextArea'
  | 'CheckboxGroup' | 'RadioButtonsGroup' | 'ChipsSelector' | 'Dropdown' | 'OptIn'
  | 'DatePicker' | 'CalendarPicker'
  | 'Image' | 'ImageCarousel' | 'PhotoPicker' | 'DocumentPicker'
  | 'NavigationList' | 'EmbeddedLink' | 'Footer'
  | 'If' | 'Switch'  // New conditional components

// Enhanced Footer with all caption options
export type EnhancedFooterEl = BaseElement & {
  type: 'Footer'
  label: string
  leftCaption?: string    // New
  centerCaption?: string  // New  
  rightCaption?: string   // New
  enabled?: boolean       // New
  action: 'navigate' | 'complete'
  nextScreen?: string
  payloadKeys: string[]
  onClickAction?: Action  // New: for data_exchange, open_url
}
```

### Flow JSON Export Schema

```typescript
interface FlowJSONSchema {
  version: '7.3'  // Target the current recommended version
  data_api_version: '4.0'  // Current recommended Data API version
  routing_model: Record<string, string[]>
  screens: FlowScreen[]
}

interface FlowScreen {
  id: string
  title: string
  terminal?: boolean
  success?: boolean
  data?: Record<string, DataModel>  // For dynamic components
  layout: {
    type: 'SingleColumnLayout'
    children: ComponentJSON[]
  }
}

interface ComponentJSON {
  type: string
  [key: string]: any  // Component-specific properties
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the acceptance criteria, several properties can be consolidated to eliminate redundancy:
- Properties 2.1 and 5.2 both test JSON order consistency and can be combined
- Property 4.1 and 10.1 both test validation limits and can be combined into a comprehensive validation property
- Multiple properties test the same underlying validation engine behavior

### Core Properties

**Property 1: Component Property Specification Compliance**
*For any* component type supported by the system, all properties should match exactly with the Facebook WhatsApp Flow specification, and no non-standard properties should exist
**Validates: Requirements 1.1, 1.2**

**Property 2: Property Editor Completeness**
*For any* component type, the property editor should display all official properties with correct input controls and validation
**Validates: Requirements 1.3, 7.2**

**Property 3: Drag-Drop JSON Consistency**
*For any* sequence of drag-and-drop operations on components, the exported JSON should maintain the exact visual order and preserve all component properties
**Validates: Requirements 2.1, 2.2, 2.3, 5.2**

**Property 4: Comprehensive Validation Enforcement**
*For any* component configuration that violates Facebook specification limits (character limits, component counts, file sizes), the validation engine should reject it with specific error messages
**Validates: Requirements 4.1, 4.2, 10.1**

**Property 5: JSON Export Specification Accuracy**
*For any* component exported to Flow JSON, all property names and formats should match the Facebook specification exactly
**Validates: Requirements 5.1**

**Property 6: Visual Validation Feedback**
*For any* component with validation errors, the preview system should display visual warning indicators
**Validates: Requirements 6.2**

**Property 7: Data Model Generation**
*For any* screen containing components with dynamic data bindings, the system should generate appropriate data model schemas
**Validates: Requirements 9.1**

**Property 8: Help System Completeness**
*For any* component property, tooltips and help text should be available explaining constraints and usage
**Validates: Requirements 12.1**

<function_calls>
<invoke name="prework">
<parameter name="featureName">whatsapp-flow-components

## Error Handling

### Validation Error Categories

1. **Property Validation Errors**
   - Character limit violations
   - Required property missing
   - Invalid enum values
   - Malformed dynamic data syntax

2. **Component Count Violations**
   - Too many images per screen (>3)
   - Too many EmbeddedLinks per screen (>2)
   - Too many carousel components per flow (>3)

3. **Drag-Drop Operation Errors**
   - Invalid drop targets
   - Component property corruption
   - JSON structure inconsistencies

4. **Export Validation Errors**
   - Invalid Flow JSON structure
   - Missing required properties
   - Version compatibility issues

### Error Recovery Strategies

```typescript
interface ErrorRecoverySystem {
  validateAndRecover(component: AnyElement): RecoveryResult
  repairJSONStructure(screen: Screen): RepairResult
  rollbackDragOperation(operationId: string): void
  sanitizeProperties(component: AnyElement): AnyElement
}
```

## Testing Strategy

### Dual Testing Approach

The system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Test specific component configurations
- Test UI interactions and state changes
- Test error conditions and edge cases
- Test integration between components

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random component configurations and validate against Facebook specs
- Test drag-and-drop operations with random sequences
- Validate JSON export consistency across all component combinations
- Test validation engine with random invalid inputs

### Property-Based Testing Configuration

- **Minimum 100 iterations** per property test due to randomization
- **Test Library**: Use `fast-check` for TypeScript property-based testing
- **Tag Format**: `Feature: whatsapp-flow-components, Property {number}: {property_text}`

### Test Categories

1. **Component Specification Tests**
   - Verify all component types have correct properties
   - Test property validation rules
   - Validate default values

2. **Drag-Drop Consistency Tests**
   - Test component reordering preserves properties
   - Verify JSON export order matches visual order
   - Test nested component handling

3. **Validation Engine Tests**
   - Test character limit enforcement
   - Test component count limits
   - Test format validation (dates, patterns, etc.)

4. **JSON Export Tests**
   - Verify exported JSON matches Facebook schema
   - Test version compatibility
   - Validate data model generation

5. **UI Integration Tests**
   - Test property editor displays correct controls
   - Verify validation feedback appears correctly
   - Test preview system accuracy

### Example Property Test Structure

```typescript
// Feature: whatsapp-flow-components, Property 1: Component Property Specification Compliance
describe('Component Property Specification Compliance', () => {
  it('should match Facebook specs for all component types', () => {
    fc.assert(fc.property(
      fc.constantFrom(...ALL_COMPONENT_TYPES),
      (componentType) => {
        const component = createDefaultElement(componentType)
        const facebookSpec = getFacebookSpecification(componentType)
        const validation = validateAgainstSpec(component, facebookSpec)
        expect(validation.isValid).toBe(true)
        expect(validation.missingProperties).toHaveLength(0)
        expect(validation.extraProperties).toHaveLength(0)
      }
    ), { numRuns: 100 })
  })
})
```

This comprehensive design addresses all the requirements while maintaining compatibility with the existing implementation and providing a clear path for enhancement and validation.