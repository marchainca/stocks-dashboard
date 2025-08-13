import { defineStore } from 'pinia'
import { fetchRecommendations } from '@/helpers/api'
import type { Recommendation, RecommendationResponse } from '@/types/types'

export const useRecommendationsStore = defineStore('recommendations', {
  state: () => ({
    list: [] as Recommendation[],
    generatedAt: null as string | null,
    windowDays: 30 as number | null,
    universe: null as number | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetch() {
      if (this.loading) return
      this.loading = true
      try {
        const data: RecommendationResponse = await fetchRecommendations()
        this.list = data.recommendations
        this.generatedAt = data.generated_at
        this.windowDays = data.window_days
        this.universe = data.universe
        this.error = null
      } catch (e: any) {
        this.error = e?.message ?? String(e)
      } finally {
        this.loading = false
      }
    },
    clear() {
      this.list = []
      this.error = null
    },
  },
})
