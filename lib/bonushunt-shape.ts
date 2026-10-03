import type { Hunt, HuntBonus, HuntStatus } from "@/lib/types"

/**
 * bonushunt.gg's hunt, turned into what the overlay draws. Pure, so the demo
 * data on the client goes through exactly the same maths as the live hunt.
 */

export type RawBonus = {
  id: string | number
  slotName?: string
  provider?: string | null
  betSize?: number | string
  payout?: number | string | null
  multiplier?: number | string | null
}

export type RawHunt = {
  id: string | number
  title?: string
  casino?: string | null
  startCost?: number | string
  status?: string
  isOpening?: boolean
  currentOpeningSlot?: string | null
  createdAt?: string
  updatedAt?: string
  completedAt?: string
  bonuses?: RawBonus[]
}

const num = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function mapBonus(raw: RawBonus): HuntBonus {
  const bet = num(raw.betSize) ?? 0
  const payout = num(raw.payout)
  const multiplier = num(raw.multiplier) ?? (payout !== null && bet > 0 ? payout / bet : null)
  return {
    id: String(raw.id),
    slot: raw.slotName?.trim() || "Unknown slot",
    provider: raw.provider?.trim() || null,
    bet,
    payout,
    multiplier,
  }
}

function statusOf(raw: RawHunt): HuntStatus {
  const status = raw.status?.toLowerCase()
  if (status === "completed" || status === "finished") return "completed"
  if (raw.isOpening || status === "opening") return "opening"
  return "collecting"
}

export function buildHunt(raw: RawHunt): Hunt {
  const bonuses = (raw.bonuses ?? []).map(mapBonus)
  const startCost = num(raw.startCost) ?? 0
  const status = statusOf(raw)

  const opened = bonuses.filter((bonus) => bonus.payout !== null)
  const unopened = bonuses.filter((bonus) => bonus.payout === null)
  const totalBet = bonuses.reduce((sum, bonus) => sum + bonus.bet, 0)
  const openedBet = opened.reduce((sum, bonus) => sum + bonus.bet, 0)
  const unopenedBet = unopened.reduce((sum, bonus) => sum + bonus.bet, 0)
  const totalWin = opened.reduce((sum, bonus) => sum + (bonus.payout ?? 0), 0)

  const best = opened.reduce<HuntBonus | null>(
    (top, bonus) => ((bonus.multiplier ?? 0) > (top?.multiplier ?? -1) ? bonus : top),
    null,
  )

  let current: HuntBonus | null = null
  if (status === "opening") {
    const named = raw.currentOpeningSlot?.trim().toLowerCase()
    current =
      (named && unopened.find((bonus) => bonus.slot.toLowerCase() === named)) || unopened[0] || null
  } else if (status === "collecting") {
    current = bonuses[bonuses.length - 1] ?? null
  }

  return {
    id: String(raw.id),
    title: raw.title?.trim() || "Bonus Hunt",
    casino: raw.casino?.trim() || null,
    status,
    startCost,
    bonuses,
    current,
    stats: {
      count: bonuses.length,
      opened: opened.length,
      totalBet,
      totalWin,
      profit: totalWin - startCost,
      breakEvenStart: totalBet > 0 ? startCost / totalBet : null,
      breakEvenLive: unopenedBet > 0 ? Math.max(0, startCost - totalWin) / unopenedBet : null,
      averageX: openedBet > 0 ? totalWin / openedBet : null,
      best,
    },
  }
}

