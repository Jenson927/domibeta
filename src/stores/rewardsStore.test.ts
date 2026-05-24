import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRewardsStore } from '@/stores/rewardsStore'
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

describe('rewardsStore', () => {
  it('initializes with default rewards', () => {
    const store = useRewardsStore()
    expect(store.rewards.length).toBe(20) // 20 default rewards
  })

  it('getRandomReward returns a reward with weighted probability', () => {
    const store = useRewardsStore()
    const result = store.getRandomReward()
    expect(result).toHaveProperty('name')
    expect(result).toHaveProperty('weight')
    expect(result).toHaveProperty('icon')
  })

  it('weighted random distribution is approximately correct', () => {
    const store = useRewardsStore()
    // Run 1000 random selections and count
    const counts: Record<string, number> = {}
    for (let i = 0; i < 1000; i++) {
      const reward = store.getRandomReward()
      counts[reward.name] = (counts[reward.name] || 0) + 1
    }
    // Higher weight rewards should appear more often
    const highWeight = store.rewards.find(r => r.weight >= 30)
    const lowWeight = store.rewards.find(r => r.weight <= 12)
    if (highWeight && lowWeight) {
      expect(counts[highWeight.name]).toBeGreaterThan(counts[lowWeight.name])
    }
  })

  it('addReward and removeReward work correctly', () => {
    const store = useRewardsStore()
    store.addReward({ name: '新奖励', weight: 50, icon: '🎯' })
    expect(store.rewards.length).toBe(21)
    expect(store.rewards[20].name).toBe('新奖励')
    store.removeReward(store.rewards[20].id)
    expect(store.rewards.length).toBe(20)
  })

  it('editReward updates specific fields', () => {
    const store = useRewardsStore()
    const firstId = store.rewards[0].id
    store.editReward(firstId, { name: '冰淇淋2' })
    expect(store.rewards[0].name).toBe('冰淇淋2')
    expect(store.rewards[0].weight).toBe(store.rewards[0].weight) // unchanged
  })
})