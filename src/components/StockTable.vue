<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStockStore } from '@/stores/stocks'
import type { Stock } from '@/types/types'

const store = useStockStore()
const router = useRouter()

// Estado local de UI (sincronizado con la store)
const search = ref(store.search)
const sortBy = ref(store.sortBy)
watch(search, v => (store.search = v))
watch(sortBy, v => (store.sortBy = v))

onMounted(() => {
  if (!store.items.length && !store.loading) store.fetchNext()
})

/** Helpers */
function fmtMoney(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === '') return '—'

  // Acepta "$8.00", "US$8.00", "1,234.56", etc.
  const num = typeof v === 'number'
    ? v
    : Number(String(v).replace(/\s+/g, '').replace(/[^0-9.-]/g, ''))

  if (Number.isNaN(num)) return String(v) || '—'

  // Muestra solo el símbolo "$" (sin "US$")
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol', // <- evita "US$"
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '—'
  try { return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(iso)) } catch { return iso }
}
const ratingScore = (r?: string | null) => {
  const map: Record<string, number> = {
    'strong buy': 6, buy: 5, overweight: 4, 'equal weight': 3, neutral: 3,
    underweight: 2, sell: 1
  }
  return r ? (map[r.toLowerCase()] ?? 0) : 0
}

// Filtrado + ordenamiento local (sobre lo ya cargado)
const rows = computed<Stock[]>(() => {
  const q = search.value.trim().toLowerCase()
  let list = store.items.slice()

  if (q) {
    list = list.filter(r =>
      r.ticker.toLowerCase().includes(q) ||
      (r.company ?? '').toLowerCase().includes(q)
    )
  }

  switch (sortBy.value) {
    case 'time_asc':
      list.sort((a, b) => +new Date(a.time) - +new Date(b.time)); break
    case 'rating_to_desc':
      list.sort((a, b) => ratingScore(b.rating_to) - ratingScore(a.rating_to)); break
    case 'rating_to_asc':
      list.sort((a, b) => ratingScore(a.rating_to) - ratingScore(b.rating_to)); break
    default: // time_desc
      list.sort((a, b) => +new Date(b.time) - +new Date(a.time)); break
  }
  return list
})

function goDetail(ticker: string) { router.push(`/stock/${ticker}`) }
async function nextPage() { await store.fetchNext() }
</script>

<template>
  <div class="min-h-screen bg-gradient-to-r from-slate-100 to-slate-50 py-12">
    <section class="mx-auto max-w-7xl px-6">
      <div class="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden ring-1 ring-slate-200/70 relative">
        <!-- Header -->
        <header class="px-8 py-6 border-b border-slate-200">
          <h1 class="text-2xl font-semibold text-slate-800">Seguimiento de Acciones: Ratings y Targets</h1>
          <p class="mt-1 text-sm text-slate-500">Explora recomendaciones y cambios de precio objetivo</p>
        </header>

        <!-- Controls -->
        <div class="flex flex-wrap gap-4 px-8 py-5 bg-slate-50/60">
          <input v-model="search" type="search" placeholder="Buscar ticker o compañía"
                 class="w-64 flex-auto px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500" />
          <select v-model="sortBy"
                  class="w-56 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500">
            <option value="time_desc">Más recientes</option>
            <option value="time_asc">Más antiguos</option>
            <option value="rating_to_desc">Rating ↑</option>
            <option value="rating_to_asc">Rating ↓</option>
          </select>
          <div class="grow"></div>
          <span v-if="store.error" class="text-sm text-rose-600">Error: {{ store.error }}</span>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full whitespace-nowrap text-sm text-slate-700">
            <thead class="bg-slate-100 text-xs uppercase text-slate-600 sticky top-0 z-10">
              <tr>
                <th class="px-6 py-3 text-left font-medium">Ticker</th>
                <th class="px-6 py-3 text-left font-medium">Company</th>
                <th class="px-6 py-3 text-left font-medium">Brokerage</th>
                <th class="px-6 py-3 text-left font-medium">Action</th>
                <th class="px-6 py-3 text-left font-medium">Rating From</th>
                <th class="px-6 py-3 text-left font-medium">Rating To</th>
                <th class="px-6 py-3 text-right font-medium">Target From</th>
                <th class="px-6 py-3 text-right font-medium">Target To</th>
                <th class="px-6 py-3 text-center font-medium">Fecha</th>
                <th class="px-6 py-3 text-center font-medium">Detalles</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="r in rows" :key="r.ticker + r.time" class="hover:bg-indigo-50/30">
                <td class="px-6 py-3 font-semibold text-slate-900">{{ r.ticker }}</td>
                <td class="px-6 py-3">{{ r.company }}</td>
                <td class="px-6 py-3">{{ r.brokerage }}</td>
                <td class="px-6 py-3">{{ r.action }}</td>
                <td class="px-6 py-3">{{ r.rating_from ?? '—' }}</td>
                <td class="px-6 py-3">{{ r.rating_to ?? '—' }}</td>
                <td class="px-6 py-3 text-right">{{ fmtMoney(r.target_from) }}</td>
                <td class="px-6 py-3 text-right">{{ fmtMoney(r.target_to) }}</td>
                <td class="px-6 py-3 text-center">{{ fmtDate(r.time) }}</td>
                <td class="px-6 py-3 text-center">
                  <button class="text-indigo-600 hover:underline" @click="goDetail(r.ticker)">Ver</button>
                </td>
              </tr>
              <!-- Placeholder cuando no hay datos -->
              <tr v-if="!rows.length && !store.loading">
                <td colspan="10" class="px-6 py-10 text-center text-slate-500">
                  No hay datos para mostrar.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <footer class="flex items-center justify-between gap-6 px-8 py-6 border-t border-slate-200 bg-slate-50/60">
          <button disabled class="px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm disabled:opacity-40">
            ← Anterior
          </button>

          <span class="text-sm text-slate-600">
            {{ rows.length }} registros •
            <template v-if="store.nextCursor !== null">hay más</template>
            <template v-else>fin de resultados</template>
          </span>

          <button
            :disabled="store.nextCursor === null || store.loading"
            class="px-4 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm disabled:opacity-40"
            @click="nextPage">
            Siguiente →
          </button>
        </footer>

        <!-- Loader -->
        <div v-if="store.loading" class="absolute inset-0 bg-white/40 backdrop-blur-[1px] grid place-items-center">
          <div class="animate-spin h-6 w-6 rounded-full border-[3px] border-slate-300 border-t-indigo-600"></div>
        </div>
      </div>
    </section>
  </div>
</template>
