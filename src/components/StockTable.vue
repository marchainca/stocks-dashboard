<script setup lang="ts">
import { useStockStore } from '@/stores/stocks'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const store = useStockStore()
const router = useRouter()

// Computados para búsqueda y ordenamiento simple (a mejorar luego)
const filtered = computed(() => {
  /* TODO: filtrar y ordenar store.items */
})

onMounted(() => {
  if (!store.items.length) store.fetchNext()
})

function goDetail(ticker: string) {
  router.push(`/stock/${ticker}`)
}
</script>

<template>
  <!-- Reutilizamos TU markup corporativo con Tailwind (omito por brevedad) -->
  <div><!-- tabla + paginación + búsqueda --> </div>
</template>
