import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useConfigStore } from '@/stores/configStore'
import { createPinia, setActivePinia } from 'pinia'

let mockStorage: Record<string, string> = {}

beforeEach(() => {
  mockStorage = {}
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value },
    removeItem: (key: string) => { delete mockStorage[key] },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
  })
  setActivePinia(createPinia())
})

describe('configStore', () => {
  it('initializes with default config when localStorage empty', () => {
    const store = useConfigStore()
    expect(store.systemConfig.exchangeRate).toBe(1000)
    expect(store.systemConfig.backgroundMode).toBe('carousel')
    expect(store.systemConfig.password).toBe('')
  })

  it('hasPassword returns true when password is set', () => {
    const store = useConfigStore()
    expect(store.hasPassword).toBe(false)
    store.setPassword('1234')
    expect(store.hasPassword).toBe(true)
  })

  it('verifyMainPassword works correctly', () => {
    const store = useConfigStore()
    store.setPassword('test123')
    expect(store.verifyMainPassword('test123')).toBe(true)
    expect(store.verifyMainPassword('wrong')).toBe(false)
    expect(store.settingsPasswordVerified).toBe(true)
  })

  it('clearPassword removes password', () => {
    const store = useConfigStore()
    store.setPassword('1234')
    store.clearPassword()
    expect(store.hasPassword).toBe(false)
    expect(store.systemConfig.password).toBe('')
  })

  it('updateExchangeRate changes rate', () => {
    const store = useConfigStore()
    store.updateExchangeRate(500)
    expect(store.systemConfig.exchangeRate).toBe(500)
    expect(store.exchangeRate).toBe(500)
  })

  it('addExchangeOption and removeExchangeOption work', () => {
    const store = useConfigStore()
    store.addExchangeOption({
      name: '新选项', description: '描述', pointsRequired: 200, unit: '个', category: 'item', icon: '🎁', enabled: true
    })
    expect(store.systemConfig.exchangeOptions.length).toBeGreaterThan(2)
  })
})