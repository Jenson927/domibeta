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
    expect(data.export_version).toBe('1.0.10')
  })

  it('importAllData validates data structure', () => {
    const validData: ExportData = {
      kids_data: [{ id: 1, name: 'Dommy', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] }, { id: 2, name: 'Betta', totalPoints: 0, drawChances: 0, pointsHistory: [], drawHistory: [], exchangeHistory: [] }],
      rewards_pool: [{ id: 1, name: '冰淇淋', weight: 30, icon: '🍦' }],
      reasons_pool: [],
      deduct_reasons_pool: [],
      system_config: { exchangeRate: 1000, backgroundMode: 'carousel', backgroundStyle: 'cover', backgroundPhotos: [], currentPhotoIndex: 0, password: '', customRiddles: [], exchangeOptions: [], customQuotes: [] },
      current_kid_id: 1,
      custom_quotes: [],
      export_version: '1.0.10',
      export_date: new Date().toISOString()
    }
    const result = importAllData(validData)
    expect(result).toBe(true)
  })

  it('importAllData rejects invalid data (less than 2 kids)', () => {
    const invalidData: ExportData = {
      kids_data: [{ id: 1, name: 'OnlyOne' }],
      rewards_pool: [],
      system_config: { exchangeRate: 1000 },
      reasons_pool: [],
      deduct_reasons_pool: [],
      current_kid_id: 1,
      custom_quotes: [],
      export_version: '1.0.10',
      export_date: ''
    }
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

  it('generateExportFilename includes date', () => {
    const filename = generateExportFilename()
    expect(filename).toContain('domibeta_data_')
    expect(filename).toContain('.json')
  })
})