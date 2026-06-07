import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAllData, importAllData, generateExportFilename } from '@/utils/importExport'
import type { ExportData } from '@/utils/importExport'

let mockStorage: Record<string, string> = {}

beforeEach(() => {
  mockStorage = {}
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
  })
})

// __APP_VERSION__ is injected by Vite (see vite.config.ts). Fall back to
// package.json for environments that don't run the define.
declare const __APP_VERSION__: string | undefined

function makeValidData(overrides: Partial<ExportData> = {}): ExportData {
  return {
    kids_data: [
      { id: 1, name: 'Dommy', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] },
      { id: 2, name: 'Betta', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] }
    ],
    rewards_pool: [{ id: 1, name: '冰淇淋', weight: 30, icon: '🍦' }],
    reasons_pool: [],
    deduct_reasons_pool: [],
    system_config: { exchangeRate: 1000, backgroundMode: 'carousel', backgroundStyle: 'cover', backgroundPhotos: [], currentPhotoIndex: 0, password: '', customRiddles: [], exchangeOptions: [], customQuotes: [] },
    current_kid_id: 1,
    export_version: __APP_VERSION__ ?? '1.0.22',
    export_date: new Date().toISOString(),
    ...overrides
  }
}

describe('importExport', () => {
  it('exportAllData includes all storage keys', () => {
    // Populate mock storage with data
    mockStorage['kids_data'] = JSON.stringify([{ id: 1, name: 'Dommy', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] }])
    mockStorage['rewards_pool'] = JSON.stringify([{ id: 1, name: '冰淇淋', weight: 30, icon: '🍦' }])
    mockStorage['system_config'] = JSON.stringify({ exchangeRate: 1000, backgroundMode: 'carousel', backgroundStyle: 'cover', backgroundPhotos: [], currentPhotoIndex: 0, password: '', customRiddles: [], exchangeOptions: [], customQuotes: [] })
    mockStorage['current_kid_id'] = '1'

    const data = exportAllData()
    expect(data.kids_data).toBeDefined()
    expect(data.rewards_pool).toBeDefined()
    expect(data.system_config).toBeDefined()
    // Should match package.json version, not a hardcoded string
    expect(data.export_version).toBe(__APP_VERSION__)
  })

  it('importAllData validates data structure', () => {
    const result = importAllData(makeValidData())
    expect(result).toBe(true)
  })

  it('importAllData rejects invalid data (less than 2 kids)', () => {
    const invalidData = makeValidData({
      kids_data: [{ id: 1, name: 'OnlyOne' }] as any,
      current_kid_id: 1
    })
    const result = importAllData(invalidData)
    expect(result).toBe(false)
  })

  it('importAllData rejects missing kids_data', () => {
    const invalidData = {
      rewards_pool: [],
      system_config: {}
    } as any
    const result = importAllData(invalidData)
    expect(result).toBe(false)
  })

  it('importAllData backfills missing history arrays on kids', () => {
    // Regression: HarmonyOS 6.1 / Huawei Browser 6.1.5.301 — imported data
    // without pointsHistory/drawHistory crashed ActivityList and hid
    // "活动记录" + "查看历史记录". The import must backfill all three arrays.
    const data: ExportData = {
      kids_data: [
        { id: 1, name: 'Dommy', totalPoints: 0, drawChances: 0, exchangeHistory: [] } as any,
        { id: 2, name: 'Betta', totalPoints: 0, drawChances: 0, exchangeHistory: [] } as any
      ],
      rewards_pool: [],
      reasons_pool: [],
      deduct_reasons_pool: [],
      system_config: { exchangeRate: 1000, backgroundMode: 'carousel', backgroundStyle: 'cover', backgroundPhotos: [], currentPhotoIndex: 0, password: '', customRiddles: [], exchangeOptions: [], customQuotes: [] },
      current_kid_id: 1,
      export_version: '1.0.22',
      export_date: ''
    }

    expect(importAllData(data)).toBe(true)
    expect(data.kids_data[0].pointsHistory).toEqual([])
    expect(data.kids_data[0].drawHistory).toEqual([])
    expect(data.kids_data[0].exchangeHistory).toEqual([])
    expect(data.kids_data[1].pointsHistory).toEqual([])
    expect(data.kids_data[1].drawHistory).toEqual([])
    expect(data.kids_data[1].exchangeHistory).toEqual([])
  })

  it('importAllData preserves existing non-empty history arrays', () => {
    const data = makeValidData({
      kids_data: [
        {
          id: 1, name: 'Dommy', totalPoints: 50, drawChances: 0,
          pointsHistory: [{ date: '2026-01-01T00:00:00.000Z', points: 50, reason: 'test' }],
          drawHistory: [], exchangeHistory: []
        },
        { id: 2, name: 'Betta', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] }
      ]
    })

    expect(importAllData(data)).toBe(true)
    expect(data.kids_data[0].pointsHistory).toHaveLength(1)
    expect(data.kids_data[0].pointsHistory[0].reason).toBe('test')
  })

  it('importAllData auto-corrects current_kid_id pointing to nonexistent kid', () => {
    // Defensive: if a hand-edited or migrated export references a kid that
    // no longer exists, the import must fall back to the first kid rather
    // than leave currentKid undefined and break the UI.
    const data = makeValidData({ current_kid_id: 999 })
    expect(importAllData(data)).toBe(true)
    expect(data.current_kid_id).toBe(1)
  })

  it('importAllData preserves valid current_kid_id', () => {
    const data = makeValidData({ current_kid_id: 2 })
    expect(importAllData(data)).toBe(true)
    expect(data.current_kid_id).toBe(2)
  })

  it('generateExportFilename includes date', () => {
    const filename = generateExportFilename()
    expect(filename).toContain('domibeta_data_')
    expect(filename).toContain('.json')
  })
})
