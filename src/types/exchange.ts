// Exchange option data model

export interface ExchangeOption {
  id: number
  name: string
  description: string
  pointsRequired: number
  unit: string
  category: string // 'time' | 'item' | custom
  icon: string
  enabled: boolean
}