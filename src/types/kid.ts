// Kid data model - mirrors localStorage 'kids_data'
// NOTE: field names intentionally inconsistent (pointsUsed/pointsConsumed/totalPoints)
// to maintain backward compatibility with existing localStorage data

export interface Kid {
  id: number
  name: string
  totalPoints: number
  drawChances: number
  pointsHistory: PointsHistoryItem[]
  drawHistory: DrawHistoryItem[]
  exchangeHistory: ExchangeHistoryItem[]
  avatar?: string // base64 data URL, optional
}

export interface PointsHistoryItem {
  date: string // ISO string
  points: number // positive for add, negative for deduct
  reason: string
  edited?: boolean // set when record has been modified
  editCount?: number
  lastEditTime?: string
}

export interface DrawHistoryItem {
  date: string
  reward: string
  points: number // always negative (e.g. -1000)
  pointsUsed: number // positive amount consumed
  reason: string
  edited?: boolean
  editCount?: number
  lastEditTime?: string
}

export interface ExchangeHistoryItem {
  id: number
  exchangeOptionId: number
  optionName: string
  points: number // negative (e.g. -200)
  pointsConsumed: number // positive amount per unit
  quantity: number
  totalPoints: number // total consumed (positive)
  date: string
  category: string
  note: string
  reason: string
  edited?: boolean
  editCount?: number
  lastEditTime?: string
}