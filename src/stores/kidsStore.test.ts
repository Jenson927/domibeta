import { describe, it, expect, beforeEach } from 'vitest'
import { useKidsStore } from '@/stores/kidsStore'
import { createPinia, setActivePinia } from 'pinia'
import { DEFAULT_KIDS } from '@/data/defaultKids'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
})

function resetKidsStore() {
  const store = useKidsStore()
  store.$patch({
    kids: [...DEFAULT_KIDS.map(k => ({ ...k, pointsHistory: [], drawHistory: [], exchangeHistory: [] }))],
    currentKidId: 1
  })
}

describe('kidsStore', () => {
  it('initializes with default kids', () => {
    const store = useKidsStore()
    expect(store.kids.length).toBe(2)
    expect(store.kids[0].name).toBe('Dommy')
    expect(store.kids[0].totalPoints).toBe(0)
  })

  it('selectKid changes currentKidId', () => {
    resetKidsStore()
    const store = useKidsStore()
    store.selectKid(2)
    expect(store.currentKidId).toBe(2)
  })

  it('addPoints increments totalPoints', () => {
    resetKidsStore()
    const store = useKidsStore()
    store.selectKid(1)
    store.addPoints(100, '完成作业')
    expect(store.kids[0].totalPoints).toBe(100)
  })

  it('deductPoints decrements and allows negative', () => {
    resetKidsStore()
    const store = useKidsStore()
    store.selectKid(1)
    store.addPoints(500, '初始积分')
    expect(store.kids[0].totalPoints).toBe(500)
    store.deductPoints(600, '发脾气')
    expect(store.kids[0].totalPoints).toBe(-100)
  })

  it('drawReward deducts exchangeRate', () => {
    resetKidsStore()
    const store = useKidsStore()
    store.selectKid(1)
    store.addPoints(1000, '初始积分')
    expect(store.kids[0].totalPoints).toBe(1000)
    const result = store.drawReward()
    expect(result).not.toBeNull()
    expect(store.kids[0].totalPoints).toBe(0)
  })

  it('exchangePoints deducts total cost', () => {
    resetKidsStore()
    const store = useKidsStore()
    store.selectKid(1)
    store.addPoints(500, '初始积分')
    expect(store.kids[0].totalPoints).toBe(500)
    const result = store.exchangePoints(1, 2)
    expect(result).not.toBeNull()
    expect(store.kids[0].totalPoints).toBe(300)
  })
})