// System config - mirrors localStorage 'system_config'

import type { ExchangeOption } from './exchange'

export interface Riddle {
  q: string
  a: string
}

export interface SystemConfig {
  exchangeRate: number
  backgroundMode: string // 'carousel' | 'photo'
  backgroundStyle: string // 'cover' | 'contain' | etc.
  backgroundPhotos: string[] // base64-encoded photo data URLs
  currentPhotoIndex: number
  password: string
  customRiddles: Riddle[]
  exchangeOptions: ExchangeOption[]
  customQuotes: string[]
}

// Re-export ExchangeOption for convenience
export type { ExchangeOption } from './exchange'