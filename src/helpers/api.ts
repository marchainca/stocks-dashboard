import type { Stock } from "@/types/types"

export async function fetchStocks(next = '') {
  const url = `/stocks?next=${encodeURIComponent(next)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json() as Promise<{
    items: Stock[]
    next_page: string | null
  }>
}
