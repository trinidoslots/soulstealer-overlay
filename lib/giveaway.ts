import type { Giveaway, GiveawayStatus } from "@/lib/types"

/**
 * The giveaway module on soul-stealer.com, read over HTTP.
 *
 * GIVEAWAY_API_URL points at an endpoint on the website that returns the
 * current round as JSON. The reader below is deliberately forgiving about
 * field names (camelCase, snake_case, a wrapping { giveaway } or { data }),
 * so the website does not have to be rewritten around the overlay — see the
 * README for the canonical shape.
 */

export const IDLE: Giveaway = {
  status: "idle",
  title: null,
  prize: null,
  keyword: null,
  entries: 0,
  entrants: [],
  startedAt: null,
  endsAt: null,
  winner: null,
}

export function giveawayConfigured() {
  return !!process.env.GIVEAWAY_API_URL?.trim()
}

type Raw = Record<string, unknown>

const isObject = (value: unknown): value is Raw => !!value && typeof value === "object" && !Array.isArray(value)

function pick(raw: Raw, ...keys: string[]): unknown {
  for (const key of keys) if (raw[key] !== undefined && raw[key] !== null && raw[key] !== "") return raw[key]
  return undefined
}

function text(value: unknown): string | null {
  if (typeof value === "number") return String(value)
  if (typeof value !== "string") return null
  const trimmed = value.replace(/\s+/g, " ").trim()
  return trimmed || null
}

function date(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null
  const parsed = new Date(typeof value === "number" && value < 1e12 ? value * 1000 : value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

/** A name out of whatever an entrant or winner is: a string or a user object. */
function nameOf(value: unknown): string | null {
  if (isObject(value)) return text(pick(value, "username", "name", "display_name", "displayName", "kick_username", "user"))
  return text(value)
}

function readStatus(raw: Raw, winner: string | null): GiveawayStatus {
  const status = text(pick(raw, "status", "state", "phase"))?.toLowerCase()
  switch (status) {
    case "open":
    case "active":
    case "running":
    case "live":
    case "started":
      return "open"
    case "closed":
    case "locked":
    case "paused":
      return "closed"
    case "rolling":
    case "drawing":
    case "spinning":
    case "picking":
      return "rolling"
    case "finished":
    case "done":
    case "completed":
    case "ended":
    case "winner":
      return winner ? "finished" : "idle"
    case "idle":
    case "none":
    case "inactive":
      return "idle"
  }
  if (winner) return "finished"
  const active = pick(raw, "active", "is_active", "isActive", "running", "open")
  return active === true || active === 1 || active === "true" ? "open" : "idle"
}

/** Finds the round in a response that might wrap it, or list several. */
function unwrap(payload: unknown): Raw | null {
  if (Array.isArray(payload)) {
    const rounds = payload.filter(isObject)
    return rounds.find((round) => readStatus(round, null) !== "idle") ?? rounds[0] ?? null
  }
  if (!isObject(payload)) return null
  for (const key of ["giveaway", "current", "data", "state", "round"]) {
    const inner = payload[key]
    if (isObject(inner) || Array.isArray(inner)) return unwrap(inner)
  }
  return payload
}

export function normalizeGiveaway(payload: unknown): Giveaway {
  const raw = unwrap(payload)
  if (!raw) return IDLE

  const winnerRaw = pick(raw, "winner", "winner_name", "winnerName", "winners")
  const winner = Array.isArray(winnerRaw) ? nameOf(winnerRaw[0]) : nameOf(winnerRaw)

  const entrantsRaw =
    pick(raw, "entrants", "participants", "entries_list", "users") ?? (Array.isArray(raw.entries) ? raw.entries : undefined)
  const entrants = Array.isArray(entrantsRaw)
    ? entrantsRaw.map(nameOf).filter((name): name is string => !!name)
    : []

  const countRaw = pick(raw, "entries", "entry_count", "entryCount", "entries_count", "entrant_count", "participants_count")
  const count = Array.isArray(countRaw) ? countRaw.length : Number(countRaw)

  let keyword = text(pick(raw, "keyword", "command", "entry_command", "entryCommand", "join_command"))
  if (keyword && !/^[!/]/.test(keyword)) keyword = `!${keyword}`

  return {
    status: readStatus(raw, winner),
    title: text(pick(raw, "title", "name")),
    prize: text(pick(raw, "prize", "reward", "amount", "prize_value", "value")),
    keyword,
    entries: Number.isFinite(count) && count >= 0 ? count : entrants.length,
    entrants: entrants.slice(-200),
    startedAt: date(pick(raw, "started_at", "startedAt", "created_at", "createdAt", "start_time")),
    endsAt: date(pick(raw, "ends_at", "endsAt", "end_time", "endTime", "expires_at")),
    winner,
  }
}

export async function readGiveaway(): Promise<Giveaway> {
  const url = process.env.GIVEAWAY_API_URL?.trim()
  if (!url) return IDLE

  const key = process.env.GIVEAWAY_API_KEY?.trim()
  const response = await fetch(url, {
    headers: { Accept: "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  })
  if (!response.ok) throw new Error(`Giveaway API said ${response.status}.`)
  return normalizeGiveaway(await response.json())
}
