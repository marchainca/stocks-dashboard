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
