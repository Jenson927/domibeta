import { defineStore } from 'pinia'
import { loadFromStorage, saveToStorage, EXCHANGE_RATE } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import { DEFAULT_EXCHANGE_OPTIONS } from '@/data/defaultExchangeOptions'
import type { SystemConfig, ExchangeOption, Riddle } from '@/types/config'

export const useConfigStore = defineStore('config', {
  state: () => {
    const stored = loadFromStorage(STORAGE_KEYS.SYSTEM_CONFIG)
    const systemConfig: SystemConfig = stored
      ? {
          exchangeRate: EXCHANGE_RATE,
          backgroundMode: 'carousel',
          backgroundStyle: 'cover',
          backgroundPhotos: [],
          currentPhotoIndex: 0,
          password: '',
          customRiddles: [],
          exchangeOptions: [],
          customQuotes: [],
          ...stored
        }
      : {
          exchangeRate: EXCHANGE_RATE,
          backgroundMode: 'carousel',
          backgroundStyle: 'cover',
          backgroundPhotos: [],
          currentPhotoIndex: 0,
          password: '',
          customRiddles: [],
          exchangeOptions: [],
          customQuotes: []
        }

    // Ensure exchangeOptions are initialized
    if (!systemConfig.exchangeOptions || systemConfig.exchangeOptions.length === 0) {
      systemConfig.exchangeOptions = [...DEFAULT_EXCHANGE_OPTIONS]
    }

    return { systemConfig, settingsPasswordVerified: false }
  },

  getters: {
    exchangeRate: (state): number => state.systemConfig.exchangeRate,

    hasPassword: (state): boolean => !!state.systemConfig.password && state.systemConfig.password.length > 0,

    allExchangeOptions: (state): ExchangeOption[] => {
      const stored = state.systemConfig.exchangeOptions || []
      const all = [...DEFAULT_EXCHANGE_OPTIONS, ...stored.filter(o => !DEFAULT_EXCHANGE_OPTIONS.some(d => d.id === o.id))]
      return all.filter(o => o.enabled)
    },

    backgroundMode: (state): string => state.systemConfig.backgroundMode
  },

  actions: {
    updateExchangeRate(rate: number) {
      this.systemConfig.exchangeRate = rate
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    setPassword(password: string) {
      this.systemConfig.password = password
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    clearPassword() {
      this.systemConfig.password = ''
      this.settingsPasswordVerified = false
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    verifyMainPassword(password: string): boolean {
      if (password === this.systemConfig.password) {
        this.settingsPasswordVerified = true
        return true
      }
      return false
    },

    addExchangeOption(option: Omit<ExchangeOption, 'id'>) {
      const maxId = this.systemConfig.exchangeOptions.length > 0
        ? Math.max(...this.systemConfig.exchangeOptions.map(o => o.id))
        : DEFAULT_EXCHANGE_OPTIONS.length
      this.systemConfig.exchangeOptions.push({ ...option, id: maxId + 1 })
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    removeExchangeOption(id: number) {
      this.systemConfig.exchangeOptions = this.systemConfig.exchangeOptions.filter(o => o.id !== id)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    updateBackgroundMode(mode: string) {
      this.systemConfig.backgroundMode = mode
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    updateBackgroundStyle(style: string) {
      this.systemConfig.backgroundStyle = style
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    addBackgroundPhoto(photoData: string) {
      this.systemConfig.backgroundPhotos.push(photoData)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    removeBackgroundPhoto(index: number) {
      this.systemConfig.backgroundPhotos.splice(index, 1)
      if (this.systemConfig.currentPhotoIndex >= this.systemConfig.backgroundPhotos.length) {
        this.systemConfig.currentPhotoIndex = 0
      }
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    addCustomRiddle(riddle: Riddle) {
      this.systemConfig.customRiddles.push(riddle)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    removeCustomRiddle(index: number) {
      this.systemConfig.customRiddles.splice(index, 1)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    addCustomQuote(quote: string) {
      this.systemConfig.customQuotes.push(quote)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    },

    removeCustomQuote(index: number) {
      this.systemConfig.customQuotes.splice(index, 1)
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)
    }
  }
})