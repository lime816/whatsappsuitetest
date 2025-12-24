/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP_ACCESS_TOKEN: string
  readonly VITE_WHATSAPP_PHONE_NUMBER_ID: string
  readonly VITE_WHATSAPP_BUSINESS_ACCOUNT_ID: string
  readonly VITE_WHATSAPP_API_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
