export type Stock = {
  ticker: string
  company: string
  brokerage: string
  action: string
  rating_from: string | null
  rating_to: string | null
  target_from: number | string | null
  target_to: number | string | null
  time: string // ISO
}

export type SortKey = 'time_desc' | 'time_asc' | 'rating_to_desc' | 'rating_to_asc'

export type Recommendation = {
  ticker: string
  score: number
  decision: string // 'BUY' | 'HOLD' | 'SELL' | ...
  reason: {
    action: number
    rating_delta: number
    target_momentum: number
    broker_weight: number
    consensus30d: number
    recency_days: number
  }
  company: string
  broker_top: string
}

export type RecommendationResponse = {
  generated_at: string
  window_days: number
  universe: number
  recommendations: Recommendation[]
}
