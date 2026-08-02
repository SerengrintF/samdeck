/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RATINGS_API_URL?: string
  /** AdSense 디스플레이 슬롯 ID (없으면 auto format만 시도) */
  readonly VITE_ADSENSE_SLOT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
