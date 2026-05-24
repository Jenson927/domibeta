// Reason data models - mirrors localStorage 'reasons_pool' and 'deduct_reasons_pool'

export interface AddReason {
  id: number
  name: string
  icon: string
  category: string
}

export interface DeductReason {
  id: number
  name: string
  icon: string
  category: string
}