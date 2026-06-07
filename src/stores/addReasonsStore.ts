import { defineStore } from 'pinia'
import { loadFromStorage, saveToStorage, mergeWithDefaults } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import { DEFAULT_ADD_REASONS } from '@/data/defaultAddReasons'
import type { AddReason } from '@/types/reason'

export const useAddReasonsStore = defineStore('addReasons', {
  state: () => {
    const stored = loadFromStorage(STORAGE_KEYS.REASONS_POOL)
    let addReasons: AddReason[]

    if (stored) {
      addReasons = mergeWithDefaults(stored, DEFAULT_ADD_REASONS)
      // Compatibility: ensure every reason has category field
      addReasons.forEach(reason => {
        if (!reason.category) reason.category = '其他'
        if (reason.points === undefined || reason.points === null) reason.points = 100
      })
      if (stored.length < DEFAULT_ADD_REASONS.length) {
        saveToStorage(STORAGE_KEYS.REASONS_POOL, addReasons)
      }
    } else {
      addReasons = [...DEFAULT_ADD_REASONS]
    }

    return { addReasons }
  },

  getters: {
    allAddReasons: (state): AddReason[] => state.addReasons,

    categories: (state): string[] => {
      const cats = new Set(state.addReasons.map(r => r.category))
      return Array.from(cats)
    },

    nextId: (state): number => {
      return state.addReasons.length > 0 ? Math.max(...state.addReasons.map(r => r.id)) + 1 : 1
    }
  },

  actions: {
    addReason(reason: Omit<AddReason, 'id'>) {
      this.addReasons.push({ ...reason, id: this.nextId })
      saveToStorage(STORAGE_KEYS.REASONS_POOL, this.addReasons)
    },

    editReason(id: number, updates: Partial<Omit<AddReason, 'id'>>) {
      const index = this.addReasons.findIndex(r => r.id === id)
      if (index !== -1) {
        this.addReasons[index] = { ...this.addReasons[index], ...updates }
        saveToStorage(STORAGE_KEYS.REASONS_POOL, this.addReasons)
      }
    },

    removeReason(id: number) {
      this.addReasons = this.addReasons.filter(r => r.id !== id)
      saveToStorage(STORAGE_KEYS.REASONS_POOL, this.addReasons)
    }
  }
})