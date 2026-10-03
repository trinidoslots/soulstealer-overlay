import { NextResponse } from "next/server"
import { readNowPlaying } from "@/lib/spotify"

/**
 * Public on purpose: OBS has no session. It hands out what is audible on
 * stream anyway — title, artist, cover — and never a token.
 *
 * Any failure reads as "not playing". On stream a missing song beats an error.
 */

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    return NextResponse.json(await readNowPlaying(), { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[spotify] now playing:", error)
    return NextResponse.json({ playing: false }, { headers: { "Cache-Control": "no-store" } })
  }
}
