/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RATINGS_API_URL?: string
  /** AdSense 디스플레이 슬롯 ID (없으면 auto format만 시도) */
  readonly VITE_ADSENSE_SLOT?: string
  /** 카카오페이 송금 링크 (없으면 기본값 사용) */
  readonly VITE_KAKAOPAY_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
