// LocalStorage key constants and type mapping
// These must match EXACTLY the keys used by the original vanilla JS app

export const STORAGE_KEYS = {
  SYSTEM_CONFIG: 'system_config',
  KIDS_DATA: 'kids_data',
  REWARDS_POOL: 'rewards_pool',
  REASONS_POOL: 'reasons_pool',
  DEDUCT_REASONS_POOL: 'deduct_reasons_pool',
  CURRENT_KID_ID: 'current_kid_id'
} as const

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]

// Type mapping for each storage key
export interface StorageTypeMap {
  system_config: import('./config').SystemConfig
  kids_data: import('./kid').Kid[]
  rewards_pool: import('./reward').Reward[]
  reasons_pool: import('./reason').AddReason[]
  deduct_reasons_pool: import('./reason').DeductReason[]
  current_kid_id: number
}