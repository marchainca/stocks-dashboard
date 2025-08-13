<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStockStore } from '@/stores/stocks'
import type { Stock } from '@/types/types'

const route = useRoute()
const router = useRouter()
const store = useStockStore()

const ticker = computed(() => route.params.ticker as string)
const stock = ref<Stock | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    // Buscar la acción en el store local
    const foundStock = store.items.find(s => s.ticker === ticker.value)
    if (foundStock) {
      stock.value = foundStock
    } else {
      // Si no está en el store, intentar cargar más datos
      await store.fetchNext()
      const foundAfterFetch = store.items.find(s => s.ticker === ticker.value)
      if (foundAfterFetch) {
        stock.value = foundAfterFetch
      } else {
        error.value = 'Acción no encontrada'
      }
    }
  } catch (e: any) {
    error.value = e.message || 'Error al cargar la acción'
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.push('/')
}

function printPage() {
  window.print()
}

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
  try { 
    return new Intl.DateTimeFormat('es-CO', { 
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(new Date(iso)) 
  } catch { 
    return iso 
  }
}

const ratingScore = (r?: string | null) => {
  const map: Record<string, number> = {
    'strong buy': 6, buy: 5, overweight: 4, 'equal weight': 3, neutral: 3,
    underweight: 2, sell: 1
  }
  return r ? (map[r.toLowerCase()] ?? 0) : 0
}

const ratingColor = (rating: string | null) => {
  if (!rating) return 'text-gray-500'
  const score = ratingScore(rating)
  if (score >= 5) return 'text-green-600'
  if (score >= 3) return 'text-yellow-600'
  return 'text-red-600'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-r from-slate-100 to-slate-50 py-12">
    <div class="mx-auto max-w-4xl px-6">
      <!-- Header -->
      <div class="mb-8">
        <button @click="goBack" 
                class="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a la lista
        </button>
        <h1 class="text-3xl font-bold text-slate-800 mt-4">Detalle de Acción</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-slate-600">Cargando información de la acción...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div class="text-red-500 mb-4">
          <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 class="text-xl font-semibold text-slate-800 mb-2">Error</h2>
        <p class="text-slate-600 mb-4">{{ error }}</p>
        <button @click="goBack" 
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Volver a la lista
        </button>
      </div>

      <!-- Stock Details -->
      <div v-else-if="stock" class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Stock Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-8 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-4xl font-bold">{{ stock.ticker }}</h2>
              <p class="text-xl text-indigo-100 mt-2">{{ stock.company }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-indigo-200">Casa de Bolsa</p>
              <p class="text-lg font-semibold">{{ stock.brokerage }}</p>
            </div>
          </div>
        </div>

        <!-- Stock Information -->
        <div class="p-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Rating Information -->
            <div class="space-y-6">
              <h3 class="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Información de Rating
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Rating Anterior:</span>
                  <span :class="['font-semibold', ratingColor(stock.rating_from)]">
                    {{ stock.rating_from || '—' }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Rating Nuevo:</span>
                  <span :class="['font-semibold', ratingColor(stock.rating_to)]">
                    {{ stock.rating_to || '—' }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Acción:</span>
                  <span class="font-semibold text-indigo-600">{{ stock.action }}</span>
                </div>
              </div>
            </div>

            <!-- Price Targets -->
            <div class="space-y-6">
              <h3 class="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2">
                Precios Objetivo
              </h3>
              
              <div class="space-y-4">
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Precio Anterior:</span>
                  <span class="font-semibold text-slate-800">
                    {{ fmtMoney(stock.target_from) }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Precio Nuevo:</span>
                  <span class="font-semibold text-slate-800">
                    {{ fmtMoney(stock.target_to) }}
                  </span>
                </div>
                
                <div class="flex justify-between items-center">
                  <span class="text-slate-600">Fecha:</span>
                  <span class="font-semibold text-slate-800">
                    {{ fmtDate(stock.time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Actions -->
          <div class="mt-8 pt-6 border-t border-slate-200">
            <div class="flex gap-4">
              <button @click="goBack" 
                      class="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
                Volver a la lista
              </button>
              <button @click="printPage" 
                      class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Imprimir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .bg-gradient-to-r,
  .shadow-xl,
  button {
    display: none !important;
  }
  
  .bg-white {
    background: white !important;
    box-shadow: none !important;
  }
}
</style>
