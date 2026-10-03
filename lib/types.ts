/** Shapes the API routes hand to the overlay. Shared by server and client. */

export type NowPlaying =
  | { playing: false; connected: boolean }
  | {
      playing: true
      connected: true
      title: string
      artists: string
      album: string | null
      image: string | null
      progressMs: number
      durationMs: number
      /** Server time the progress was read at, so the client can run the bar on. */
      readAt: number
    }

export type HuntBonus = {
  id: string
  slot: string
  provider: string | null
  bet: number
  payout: number | null
  multiplier: number | null
}

export type HuntStatus = "collecting" | "opening" | "completed"

export type Hunt = {
  id: string
  title: string
  casino: string | null
  status: HuntStatus
  startCost: number
  bonuses: HuntBonus[]
  /** Derived figures, computed once on the server. */
  stats: {
    count: number
    opened: number
    totalBet: number
    totalWin: number
    profit: number
    /** Average multiplier needed over all bonuses to get the start cost back. */
    breakEvenStart: number | null
    /** Same, over what is still unopened, given what has been won so far. */
    breakEvenLive: number | null
    /** Average multiplier of the opened bonuses. */
    averageX: number | null
    best: HuntBonus | null
  }
  /** The bonus being opened right now, or the next one in line. */
  current: HuntBonus | null
}

export type HuntResponse = { hunt: Hunt | null; configured: boolean }

export type GiveawayStatus = "idle" | "open" | "closed" | "rolling" | "finished"

export type Giveaway = {
  status: GiveawayStatus
  title: string | null
  prize: string | null
  keyword: string | null
  entries: number
  entrants: string[]
  startedAt: string | null
  endsAt: string | null
  winner: string | null
}

export type GiveawayResponse = { giveaway: Giveaway; configured: boolean }
