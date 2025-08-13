import type { Stock } from '@/types/types'

type ApiResponse = {
  items: Stock[]
  next_page: string | null | undefined // supongo que cuando llegue al final y no se tenga valores en next_page llegará en null o undefined
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').trim()

/**
 * Construye la URL final:
 */
function buildUrl(next: string) {
  const path = `/stocks?next=${encodeURIComponent(next)}`
  return API_BASE ? `${API_BASE}${path}` : path
}

/**
 * Fetch con timeout y manejo de errores.
 * La PRIMERA llamada debe ir en next con una cadena vacía
 * Si el backend responde next_page vacío, se normaliza a null
 */
export async function fetchStocks(next = ''): Promise<{ items: Stock[]; next_page: string | null }> {
  const url = buildUrl(next)

  // Timeout de 10s
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Error ${res.status}: ${text || res.statusText}`)
    }

    const data = (await res.json()) as ApiResponse

    // Validación de la respuesta
    if (!data || !Array.isArray(data.items)) {
      throw new Error('Respuesta inválida del servidor: falta "items"')
    }

    // Normalizamos next_page, 
    const np = data.next_page
    const next_page = np && String(np).length > 0 ? String(np) : null

    return { items: data.items, next_page }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Tiempo de espera agotado (timeout)')
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
