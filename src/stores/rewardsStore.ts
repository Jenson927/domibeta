import { defineStore } from 'pinia'
import { loadFromStorage, saveToStorage, mergeWithDefaults } from '@/utils/localStorageSync'
import { STORAGE_KEYS } from '@/types/localStorage'
import { DEFAULT_REWARDS } from '@/data/defaultRewards'
import type { Reward } from '@/types/reward'

export const useRewardsStore = defineStore('rewards', {
  state: () => {
    const stored = loadFromStorage(STORAGE_KEYS.REWARDS_POOL)
    const rewards = stored ? mergeWithDefaults(stored, DEFAULT_REWARDS) : [...DEFAULT_REWARDS]
    if (stored && stored.length < DEFAULT_REWARDS.length) {
      saveToStorage(STORAGE_KEYS.REWARDS_POOL, rewards)
    }
    return { rewards }
  },

  getters: {
    allRewards: (state): Reward[] => state.rewards,

    nextId: (state): number => {
      return state.rewards.length > 0 ? Math.max(...state.rewards.map(r => r.id)) + 1 : 1
    }
  },

  actions: {
    addReward(reward: Omit<Reward, 'id'>) {
      this.rewards.push({ ...reward, id: this.nextId })
      saveToStorage(STORAGE_KEYS.REWARDS_POOL, this.rewards)
    },

    editReward(id: number, updates: Partial<Omit<Reward, 'id'>>) {
      const index = this.rewards.findIndex(r => r.id === id)
      if (index !== -1) {
        this.rewards[index] = { ...this.rewards[index], ...updates }
        saveToStorage(STORAGE_KEYS.REWARDS_POOL, this.rewards)
      }
    },

    removeReward(id: number) {
      this.rewards = this.rewards.filter(r => r.id !== id)
      saveToStorage(STORAGE_KEYS.REWARDS_POOL, this.rewards)
    },

    // Weighted random selection for draw
    getRandomReward(): Reward {
      const totalWeight = this.rewards.reduce((sum, r) => sum + r.weight, 0)
      let random = Math.random() * totalWeight
      for (const reward of this.rewards) {
        random -= reward.weight
        if (random <= 0) return reward
      }
      return this.rewards[this.rewards.length - 1]
    }
  }
})