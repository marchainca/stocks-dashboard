import { createRouter, createWebHistory } from 'vue-router'
import StockTable from '@/components/StockTable.vue'
import StockDetail from '@/pages/StockDetail.vue'

const routes = [
  { path: '/', component: StockTable },
  { path: '/stock/:ticker', component: StockDetail, props: true },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
