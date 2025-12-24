# Requirements Document

## Introduction

This specification defines the requirements for enhancing the existing WhatsApp Flow components system to fully align with official Facebook/Meta WhatsApp Flow specifications. The system currently supports most component types but needs improvements in validation, JSON export accuracy, drag-and-drop positioning, and complete property coverage as defined in the Facebook WhatsApp Flows documentation.

## Glossary

- **Flow_Builder**: The visual interface for creating WhatsApp Flows
- **Component**: A UI element that can be added to a Flow screen (e.g., TextInput, Image, Footer)
- **Screen**: A single page within a Flow containing multiple components
- **Dynamic_Data**: Data that can be bound to component properties using ${data.field} syntax
- **Property_Editor**: The interface for editing component properties and constraints
- **Flow_JSON**: The JSON format specification for WhatsApp Flows
- **Validation_Engine**: System that enforces component constraints and limits
- **Preview_System**: Real-time preview of how components will appear in WhatsApp

## Requirements

### Requirement 1: Text Component Implementation

**User Story:** As a flow designer, I want to use all text components (Heading, Subheading, Body, Caption, RichText) with their complete specifications, so that I can create properly formatted text content that meets WhatsApp's requirements.

#### Acceptance Criteria

1. WHEN a user adds a TextHeading component, THE Flow_Builder SHALL create a component with text property and visible property with default value true
2. WHEN a user adds a TextSubheading component, THE Flow_Builder SHALL create a component with text property and visible property with default value true
3. WHEN a user adds a TextBody component, THE Flow_Builder SHALL create a component with text, font-weight, strikethrough, visible, and markdown properties
4. WHEN a user adds a TextCaption component, THE Flow_Builder SHALL create a component with text, font-weight, strikethrough, visible, and markdown properties with 400 character limit
5. WHEN a user adds a RichText component, THE Flow_Builder SHALL create a component supporting full markdown syntax including headings, lists, tables, images, and links
6. THE Validation_Engine SHALL enforce character limits: Heading (80), Subheading (80), Body (4096), Caption (400)
7. WHEN text exceeds character limits, THE Property_Editor SHALL display warning indicators and prevent saving
8. THE Property_Editor SHALL provide dynamic data binding hints for all text properties using ${data.field} syntax

### Requirement 2: Input Component Implementation

**User Story:** As a flow designer, I want to use all input components (TextInput, TextArea, EmailInput, PasswordInput, PhoneInput) with validation and constraints, so that I can collect user data with proper validation.

#### Acceptance Criteria

1. WHEN a user adds a TextInput component, THE Flow_Builder SHALL create a component with label, name, input-type, pattern, required, min-chars, max-chars, helper-text, and visible properties
2. WHEN a user adds a TextArea component, THE Flow_Builder SHALL create a component with label, name, required, max-length, helper-text, enabled, and visible properties
3. WHEN a user adds specialized input components, THE Flow_Builder SHALL create components with appropriate validation for email, password, and phone formats
4. THE Validation_Engine SHALL enforce input-type constraints and pattern validation using regex
5. THE Property_Editor SHALL provide input-type options: text, number, email, password, passcode, phone
6. WHEN pattern validation is specified, THE Property_Editor SHALL require helper-text to be mandatory
7. THE Validation_Engine SHALL enforce character limits: TextInput helper-text (80), label (20), TextArea helper-text (80), label (20)

### Requirement 3: Selection Component Implementation

**User Story:** As a flow designer, I want to use selection components (CheckboxGroup, RadioButtonsGroup, Dropdown, ChipsSelector, OptIn) with dynamic data sources, so that I can create interactive selection interfaces.

#### Acceptance Criteria

1. WHEN a user adds a CheckboxGroup component, THE Flow_Builder SHALL create a component with data-source, name, min-selected-items, max-selected-items, enabled, label, required, visible, and description properties
2. WHEN a user adds a RadioButtonsGroup component, THE Flow_Builder SHALL create a component with data-source, name, enabled, label, required, visible, and description properties
3. WHEN a user adds a Dropdown component, THE Flow_Builder SHALL create a component with label, data-source, required, enabled, visible properties
4. WHEN a user adds a ChipsSelector component, THE Flow_Builder SHALL create a component with data-source, name, min-selected-items, max-selected-items, enabled, label, required, visible, description properties
5. WHEN a user adds an OptIn component, THE Flow_Builder SHALL create a component with label, required, name, visible properties
6. THE Validation_Engine SHALL enforce selection limits: CheckboxGroup/RadioButtonsGroup (1-20 options), Dropdown (1-200 options), ChipsSelector (2-20 options)
7. THE Property_Editor SHALL support both static and dynamic data-source configuration
8. THE Validation_Engine SHALL enforce content limits: label (30 chars), title (30 chars), description (300 chars), metadata (20 chars)

### Requirement 4: Date Component Implementation

**User Story:** As a flow designer, I want to use date components (DatePicker, CalendarPicker) with proper date handling and timezone support, so that I can collect date information reliably.

#### Acceptance Criteria

1. WHEN a user adds a DatePicker component, THE Flow_Builder SHALL create a component with label, min-date, max-date, name, unavailable-dates, visible, helper-text, enabled properties
2. WHEN a user adds a CalendarPicker component, THE Flow_Builder SHALL create a component with name, title, description, label, helper-text, required, visible, enabled, mode, min-date, max-date, unavailable-dates, include-days, min-days, max-days properties
3. THE Validation_Engine SHALL use YYYY-MM-DD format for all date values (Flow JSON 5.0+)
4. THE Property_Editor SHALL provide mode selection for CalendarPicker: single or range
5. THE Validation_Engine SHALL enforce character limits: DatePicker label (40), helper-text (80), CalendarPicker title (80), description (300), label (40), helper-text (80)
6. WHEN CalendarPicker mode is range, THE Property_Editor SHALL support start-date and end-date configuration format

### Requirement 5: Media Component Implementation

**User Story:** As a flow designer, I want to use media components (Image, ImageCarousel, PhotoPicker, DocumentPicker) with proper file handling and constraints, so that I can incorporate visual content and file uploads.

#### Acceptance Criteria

1. WHEN a user adds an Image component, THE Flow_Builder SHALL create a component with src, width, height, scale-type, aspect-ratio, alt-text properties
2. WHEN a user adds an ImageCarousel component, THE Flow_Builder SHALL create a component with images array, aspect-ratio, scale-type properties
3. WHEN a user adds a PhotoPicker component, THE Flow_Builder SHALL create a component with name, label, description, photo-source, max-file-size-kb, min-uploaded-photos, max-uploaded-photos, enabled, visible properties
4. WHEN a user adds a DocumentPicker component, THE Flow_Builder SHALL create a component with name, label, description, max-file-size-kb, min-uploaded-documents, max-uploaded-documents, allowed-mime-types, enabled, visible properties
5. THE Validation_Engine SHALL enforce image limits: max 3 images per screen, recommended size 300KB, supported formats JPEG/PNG
6. THE Validation_Engine SHALL enforce carousel limits: 1-3 images per carousel, max 2 carousels per screen, max 3 carousels per flow
7. THE Property_Editor SHALL provide scale-type options: cover, contain
8. THE Property_Editor SHALL provide photo-source options: camera_gallery, camera, gallery

### Requirement 6: Navigation Component Implementation

**User Story:** As a flow designer, I want to use navigation components (Footer, NavigationList, EmbeddedLink) with proper action handling, so that I can create interactive navigation flows.

#### Acceptance Criteria

1. WHEN a user adds a Footer component, THE Flow_Builder SHALL create a component with label, left-caption, center-caption, right-caption, enabled, on-click-action properties
2. WHEN a user adds a NavigationList component, THE Flow_Builder SHALL create a component with name, list-items, label, description, media-size, on-click-action properties
3. WHEN a user adds an EmbeddedLink component, THE Flow_Builder SHALL create a component with text, on-click-action, visible properties
4. THE Validation_Engine SHALL enforce Footer caption constraints: label (35 chars), captions (15 chars)
5. THE Validation_Engine SHALL enforce NavigationList limits: 1-20 list items, label (80 chars), description (300 chars)
6. THE Validation_Engine SHALL enforce EmbeddedLink limits: text (25 chars), max 2 links per screen
7. THE Property_Editor SHALL provide action types: data_exchange, navigate, complete, open_url (Flow JSON 6.0+)

### Requirement 7: Conditional Component Implementation

**User Story:** As a flow designer, I want to use conditional components (If, Switch) with boolean expressions, so that I can create dynamic flows based on user data and selections.

#### Acceptance Criteria

1. WHEN a user adds an If component, THE Flow_Builder SHALL create a component with condition, then, else properties
2. WHEN a user adds a Switch component, THE Flow_Builder SHALL create a component with value, cases properties
3. THE Validation_Engine SHALL support boolean expressions with operators: ==, !=, &&, ||, !, >, >=, <, <=, ()
4. THE Validation_Engine SHALL allow nesting up to 3 If components
5. THE Validation_Engine SHALL require Footer components in both then and else branches when present
6. THE Property_Editor SHALL provide expression builder for condition syntax
7. THE Validation_Engine SHALL validate that Switch cases property is not empty

### Requirement 8: Dynamic Data Binding System

**User Story:** As a flow designer, I want to bind dynamic data to component properties using ${data.field} syntax, so that I can create data-driven flows that respond to server data.

#### Acceptance Criteria

1. THE Property_Editor SHALL display dynamic data binding hints for all supported properties
2. WHEN a user enters ${data.field} syntax, THE Validation_Engine SHALL validate the syntax format
3. THE Preview_System SHALL support mock data display using __example__ fields
4. THE Flow_Builder SHALL generate proper data model schemas for server integration
5. THE Property_Editor SHALL provide autocomplete suggestions for available data fields
6. THE Validation_Engine SHALL validate that dynamic references match declared data model properties

### Requirement 9: Component Validation and Constraints

**User Story:** As a flow designer, I want comprehensive validation of all component constraints and limits, so that my flows will work correctly in WhatsApp without errors.

#### Acceptance Criteria

1. THE Validation_Engine SHALL enforce all character limits as specified in Facebook documentation
2. THE Validation_Engine SHALL enforce component count limits per screen and per flow
3. THE Validation_Engine SHALL validate required properties for all component types
4. THE Validation_Engine SHALL prevent saving invalid configurations
5. THE Property_Editor SHALL display real-time validation feedback with specific error messages
6. THE Validation_Engine SHALL validate file size limits for media components
7. THE Validation_Engine SHALL enforce Flow JSON version compatibility requirements

### Requirement 10: Flow JSON Export and Compatibility

**User Story:** As a flow designer, I want to export flows in valid Flow JSON format with proper versioning, so that my flows can be deployed to WhatsApp Business API.

#### Acceptance Criteria

1. THE Flow_Builder SHALL generate valid Flow JSON conforming to Facebook specifications
2. THE Export_System SHALL support multiple Flow JSON versions (4.0, 5.0, 5.1, 6.0, 7.0, 7.1)
3. THE Export_System SHALL include proper version-specific feature compatibility
4. THE Export_System SHALL generate complete data model schemas with __example__ fields
5. THE Validation_Engine SHALL validate exported JSON against Flow JSON schema
6. THE Export_System SHALL handle version-specific property names and formats correctly

### Requirement 11: Component Property Editor Enhancement

**User Story:** As a flow designer, I want an enhanced property editor that supports all component properties with proper validation and hints, so that I can configure components efficiently and correctly.

#### Acceptance Criteria

1. THE Property_Editor SHALL display all properties for each component type as specified in documentation
2. THE Property_Editor SHALL provide appropriate input controls for each property type (text, number, boolean, enum, array)
3. THE Property_Editor SHALL show character counters for text properties with limits
4. THE Property_Editor SHALL provide enum dropdowns for properties with fixed value sets
5. THE Property_Editor SHALL support array editing for properties like data-source and list-items
6. THE Property_Editor SHALL display dynamic data binding examples and syntax help
7. THE Property_Editor SHALL show real-time validation errors and warnings

### Requirement 12: Preview System Enhancement

**User Story:** As a flow designer, I want an accurate preview system that shows how components will appear in WhatsApp, so that I can verify the visual appearance and behavior of my flows.

#### Acceptance Criteria

1. THE Preview_System SHALL render all component types accurately matching WhatsApp appearance
2. THE Preview_System SHALL display validation errors and warnings visually
3. THE Preview_System SHALL show character limit violations with visual indicators
4. THE Preview_System SHALL support mock data preview for dynamic components
5. THE Preview_System SHALL display hidden components with appropriate visual indicators
6. THE Preview_System SHALL show component hierarchy and nesting for conditional components
7. THE Preview_System SHALL provide responsive preview for different screen sizes