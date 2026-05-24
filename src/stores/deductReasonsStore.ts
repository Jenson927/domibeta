import { defineStore } from 'pinia'
import { loadFromStorage, saveToStorage, mergeWithDefaults } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import { DEFAULT_DEDUCT_REASONS } from '@/data/defaultDeductReasons'
import type { DeductReason } from '@/types/reason'

export const useDeductReasonsStore = defineStore('deductReasons', {
  state: () => {
    const stored = loadFromStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL)
    const deductReasons = stored ? mergeWithDefaults(stored, DEFAULT_DEDUCT_REASONS) : [...DEFAULT_DEDUCT_REASONS]
    if (stored && stored.length < DEFAULT_DEDUCT_REASONS.length) {
      saveToStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL, deductReasons)
    }
    return { deductReasons }
  },

  getters: {
    allDeductReasons: (state): DeductReason[] => state.deductReasons,

    categories: (state): string[] => {
      const cats = new Set(state.deductReasons.map(r => r.category))
      return Array.from(cats)
    },

    nextId: (state): number => {
      return state.deductReasons.length > 0 ? Math.max(...state.deductReasons.map(r => r.id)) + 1 : 1
    }
  },

  actions: {
    addReason(reason: Omit<DeductReason, 'id'>) {
      this.deductReasons.push({ ...reason, id: this.nextId })
      saveToStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL, this.deductReasons)
    },

    editReason(id: number, updates: Partial<Omit<DeductReason, 'id'>>) {
      const index = this.deductReasons.findIndex(r => r.id === id)
      if (index !== -1) {
        this.deductReasons[index] = { ...this.deductReasons[index], ...updates }
        saveToStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL, this.deductReasons)
      }
    },

    removeReason(id: number) {
      this.deductReasons = this.deductReasons.filter(r => r.id !== id)
      saveToStorage(STORAGE_KEYS.DEDUCT_REASONS_POOL, this.deductReasons)
    }
  }
})