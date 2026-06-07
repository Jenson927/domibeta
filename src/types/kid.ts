export interface Kid {
  id: number
  name: string
  totalPoints: number
  drawChances: number
  pointsHistory: PointsHistoryItem[]
  drawHistory: DrawHistoryItem[]
  exchangeHistory: ExchangeHistoryItem[]
  avatar?: string
}

export interface PointsHistoryItem {
  date: string
  points: number
  reason: string
  icon?: string
  edited?: boolean
  editCount?: number
  lastEditTime?: string
}

export interface DrawHistoryItem {
  date: string
  reward: string
  points: number
  pointsUsed: number
  reason: string
  icon?: string
  edited?: boolean
  editCount?: number
  lastEditTime?: string
}

export interface ExchangeHistoryItem {
  id: number
  exchangeOptionId: number
  optionName: string
  points: number
  pointsConsumed: number
  quantity: number
  totalPoints: number
  date: string
  category: string
  note: string
  reason: string
  icon?: string
  edited?: boolean
  editCount?: number
  lastEditTime?: string
}
