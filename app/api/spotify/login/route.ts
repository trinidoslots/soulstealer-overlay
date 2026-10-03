import { randomBytes } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { adminKeyMatches } from "@/lib/admin-key"
import { redirectUriFor, spotifyCredentials, SPOTIFY_SCOPES, STATE_COOKIE } from "@/lib/spotify"

/**
 * Starts the one-time Spotify consent: /api/spotify/login?key=<OVERLAY_ADMIN_KEY>
 *
 * The key matters because the callback stores whichever account logs in —
 * without it, anyone who found the URL could put their own music on stream.
 */

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  if (!adminKeyMatches(request.nextUrl.searchParams.get("key"))) {
    return new NextResponse("Falscher oder fehlender ?key= (OVERLAY_ADMIN_KEY).", { status: 401 })
  }

  const credentials = spotifyCredentials()
  if (!credentials) {
    return new NextResponse("SPOTIFY_CLIENT_ID und SPOTIFY_CLIENT_SECRET fehlen in der .env.", { status: 500 })
  }

  const redirectUri = redirectUriFor(request.nextUrl.origin)
  const state = randomBytes(16).toString("hex")
  const authorize = new URL("https://accounts.spotify.com/authorize")
  authorize.search = new URLSearchParams({
    response_type: "code",
    client_id: credentials.clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    state,
    show_dialog: "true",
  }).toString()

  const response = NextResponse.redirect(authorize)
  // Only a request that passed the key check gets a state, so the callback
  // cannot be completed without it.
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: redirectUri.startsWith("https:"),
    path: "/api/spotify",
    maxAge: 600,
  })
  return response
}
