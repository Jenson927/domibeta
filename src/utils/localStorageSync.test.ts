import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadFromStorage, saveToStorage, removeFromStorage, mergeWithDefaults } from '@/utils/localStorageSync'

// Mock localStorage
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

describe('localStorageSync', () => {
  it('saveToStorage and loadFromStorage roundtrip', () => {
    saveToStorage('test_key', { name: 'test', value: 42 })
    const result = loadFromStorage('test_key')
    expect(result).toEqual({ name: 'test', value: 42 })
  })

  it('loadFromStorage returns null for missing key', () => {
    const result = loadFromStorage('nonexistent')
    expect(result).toBeNull()
  })

  it('loadFromStorage handles corrupted data', () => {
    mockStorage['bad_key'] = 'not valid json {{{'
    const result = loadFromStorage('bad_key')
    expect(result).toBeNull()
  })

  it('removeFromStorage deletes key', () => {
    saveToStorage('del_key', 'value')
    removeFromStorage('del_key')
    expect(loadFromStorage('del_key')).toBeNull()
  })

  it('mergeWithDefaults adds missing items by name', () => {
    const current = [{ id: 1, name: 'existing' }]
    const defaults = [
      { id: 1, name: 'existing', extra: 'field' },
      { id: 2, name: 'new_item' }
    ]
    const result = mergeWithDefaults(current, defaults)
    expect(result.length).toBe(2)
    expect(result[1].name).toBe('new_item')
  })

  it('mergeWithDefaults skips when current >= defaults length', () => {
    const current = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
    const defaults = [{ id: 1, name: 'a' }]
    const result = mergeWithDefaults(current, defaults)
    expect(result.length).toBe(2)
    expect(result).toEqual(current)
  })
})