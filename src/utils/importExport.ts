// Data export/import utility
// Matches the existing localStorage format for backward compatibility

import { loadFromStorage, saveToStorage } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import type { Kid, ExchangeHistoryItem, DrawHistoryItem, PointsHistoryItem } from '@/types/kid'
import type { Reward } from '@/types/reward'
import type { AddReason, DeductReason } from '@/types/reason'
import type { SystemConfig } from '@/types/config'
import { EXCHANGE_RATE as DEFAULT_EXCHANGE_RATE } from '@/utils/localStorageSync'

// Legacy data may have fields from old versions, e.g. ExchangeHistoryItem with
// `name` instead of `optionName`, missing `note`, `totalPoints`, `id`, etc.
// These functions fill missing fields with sensible defaults.
function sanitizeExchangeHistoryItem(item: Partial<ExchangeHistoryItem>): ExchangeHistoryItem {
  const points = item.points ?? 0
  const absPoints = Math.abs(points)
  const legacyName = (item as any).name || ''
  return {
    id: item.id ?? Date.now(),
    exchangeOptionId: item.exchangeOptionId ?? 0,
    optionName: item.optionName || legacyName || item.reason || '',
    points,
    pointsConsumed: item.pointsConsumed ?? absPoints,
    quantity: item.quantity ?? 1,
    totalPoints: item.totalPoints ?? absPoints,
    date: item.date || new Date().toISOString(),
    category: item.category || 'item',
    note: item.note || item.reason || legacyName || '',
    reason: item.reason || legacyName || '',
    icon: item.icon || '🎁',
    edited: item.edited,
    editCount: item.editCount,
    lastEditTime: item.lastEditTime
  }
}

function sanitizeDrawHistoryItem(item: Partial<DrawHistoryItem>): DrawHistoryItem {
  return {
    date: item.date || new Date().toISOString(),
    reward: item.reward || '',
    points: item.points ?? -(item.pointsUsed ?? 0),
    pointsUsed: item.pointsUsed ?? Math.abs(item.points ?? 0),
    reason: item.reason || item.reward || '',
    icon: item.icon || '🎰',
    edited: item.edited,
    editCount: item.editCount,
    lastEditTime: item.lastEditTime
  }
}

function sanitizePointsHistoryItem(item: Partial<PointsHistoryItem>): PointsHistoryItem {
  return {
    date: item.date || new Date().toISOString(),
    points: item.points ?? 0,
    reason: item.reason || '',
    icon: item.icon,
    edited: item.edited,
    editCount: item.editCount,
    lastEditTime: item.lastEditTime
  }
}

export function sanitizeKidsData(kids: Kid[]): Kid[] {
  return kids.map(kid => ({
    ...kid,
    pointsHistory: (kid.pointsHistory || []).map(sanitizePointsHistoryItem),
    drawHistory: (kid.drawHistory || []).map(sanitizeDrawHistoryItem),
    exchangeHistory: (kid.exchangeHistory || []).map(sanitizeExchangeHistoryItem)
  }))
}

export interface ExportData {
  kids_data: Kid[]
  rewards_pool: Reward[]
  reasons_pool: AddReason[]
  deduct_reasons_pool: DeductReason[]
  system_config: SystemConfig
  current_kid_id: number
  export_version: string
  export_date: string
}

// Keep export version in sync with package.json so future migration logic
// (if any) can reason about the data shape accurately.
declare const __APP_VERSION__: string
const EXPORT_VERSION = __APP_VERSION__

export function exportAllData(): ExportData {
  const rawKidsData = loadFromStorage(STORAGE_KEYS.KIDS_DATA) || []
  const kidsData = sanitizeKidsData(rawKidsData)
  const rewardsPool = loadFromStorage(STORAGE_KEYS.REWARDS_POOL) || []
  const reasonsPool = loadFromStorage(STORAGE_KEYS.REASONS_POOL) || []
  const deductReasons = loadFromStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL) || []
  const systemConfig = loadFromStorage(STORAGE_KEYS.SYSTEM_CONFIG)
  const currentKidId = loadFromStorage(STORAGE_KEYS.CURRENT_KID_ID) || 1

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

  // Compatibility: ensure each kid has all history arrays.
  // Bug fix (HarmonyOS 6.1): importing data without these fields caused
  // ActivityList to throw on first render, hiding the "活动记录" heading
  // and "查看历史记录" button entirely on Huawei Browser 6.1.5.301.
  data.kids_data.forEach(kid => {
    if (!kid.pointsHistory) kid.pointsHistory = []
    if (!kid.drawHistory) kid.drawHistory = []
    if (!kid.exchangeHistory) kid.exchangeHistory = []
  })

  // Sanitize: normalize legacy/malformed history items (missing fields, old field names)
  data.kids_data = sanitizeKidsData(data.kids_data)

  // Defensive: current_kid_id must reference an existing kid. If the export
  // file was hand-edited or produced by an older/different version, the id
  // may not exist in kids_data — falling back keeps the UI consistent
  // (currentKid getter would otherwise return undefined and break the page).
  if (data.current_kid_id !== undefined && data.current_kid_id !== null) {
    const kidExists = data.kids_data.some(k => k.id === data.current_kid_id)
    if (!kidExists) {
      data.current_kid_id = data.kids_data[0].id
    }
  }

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