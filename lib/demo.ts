import { buildHunt } from "@/lib/bonushunt-shape"
import type { KickMessage } from "@/lib/kick"
import type { Giveaway, Hunt, NowPlaying } from "@/lib/types"

/**
 * Sample data for ?demo=1, so every state can be checked in OBS before a
 * single key is set — and without touching the real data.
 */

const SLOTS: [string, string, number, number | null][] = [
  ["Sugar Supreme Powernudge", "Pragmatic Play", 1, 212.4],
  ["Wanted Dead or a Wild", "Hacksaw Gaming", 1, 48],
  ["Le Bandit", "Hacksaw Gaming", 0.8, 31.2],
  ["Gates of Olympus 1000", "Pragmatic Play", 1, 402],
  ["Fire in the Hole 3", "Nolimit City", 0.6, 12.6],
  ["Dog House Megaways", "Pragmatic Play", 1, 87.5],
  ["Mental 2", "Nolimit City", 0.5, null],
  ["Sweet Bonanza 1000", "Pragmatic Play", 1, null],
  ["Chaos Crew 3", "Hacksaw Gaming", 0.8, null],
  ["Tombstone RIP", "Nolimit City", 0.4, null],
  ["Zeus vs Hades", "Pragmatic Play", 1, null],
  ["Danny Dollar", "Hacksaw Gaming", 0.6, null],
  ["Big Bass Splash", "Pragmatic Play", 1, null],
  ["San Quentin 2", "Nolimit City", 0.5, null],
]

export const DEMO_HUNT: Hunt = buildHunt({
  id: "demo",
  title: "Sunday Hunt",
  casino: "Shuffle",
  startCost: 1000,
  isOpening: true,
  bonuses: SLOTS.map(([slotName, provider, betSize, payout], index) => ({ id: index, slotName, provider, betSize, payout })),
})

export const DEMO_NOW_PLAYING: NowPlaying = { playing: true, title: "Pon de Replay", artists: "Rihanna" }

const ENTRANTS = [
  "paun", "Unl1nked", "sasa55532", "kooIm3ns", "Dexiii10", "Olus47", "nightowl", "lucky_sid",
  "m0rtis", "VexLord", "ghostly", "spinz", "ZeroCool", "hexxed", "duskrider", "B1gWinBenny",
]

/**
 * A 60s loop: 12s with no giveaway (so it can be seen arriving), then open,
 * drawing, a winner, and gone again.
 */
export const DEMO_CYCLE_MS = 60_000

export function demoGiveaway(now = Date.now()): Giveaway {
  const t = now % DEMO_CYCLE_MS
  const start = now - t + 12_000
  const joined = Math.max(0, Math.min(ENTRANTS.length, Math.floor((t - 12_000) / 1500) + 1))
  const base: Giveaway = {
    status: "open",
    title: "$250 Giveaway",
    prize: "$250",
    keyword: "!join",
    entries: joined,
    entrants: ENTRANTS.slice(0, joined),
    startedAt: new Date(start).toISOString(),
    endsAt: new Date(start + 26_000).toISOString(),
    winner: null,
  }
  if (t < 12_000) return { ...base, status: "idle", entries: 0, entrants: [] }
  if (t < 38_000) return base
  const all = { ...base, entries: ENTRANTS.length, entrants: ENTRANTS }
  if (t < 44_000) return { ...all, status: "rolling" }
  if (t < 54_000) return { ...all, status: "finished", winner: "sasa55532" }
  return { ...all, status: "idle" }
}

const LINES: [string, string, string[]][] = [
  ["paun", "kako se zove", ["subscriber"]],
  ["Unl1nked", "wild", []],
  ["sasa55532", "nope its stuck there", ["subscriber"]],
  ["kooIm3ns", "you did a bonus hunt yesterday?", ["subscriber"]],
  ["Dexiii10", "bro he must be rich then", []],
  ["SoulStealer", "next one pays, trust", ["broadcaster"]],
  ["Olus47", "!join", ["vip"]],
  ["nightowl", "LETS GOOO", ["moderator", "subscriber"]],
  ["m0rtis", "this slot is not worth it", []],
  ["VexLord", "max win incoming", ["subscriber"]],
]

/** One new line every 2.5s, so the demo chat looks alive. */
export function demoChat(now = Date.now()): KickMessage[] {
  const tick = Math.floor(now / 2500)
  return Array.from({ length: 30 }, (_, i) => {
    const n = tick - 29 + i
    const [username, content, badges] = LINES[((n % LINES.length) + LINES.length) % LINES.length]
    return {
      id: `demo-${n}`,
      username,
      content,
      color: "#ffffff",
      badges: badges.map((type) => ({ type })),
      isMod: badges.includes("moderator") || badges.includes("broadcaster"),
    }
  })
}
