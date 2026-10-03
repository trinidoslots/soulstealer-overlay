import { buildHunt } from "@/lib/bonushunt-shape"
import type { Giveaway, Hunt, NowPlaying } from "@/lib/types"

/**
 * Sample data for ?demo=1, so every state can be checked in OBS before a
 * single key is set — and on stream-off days without touching the real data.
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
  title: "Sunday Reaper Hunt",
  casino: "Shuffle",
  startCost: 1000,
  isOpening: true,
  bonuses: SLOTS.map(([slotName, provider, betSize, payout], index) => ({
    id: index,
    slotName,
    provider,
    betSize,
    payout,
  })),
})

const TRACK_MS = 222_000

export function demoNowPlaying(): NowPlaying {
  const now = Date.now()
  return {
    playing: true,
    connected: true,
    title: "Pon de Replay",
    artists: "Rihanna",
    album: "Music of the Sun",
    image: null,
    progressMs: now % TRACK_MS,
    durationMs: TRACK_MS,
    readAt: now,
  }
}

const ENTRANTS = [
  "paun", "Unl1nked", "sasa55532", "kooIm3ns", "Dexiii10", "Olus47", "reaperfan", "nightowl", "lucky_sid",
  "m0rtis", "VexLord", "ghostly", "spinz", "ZeroCool", "hexxed", "crowbar", "duskrider", "B1gWinBenny",
]

/** Loops open → rolling → finished → idle so every state is on screen in turn. */
export function demoGiveaway(): Giveaway {
  const cycle = 46_000
  const t = Date.now() % cycle
  const cycleStart = Date.now() - t
  const base: Giveaway = {
    status: "open",
    title: "$250 Giveaway",
    prize: "$250",
    keyword: "!join",
    entries: Math.min(ENTRANTS.length, 4 + Math.floor(t / 1200)),
    entrants: ENTRANTS.slice(0, Math.min(ENTRANTS.length, 4 + Math.floor(t / 1200))),
    startedAt: new Date(cycleStart - 95_000).toISOString(),
    endsAt: new Date(cycleStart + 22_000).toISOString(),
    winner: null,
  }
  if (t < 22_000) return base
  const all = { ...base, entries: ENTRANTS.length, entrants: ENTRANTS }
  if (t < 30_000) return { ...all, status: "rolling" }
  if (t < 40_000) return { ...all, status: "finished", winner: "sasa55532" }
  return { ...all, status: "idle", winner: null }
}
