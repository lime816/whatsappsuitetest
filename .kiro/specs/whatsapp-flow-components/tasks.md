# Implementation Plan: WhatsApp Flow Components Enhancement

## Overview

This implementation plan enhances the existing WhatsApp Flow components system to achieve full compliance with Facebook Flow JSON version 7.3 specifications. The focus is on improving drag-and-drop JSON consistency, completing property coverage, enhancing validation, and ensuring accurate JSON export.

## Tasks

- [x] 1. Upgrade Flow JSON version and enhance validation engine
  - Update jsonBuilder.ts to use Flow JSON version 7.3
  - Implement comprehensive validation rules based on Facebook specifications
  - Add character limit validation for all text components
  - Add component count validation per screen
  - _Requirements: 4.1, 4.2, 10.1_

- [ ]* 1.1 Write property test for validation engine
  - **Property 4: Comprehensive Validation Enforcement**
  - **Validates: Requirements 4.1, 4.2, 10.1**

- [x] 2. Fix drag-and-drop JSON consistency
  - Enhance moveElement function in store.ts to immediately update JSON order
  - Add validateComponentOrder method to verify visual order matches JSON
  - Implement syncVisualOrderWithJSON for consistency checks
  - Update buildFlowJson to maintain exact element order from screens array
  - _Requirements: 2.1, 2.2, 2.3, 5.2_

- [ ]* 2.1 Write property test for drag-drop consistency
  - **Property 3: Drag-Drop JSON Consistency**
  - **Validates: Requirements 2.1, 2.2, 2.3, 5.2**

- [x] 3. Complete missing component properties
  - Add missing TextInput properties: label-variant, pattern, init-value, error-message
  - Add missing TextArea properties: label-variant, enabled, init-value, error-message
  - Add missing selection component properties: on-select-action, on-unselect-action, media-size
  - Add missing Footer properties: left-caption, center-caption, right-caption, enabled
  - Update TypeScript types in types.ts for all new properties
  - _Requirements: 3.1, 1.1, 1.2_

- [ ]* 3.1 Write property test for component property completeness
  - **Property 1: Component Property Specification Compliance**
  - **Validates: Requirements 1.1, 1.2**

- [x] 4. Enhance PropertyEditorInline with missing properties
  - Add property editors for all missing component properties
  - Implement appropriate input controls (text, dropdown, checkbox, array)
  - Add character counters for text properties with limits
  - Add dynamic data binding hints for all properties
  - Show real-time validation feedback with error indicators
  - _Requirements: 1.3, 7.2, 6.2_

- [ ]* 4.1 Write property test for property editor completeness
  - **Property 2: Property Editor Completeness**
  - **Validates: Requirements 1.3, 7.2**

- [x] 5. Implement missing component types
  - Add RichText component with full markdown support
  - Add If component with condition, then, else properties
  - Add Switch component with value and cases properties
  - Update Canvas.tsx preview rendering for new components
  - Update store.ts createDefaultElement for new component types
  - _Requirements: 8.1_

- [ ]* 5.1 Write unit test for RichText component implementation
  - Test markdown rendering capabilities
  - Test component creation and property handling
  - **Validates: Requirements 8.1**

- [x] 6. Enhance JSON export accuracy
  - Update buildFlowJson to use exact Facebook property names
  - Implement Flow JSON 7.3 version-specific features
  - Add proper data model schema generation for dynamic components
  - Ensure exported JSON validates against Facebook schema
  - Update component mapping to match Facebook specifications exactly
  - _Requirements: 5.1, 9.1_

- [ ]* 6.1 Write property test for JSON export accuracy
  - **Property 5: JSON Export Specification Accuracy**
  - **Validates: Requirements 5.1**

- [ ]* 6.2 Write property test for data model generation
  - **Property 7: Data Model Generation**
  - **Validates: Requirements 9.1**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Enhance preview system with validation feedback
  - Update Canvas.tsx to show validation errors visually
  - Add character limit violation indicators
  - Show hidden components with opacity and dashed borders
  - Display component count warnings when limits are approached
  - Add validation error tooltips and messages
  - _Requirements: 6.2_

- [ ]* 8.1 Write property test for visual validation feedback
  - **Property 6: Visual Validation Feedback**
  - **Validates: Requirements 6.2**

- [x] 9. Add help system and tooltips
  - Add tooltips to PropertyEditorInline for all component properties
  - Include constraint information and examples in tooltips
  - Add dynamic data binding syntax help
  - Provide character limit information in property labels
  - Add validation error explanations
  - _Requirements: 12.1_

- [ ]* 9.1 Write property test for help system completeness
  - **Property 8: Help System Completeness**
  - **Validates: Requirements 12.1**

- [x] 10. Integration and testing
  - Test drag-and-drop operations with complex flows
  - Verify JSON export with all component types
  - Test validation engine with edge cases
  - Ensure property editor works with all component properties
  - Test preview system accuracy with validation feedback
  - _Requirements: All_

- [ ]* 10.1 Write integration tests for complete system
  - Test end-to-end flow creation and export
  - Test drag-and-drop with validation
  - Test property editing with real-time feedback

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Focus on maintaining compatibility with existing codebase structure
- Target Flow JSON version 7.3 with Data API version 4.0 for latest features