import { defineStore } from 'pinia'
import { fetchStocks } from '@/helpers/api'

export const useStockStore = defineStore('stocks', {
  state: () => ({
    items: [] as Stock[],
    nextCursor: '' as string | null,
    loading: false,
    error: null as string | null,
    // filtros locales
    search: '',
    sortBy: 'time_desc' as SortKey,
  }),
  actions: {
    async fetchNext() {
      if (this.loading || this.nextCursor === null) return
      this.loading = true
      try {
        const { items, next_page } = await fetchStocks(this.nextCursor)
        this.items.push(...items)
        this.nextCursor = next_page ?? null
      } catch (e: any) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    reset() {
      this.items = []
      this.nextCursor = ''
    },
  },
})
