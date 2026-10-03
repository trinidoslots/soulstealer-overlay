import { readStore, writeStore } from "@/lib/store"
import type { NowPlaying } from "@/lib/types"

/**
 * Spotify via the Web API, authorization-code flow.
 *
 * /api/spotify/login runs the consent screen once; the callback stores the
 * refresh token in data/store.json on the server. SPOTIFY_REFRESH_TOKEN in the
 * env still works as a fallback. Access tokens only ever live in memory.
 */

export const SPOTIFY_SCOPES = "user-read-currently-playing user-read-playback-state"
export const STATE_COOKIE = "spotify_oauth_state"

export function spotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
  return clientId && clientSecret ? { clientId, clientSecret } : null
}

/**
 * Must match the redirect URI in the Spotify dashboard character for character.
 *
 * Behind nginx the request's own origin is often http://localhost:3100, which
 * Spotify would reject — so PUBLIC_URL wins when it is set.
 */
export function redirectUriFor(origin: string) {
  const explicit = process.env.SPOTIFY_REDIRECT_URI?.trim()
  if (explicit) return explicit
  const base = process.env.PUBLIC_URL?.trim().replace(/\/+$/, "") || origin
  return `${base}/api/spotify/callback`
}

type TokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
  error_description?: string
}

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const credentials = spotifyCredentials()
  if (!credentials) throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set.")

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams(body),
    cache: "no-store",
  })
  const payload = (await response.json().catch(() => ({}))) as TokenResponse
  if (!response.ok) throw new Error(payload.error_description ?? payload.error ?? `Spotify said ${response.status}.`)
  return payload
}

/** The one-time code from the callback, traded for a refresh token. */
export async function exchangeCode(code: string, redirectUri: string): Promise<void> {
  const payload = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirectUri })
  if (!payload.refresh_token) throw new Error("Spotify sent no refresh token.")
  await saveRefreshToken(payload.refresh_token)
}

let accessToken: { value: string; expiresAt: number } | null = null

async function refreshToken(): Promise<string | null> {
  const stored = (await readStore()).spotifyRefreshToken?.trim()
  return stored || process.env.SPOTIFY_REFRESH_TOKEN?.trim() || null
}

export async function saveRefreshToken(token: string) {
  await writeStore({ spotifyRefreshToken: token })
  accessToken = null
  lastRead = null
}

export async function spotifyConnected() {
  return !!spotifyCredentials() && !!(await refreshToken())
}

async function currentAccessToken(): Promise<string | null> {
  if (accessToken && accessToken.expiresAt - 60_000 > Date.now()) return accessToken.value

  const token = await refreshToken()
  if (!token) return null

  const payload = await tokenRequest({ grant_type: "refresh_token", refresh_token: token })
  if (!payload.access_token) throw new Error("Spotify sent no access token.")
  // Spotify may rotate the refresh token; the old one then stops working.
  if (payload.refresh_token && payload.refresh_token !== token) {
    await writeStore({ spotifyRefreshToken: payload.refresh_token })
  }
  accessToken = { value: payload.access_token, expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000 }
  return accessToken.value
}

/*
 * OBS, a preview tab and the setup page can all poll at once. Reusing the last answer for a moment keeps it to one call to
 * Spotify per interval per instance.
 */
const REUSE_MS = 2_500
let lastRead: { at: number; value: NowPlaying } | null = null

type CurrentlyPlaying = {
  is_playing?: boolean
  progress_ms?: number | null
  currently_playing_type?: string
  item?: {
    name?: string
    duration_ms?: number
    artists?: { name?: string }[]
    album?: { name?: string; images?: { url: string; width?: number }[] }
    show?: { name?: string; images?: { url: string; width?: number }[] }
    images?: { url: string; width?: number }[]
  } | null
}

/** The smallest cover that is still at least `min` px wide. */
function pickImage(images: { url: string; width?: number }[] | undefined, min = 160): string | null {
  if (!images?.length) return null
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  return (sorted.find((image) => (image.width ?? 0) >= min) ?? sorted[sorted.length - 1]).url
}

export async function readNowPlaying(): Promise<NowPlaying> {
  if (lastRead && Date.now() - lastRead.at < REUSE_MS) return lastRead.value

  const token = await currentAccessToken()
  if (!token) return { playing: false, connected: false }

  const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (response.status === 401) {
    accessToken = null
    throw new Error("Spotify refused the access token.")
  }
  if (!response.ok && response.status !== 204) throw new Error(`Spotify said ${response.status}.`)

  // 204: Spotify is closed or nothing is queued.
  const data: CurrentlyPlaying | null = response.status === 204 ? null : await response.json().catch(() => null)
  const item = data?.item
  const title = item?.name?.trim()

  let value: NowPlaying = { playing: false, connected: true }
  if (data?.is_playing && item && title) {
    const episode = data.currently_playing_type === "episode"
    value = {
      playing: true,
      connected: true,
      title,
      artists: episode
        ? (item.show?.name ?? "")
        : (item.artists ?? [])
            .map((artist) => artist.name?.trim())
            .filter(Boolean)
            .join(", "),
      album: episode ? null : (item.album?.name ?? null),
      image: pickImage(episode ? (item.images ?? item.show?.images) : item.album?.images),
      progressMs: data.progress_ms ?? 0,
      durationMs: item.duration_ms ?? 0,
      readAt: Date.now(),
    }
  }

  lastRead = { at: Date.now(), value }
  return value
}
