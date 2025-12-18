export type ElementType = 
  | 'TextHeading' | 'TextSubheading' | 'TextBody' | 'TextCaption'
  | 'RichText'
  | 'TextInput' | 'EmailInput' | 'PasswordInput' | 'PhoneInput' | 'TextArea'
  | 'CheckboxGroup' | 'RadioButtonsGroup' | 'ChipsSelector'
  | 'Dropdown' | 'OptIn' | 'EmbeddedLink'
  | 'DatePicker' | 'CalendarPicker'
  | 'Image' | 'ImageCarousel' | 'PhotoPicker' | 'DocumentPicker'
  | 'NavigationList'
  | 'Footer'

export type BaseElement = {
  id: string
  type: ElementType
}

export type TextHeadingEl = BaseElement & {
  type: 'TextHeading'
  text: string
  visible?: boolean
}

export type TextSubheadingEl = BaseElement & {
  type: 'TextSubheading'
  text: string
  visible?: boolean
}

export type TextBodyEl = BaseElement & {
  type: 'TextBody'
  text: string
  fontWeight?: 'normal' | 'bold'
  strikethrough?: boolean
  visible?: boolean
  markdown?: boolean
}

export type TextCaptionEl = BaseElement & {
  type: 'TextCaption'
  text: string
  fontWeight?: 'normal' | 'bold'
  strikethrough?: boolean
  visible?: boolean
  markdown?: boolean
}

export type RichTextEl = BaseElement & {
  type: 'RichText'
  text: string
  visible?: boolean
}

export type TextInputEl = BaseElement & {
  type: 'TextInput'
  label: string
  name: string
  required?: boolean
  inputType?: 'text' | 'number' | 'email' | 'password' | 'passcode' | 'phone'
  pattern?: string
  helperText?: string
  minChars?: number
  maxChars?: number
}

export type EmailInputEl = BaseElement & {
  type: 'EmailInput'
  label: string
  name: string
  required?: boolean
  helperText?: string
}

export type PasswordInputEl = BaseElement & {
  type: 'PasswordInput'
  label: string
  name: string
  required?: boolean
  helperText?: string
  minChars?: number
  maxChars?: number
}

export type PhoneInputEl = BaseElement & {
  type: 'PhoneInput'
  label: string
  name: string
  required?: boolean
  helperText?: string
}

export type RadioButtonsGroupEl = BaseElement & {
  type: 'RadioButtonsGroup'
  label: string
  name: string
  required?: boolean
  options: { id: string; title: string }[]
}

export type TextAreaEl = BaseElement & {
  type: 'TextArea'
  label: string
  name: string
  required?: boolean
  maxLength?: number
  helperText?: string
}

export type DropdownEl = BaseElement & {
  type: 'Dropdown'
  label: string
  name: string
  required?: boolean
  options: { id: string; title: string }[]
}

export type FooterEl = BaseElement & {
  type: 'Footer'
  label: string
  action: 'navigate' | 'complete'
  nextScreen?: string
  payloadKeys: string[] // keys from current + previous screens
}

export type CheckboxGroupEl = BaseElement & {
  type: 'CheckboxGroup'
  label: string
  name: string
  required?: boolean
  dataSource: { id: string; title: string }[]
  minSelectedItems?: number
  maxSelectedItems?: number
  enabled?: boolean
  visible?: boolean
  description?: string
}

export type OptInEl = BaseElement & {
  type: 'OptIn'
  label: string
  name: string
  required?: boolean
  visible?: boolean
}

export type EmbeddedLinkEl = BaseElement & {
  type: 'EmbeddedLink'
  text: string
  url?: string
  visible?: boolean
}

export type DatePickerEl = BaseElement & {
  type: 'DatePicker'
  label: string
  name: string
  minDate?: string
  maxDate?: string
  unavailableDates?: string[]
  visible?: boolean
  helperText?: string
  enabled?: boolean
  required?: boolean
}

export type CalendarPickerEl = BaseElement & {
  type: 'CalendarPicker'
  name: string
  title?: string
  description?: string
  label: string
  helperText?: string
  required?: boolean
  visible?: boolean
  enabled?: boolean
  mode?: 'single' | 'range'
  minDate?: string
  maxDate?: string
  unavailableDates?: string[]
}

export type ImageEl = BaseElement & {
  type: 'Image'
  src: string
  width?: number
  height?: number
  scaleType?: 'cover' | 'contain'
  aspectRatio?: string
  altText?: string
}

export type ChipsSelectorEl = BaseElement & {
  type: 'ChipsSelector'
  label: string
  name: string
  required?: boolean
  dataSource: { id: string; title: string }[]
  minSelectedItems?: number
  maxSelectedItems?: number
  enabled?: boolean
  visible?: boolean
  description?: string
}

export type NavigationListEl = BaseElement & {
  type: 'NavigationList'
  name: string
  label?: string
  description?: string
  listItems: {
    id: string
    mainContent: {
      title: string
      description?: string
      metadata?: string
    }
    start?: {
      image: string
      altText?: string
    }
    end?: {
      title?: string
      description?: string
      metadata?: string
    }
    nextScreen?: string
    payload?: Record<string, any>
  }[]
}

export type ImageCarouselEl = BaseElement & {
  type: 'ImageCarousel'
  images: {
    src: string
    altText?: string
  }[]
  aspectRatio?: string
  scaleType?: 'cover' | 'contain'
}

export type PhotoPickerEl = BaseElement & {
  type: 'PhotoPicker'
  name: string
  label: string
  description?: string
  photoSource?: 'camera_gallery' | 'camera' | 'gallery'
  maxFileSizeKb?: number
  minUploadedPhotos?: number
  maxUploadedPhotos?: number
  enabled?: boolean
  visible?: boolean
  errorMessage?: string | Record<string, string>
}

export type DocumentPickerEl = BaseElement & {
  type: 'DocumentPicker'
  name: string
  label: string
  description?: string
  maxFileSizeKb?: number
  minUploadedDocuments?: number
  maxUploadedDocuments?: number
  allowedMimeTypes?: string[]
  enabled?: boolean
  visible?: boolean
  errorMessage?: string | Record<string, string>
}

export type AnyElement = 
  | TextHeadingEl | TextSubheadingEl | TextBodyEl | TextCaptionEl | RichTextEl
  | TextInputEl | EmailInputEl | PasswordInputEl | PhoneInputEl | TextAreaEl
  | CheckboxGroupEl | RadioButtonsGroupEl | ChipsSelectorEl
  | DropdownEl | OptInEl | EmbeddedLinkEl
  | DatePickerEl | CalendarPickerEl
  | ImageEl | ImageCarouselEl | PhotoPickerEl | DocumentPickerEl | NavigationListEl
  | FooterEl

export type Screen = {
  id: string
  title: string
  terminal?: boolean
  success?: boolean
  elements: AnyElement[]
}

// Message & Trigger Library Types
export type MessageType = 'standard_text' | 'interactive_button' | 'interactive_list' | 'flow_starter'
export type MessageStatus = 'draft' | 'published'
export type TriggerType = 'keyword_match' | 'api_call' | 'flow_response'
export type NextAction = 'send_message' | 'start_flow'

export type InteractiveButton = {
  id: string
  title: string
  buttonId: string
}

export type ListSection = {
  title: string
  rows: ListRow[]
}

export type ListRow = {
  id: string
  title: string
  rowId: string
  description?: string
}

export type StandardTextContent = {
  body: string
}

export type InteractiveButtonContent = {
  header?: string
  body: string
  footer?: string
  buttons: InteractiveButton[]
}

export type InteractiveListContent = {
  header?: string
  body: string
  footer?: string
  buttonText: string
  sections: ListSection[]
}

export type FlowStarterContent = {
  flowId: string
  message: string
}

export type MessageContentPayload = 
  | StandardTextContent 
  | InteractiveButtonContent 
  | InteractiveListContent 
  | FlowStarterContent

export type MessageLibraryEntry = {
  messageId: string
  name: string
  type: MessageType
  contentPayload: MessageContentPayload
  status: MessageStatus
  createdAt: Date
  updatedAt: Date
}

export type TriggerConfiguration = {
  triggerId: string
  triggerType: TriggerType
  triggerValue: string | string[]
  nextAction: NextAction
  targetId: string
  messageId: string
  createdAt: Date
  updatedAt: Date
}
