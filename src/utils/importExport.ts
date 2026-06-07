// Data export/import utility
// Matches the existing localStorage format for backward compatibility

import { loadFromStorage, saveToStorage } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import type { Kid } from '@/types/kid'
import type { Reward } from '@/types/reward'
import type { AddReason, DeductReason } from '@/types/reason'
import type { SystemConfig } from '@/types/config'
import { EXCHANGE_RATE as DEFAULT_EXCHANGE_RATE } from '@/utils/localStorageSync'

export interface ExportData {
  kids_data: Kid[]
  rewards_pool: Reward[]
  reasons_pool: AddReason[]
  deduct_reasons_pool: DeductReason[]
  system_config: SystemConfig
  current_kid_id: number
  custom_quotes: string[]
  export_version: string
  export_date: string
}

const EXPORT_VERSION = '1.0.10'

export function exportAllData(): ExportData {
  const kidsData = loadFromStorage(STORAGE_KEYS.KIDS_DATA) || []
  const rewardsPool = loadFromStorage(STORAGE_KEYS.REWARDS_POOL) || []
  const reasonsPool = loadFromStorage(STORAGE_KEYS.REASONS_POOL) || []
  const deductReasons = loadFromStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL) || []
  const systemConfig = loadFromStorage(STORAGE_KEYS.SYSTEM_CONFIG)
  const currentKidId = loadFromStorage(STORAGE_KEYS.CURRENT_KID_ID) || 1
  const customQuotes = loadFromStorage(STORAGE_KEYS.CUSTOM_QUOTES) || []

  // Ensure systemConfig has all required fields
  const defaultConfig: SystemConfig = {
    exchangeRate: DEFAULT_EXCHANGE_RATE,
    backgroundMode: 'carousel',
    backgroundStyle: 'cover',
    backgroundPhotos: [],
    currentPhotoIndex: 0,
    password: '',
    customRiddles: [],
    exchangeOptions: [],
    customQuotes: [],
    riddleAnswerDelay: 5
  }

  const exportedConfig: SystemConfig = systemConfig
    ? { ...defaultConfig, ...systemConfig }
    : defaultConfig

  return {
    kids_data: kidsData,
    rewards_pool: rewardsPool,
    reasons_pool: reasonsPool,
    deduct_reasons_pool: deductReasons,
    system_config: exportedConfig,
    current_kid_id: currentKidId,
    custom_quotes: customQuotes,
    export_version: EXPORT_VERSION,
    export_date: new Date().toISOString()
  }
}

export function importAllData(data: ExportData): boolean {
  // Validate data structure
  if (!data.kids_data || !Array.isArray(data.kids_data)) return false
  if (!data.rewards_pool || !Array.isArray(data.rewards_pool)) return false
  if (!data.system_config) return false

  // Ensure minimum kids count (at least 2)
  if (data.kids_data.length < 2) return false

  // Compatibility: ensure each kid has exchangeHistory
  data.kids_data.forEach(kid => {
    if (!kid.exchangeHistory) kid.exchangeHistory = []
  })

  // Ensure each reason has category
  if (data.reasons_pool) {
    data.reasons_pool.forEach(reason => {
      if (!reason.category) reason.category = '其他'
    })
  }

  // Save all data
  saveToStorage(STORAGE_KEYS.KIDS_DATA, data.kids_data)
  saveToStorage(STORAGE_KEYS.REWARDS_POOL, data.rewards_pool)
  saveToStorage(STORAGE_KEYS.REASONS_POOL, data.reasons_pool || [])
  saveToStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL, data.deduct_reasons_pool || [])
  saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, data.system_config)
  saveToStorage(STORAGE_KEYS.CURRENT_KID_ID, data.current_kid_id || 1)
  saveToStorage(STORAGE_KEYS.CUSTOM_QUOTES, data.custom_quotes || [])

  return true
}

export function generateExportFilename(): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return `domibeta_data_${dateStr}.json`
}

export function downloadExportFile(data: ExportData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = generateExportFilename()
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as ExportData
        resolve(data)
      } catch {
        reject(new Error('文件格式错误，无法解析'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}