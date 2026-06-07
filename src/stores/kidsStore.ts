import { defineStore } from 'pinia'
import { loadFromStorage, saveToStorage } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import { DEFAULT_KIDS } from '@/data/defaultKids'
import { useConfigStore } from './configStore'
import { useRewardsStore } from './rewardsStore'
import type { Kid, ExchangeHistoryItem, PointsHistoryItem, DrawHistoryItem } from '@/types/kid'

function replaceKid(this: { kids: Kid[] }, kidId: number, updater: (kid: Kid) => Kid) {
  this.kids = this.kids.map(k => k.id === kidId ? updater(k) : k)
}

export const useKidsStore = defineStore('kids', {
  state: () => {
    let kids = loadFromStorage(STORAGE_KEYS.KIDS_DATA) || [...DEFAULT_KIDS]

    // Auto-repair: if data is incomplete, reset to defaults
    if (!kids || kids.length < 2) {
      console.log('检测到数据不完整，重置为默认数据')
      kids = [...DEFAULT_KIDS]
      saveToStorage(STORAGE_KEYS.KIDS_DATA, kids)
    }

    // Compatibility: ensure each kid has exchangeHistory
    kids.forEach(kid => {
      if (!kid.exchangeHistory) kid.exchangeHistory = []
    })
    saveToStorage(STORAGE_KEYS.KIDS_DATA, kids)

    const currentKidId = loadFromStorage(STORAGE_KEYS.CURRENT_KID_ID) || 1

    return { kids, currentKidId }
  },

  getters: {
    currentKid: (state): Kid | undefined => {
      return state.kids.find(k => k.id === state.currentKidId)
    },

    totalPointsSummary: (state): string => {
      return state.kids
        .map(kid => {
          const points = kid.totalPoints
          const display = points < 0
            ? `<span style="color:#F44336;font-weight:bold;">${points}</span>`
            : `${points}`
          return `${kid.name}: ${display}分`
        })
        .join(' | ')
    },

    weekStats() {
      const configStore = useConfigStore()
      const kid = this.currentKid
      if (!kid) return null

      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      monday.setHours(0, 0, 0, 0)

      const weekAdd = kid.pointsHistory
        .filter(item => {
          const d = new Date(item.date)
          return d >= monday && item.points > 0
        })
        .reduce((sum, item) => sum + item.points, 0)

      const weekDeduct = kid.pointsHistory
        .filter(item => {
          const d = new Date(item.date)
          return d >= monday && item.points < 0
        })
        .reduce((sum, item) => sum + Math.abs(item.points), 0)

      const weekExchange = kid.exchangeHistory
        .filter(item => {
          const d = new Date(item.date)
          return d >= monday
        })
        .reduce((sum, item) => sum + (item.totalPoints || 0), 0)

      const weekDraw = kid.drawHistory
        .filter(item => {
          const d = new Date(item.date)
          return d >= monday
        })
        .reduce((sum, item) => sum + (item.pointsUsed || 0), 0)

      return {
        weekAdd,
        weekDeduct,
        weekExchange,
        weekDraw,
        weekNet: weekAdd - weekDeduct - weekExchange - weekDraw,
        exchangeRate: configStore.exchangeRate
      }
    }
  },

  actions: {
    selectKid(id: number) {
      this.currentKidId = id
      saveToStorage(STORAGE_KEYS.CURRENT_KID_ID, id)
    },

    addKid(name: string) {
      const maxId = this.kids.length > 0 ? Math.max(...this.kids.map(k => k.id)) : 0
      this.kids.push({
        id: maxId + 1,
        name,
        totalPoints: 0,
        drawChances: 0,
        pointsHistory: [],
        drawHistory: [],
        exchangeHistory: []
      })
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    removeKid(id: number) {
      if (this.kids.length <= 2) return // Keep at least 2 kids
      this.kids = this.kids.filter(k => k.id !== id)
      if (this.currentKidId === id && this.kids.length > 0) {
        this.currentKidId = this.kids[0].id
        saveToStorage(STORAGE_KEYS.CURRENT_KID_ID, this.currentKidId)
      }
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    editKidName(id: number, newName: string) {
      replaceKid.call(this, id, kid => ({ ...kid, name: newName.trim() }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    addPoints(points: number, reason: string, operationTime?: string, icon?: string) {
      const kid = this.currentKid
      if (!kid) return

      const date = operationTime || new Date().toISOString()
      const configStore = useConfigStore()
      const newChances = Math.floor((kid.totalPoints + points) / configStore.exchangeRate)
      const newRecord: PointsHistoryItem = { date, points, reason, icon }

      replaceKid.call(this, kid.id, k => ({
        ...k,
        totalPoints: k.totalPoints + points,
        drawChances: Math.max(0, newChances),
        pointsHistory: [...(k.pointsHistory ?? []), newRecord]
      }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    deductPoints(points: number, reason: string, operationTime?: string, icon?: string) {
      const kid = this.currentKid
      if (!kid) return

      const date = operationTime || new Date().toISOString()
      const configStore = useConfigStore()
      const newChances = Math.floor((kid.totalPoints - points) / configStore.exchangeRate)
      const newRecord: PointsHistoryItem = { date, points: -points, reason: '扣除：' + reason, icon }

      replaceKid.call(this, kid.id, k => ({
        ...k,
        totalPoints: k.totalPoints - points,
        drawChances: Math.max(0, newChances),
        pointsHistory: [...(k.pointsHistory ?? []), newRecord]
      }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    drawReward(operationTime?: string, reward?: import('@/types/reward').Reward) {
      const kid = this.currentKid
      if (!kid) return null

      const configStore = useConfigStore()
      const rewardsStore = useRewardsStore()

      if (kid.totalPoints < configStore.exchangeRate) return null
      if (kid.drawChances <= 0) return null

      const date = operationTime || new Date().toISOString()
      const selectedReward = reward || rewardsStore.getRandomReward()
      const newRecord: DrawHistoryItem = {
        date,
        reward: selectedReward.name,
        points: -configStore.exchangeRate,
        pointsUsed: configStore.exchangeRate,
        reason: selectedReward.name,
        icon: selectedReward.icon
      }

      replaceKid.call(this, kid.id, k => ({
        ...k,
        totalPoints: k.totalPoints - configStore.exchangeRate,
        drawChances: k.drawChances - 1,
        drawHistory: [...(k.drawHistory ?? []), newRecord]
      }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
      return selectedReward
    },

    exchangePoints(optionId: number, quantity: number, operationTime?: string) {
      const kid = this.currentKid
      if (!kid) return null

      const configStore = useConfigStore()
      const option = configStore.allExchangeOptions.find(o => o.id === optionId)
      if (!option) return null

      const totalPoints = option.pointsRequired * quantity
      if (kid.totalPoints < totalPoints) return null

      const date = operationTime || new Date().toISOString()
      const newChances = Math.floor((kid.totalPoints - totalPoints) / configStore.exchangeRate)
      const exchangeRecord: ExchangeHistoryItem = {
        id: Date.now(),
        exchangeOptionId: optionId,
        optionName: option.name,
        points: -totalPoints,
        pointsConsumed: option.pointsRequired,
        quantity,
        totalPoints,
        date,
        category: option.category,
        note: `${option.name} ${quantity} ${option.unit}`,
        reason: `${option.name} ${quantity} ${option.unit}`,
        icon: option.icon
      }

      replaceKid.call(this, kid.id, k => ({
        ...k,
        totalPoints: k.totalPoints - totalPoints,
        drawChances: Math.max(0, newChances),
        exchangeHistory: [...(k.exchangeHistory ?? []), exchangeRecord]
      }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
      return exchangeRecord
    },

    updateAvatar(kidId: number, avatarData: string) {
      replaceKid.call(this, kidId, kid => ({ ...kid, avatar: avatarData }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    clearHistory(kidId: number) {
      replaceKid.call(this, kidId, kid => ({
        ...kid,
        pointsHistory: [],
        drawHistory: [],
        exchangeHistory: []
      }))
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    },

    updateDrawChances() {
      const configStore = useConfigStore()
      this.kids = this.kids.map(kid => {
        const newChances = Math.floor(kid.totalPoints / configStore.exchangeRate)
        return { ...kid, drawChances: Math.max(0, newChances) }
      })
      saveToStorage(STORAGE_KEYS.KIDS_DATA, this.kids)
    }
  }
})
