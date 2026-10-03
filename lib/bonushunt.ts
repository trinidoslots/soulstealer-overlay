import { buildHunt, type RawHunt } from "@/lib/bonushunt-shape"
import type { Hunt } from "@/lib/types"

/**
 * bonushunt.gg's public API — the same one soul-stealer.com uses.
 *
 * Rate limit is 100 requests a minute per key, shared with the website. The
 * overlay polls, so every GET is cached in memory for a few seconds and
 * concurrent callers share one request in flight.
 */

const BASE_URL = "https://bonushunt.gg"
const TTL_MS = 8_000

const cache = new Map<string, { expires: number; data: Promise<unknown> }>()

export function bonushuntConfigured() {
  return !!process.env.BONUSHUNT_API_KEY?.trim()
}

async function get<T>(path: string): Promise<T> {
  const hit = cache.get(path)
  if (hit && hit.expires > Date.now()) return hit.data as Promise<T>

  const data = (async () => {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${process.env.BONUSHUNT_API_KEY?.trim()}` },
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`bonushunt.gg ${path} → ${response.status}`)
    return (await response.json()) as T
  })()

  cache.set(path, { expires: Date.now() + TTL_MS, data })
  // A failure must not be served from cache for the whole TTL.
  data.catch(() => cache.delete(path))
  return data
}

function completedHours() {
  const value = Number(process.env.BONUSHUNT_SHOW_COMPLETED_HOURS)
  return Number.isFinite(value) && value >= 0 ? value : 12
}

/**
 * The hunt worth showing: one being opened, else the newest one. A finished
 * hunt only stays on screen for BONUSHUNT_SHOW_COMPLETED_HOURS — after that,
 * yesterday's result is not news.
 */
export async function readCurrentHunt(): Promise<Hunt | null> {
  type List = { hunts?: RawHunt[] }
  let list = await get<List>("/api/public/hunts?status=opening&limit=1")
  if (!list.hunts?.length) list = await get<List>("/api/public/hunts?limit=1")
  const summary = list.hunts?.[0]
  if (!summary) return null

  const detail = await get<RawHunt>(`/api/public/hunts/${encodeURIComponent(String(summary.id))}`)
  const hunt = buildHunt({ ...summary, ...detail, bonuses: detail.bonuses ?? summary.bonuses })

  if (hunt.status === "completed") {
    const stamp = detail.completedAt ?? detail.updatedAt ?? detail.createdAt ?? summary.createdAt
    const age = stamp ? Date.now() - new Date(stamp).getTime() : Infinity
    if (!(age <= completedHours() * 3_600_000)) return null
  }
  return hunt
}
