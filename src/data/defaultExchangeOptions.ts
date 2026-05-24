import type { ExchangeOption } from '@/types/exchange'

export const DEFAULT_EXCHANGE_OPTIONS: ExchangeOption[] = [
  { id: 1, name: '兑换平板时间', description: '看平板1分钟', pointsRequired: 100, unit: '分钟', category: 'time', icon: '📱', enabled: true },
  { id: 2, name: '兑换现金', description: '兑换1元钱', pointsRequired: 100, unit: '元', category: 'item', icon: '💰', enabled: true }
]