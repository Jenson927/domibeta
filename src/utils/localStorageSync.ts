// localStorage sync utility
// Custom implementation matching existing localStorage format (not pinia-plugin-persistedstate)

import { STORAGE_KEYS } from '@/types/localStorage'
import type { StorageTypeMap, StorageKey } from '@/types/localStorage'

const EXCHANGE_RATE = 1000

export function loadFromStorage<K extends StorageKey>(key: K): StorageTypeMap[K] | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) as StorageTypeMap[K] : null
  } catch (e) {
    console.error('加载失败:', e)
    return null
  }
}

export function saveToStorage<K extends StorageKey>(key: K, data: StorageTypeMap[K]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('存储失败:', e)
  }
}

export function removeFromStorage(key: StorageKey): void {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.error('删除失败:', e)
  }
}

// Smart merge: add new default items that don't exist by name in current data
export function mergeWithDefaults<T extends { id: number; name: string }>(
  current: T[],
  defaults: T[]
): T[] {
  if (current.length >= defaults.length) return current

  const maxId = current.length > 0 ? Math.max(...current.map(item => item.id)) : 0
  let newId = maxId

  defaults.forEach(defaultItem => {
    const exists = current.some(item => item.name === defaultItem.name)
    if (!exists) {
      newId++
      current.push({ ...defaultItem, id: newId })
    }
  })

  return current
}

export { EXCHANGE_RATE }
export { STORAGE_KEYS as STORAGE_KEYS_CONST }