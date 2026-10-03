import { NextResponse } from "next/server"
import { CHAT } from "@/lib/config"

/**
 * Turns the channel name into the numeric chatroom id the chat socket needs.
 *
 * Kick only hands that id out on its own pages, which sit behind Cloudflare
 * and occasionally refuse a server. KICK_CHATROOM_ID in .env.local skips the
 * lookup entirely; it never changes for a channel, so once found it can stay.
 * The answer is cached in memory either way — the id does not change.
 */

export const dynamic = "force-dynamic"

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
let cached: { slug: string; id: number } | null = null

async function lookup(slug: string): Promise<number | null> {
  try {
    const response = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    })
    if (response.ok) {
      const id = (await response.json())?.chatroom?.id
      if (typeof id === "number") return id
    }
  } catch {
    // fall through to the popout page
  }
  try {
    const response = await fetch(`https://kick.com/popout/${encodeURIComponent(slug)}/chat`, {
      headers: { "User-Agent": UA },
      cache: "no-store",
    })
    const match = response.ok ? (await response.text()).match(/"chatroom":\s*{\s*"id":\s*(\d+)/) : null
    if (match) return Number(match[1])
  } catch {
    // reported below
  }
  return null
}

export async function GET() {
  const fixed = Number(process.env.KICK_CHATROOM_ID)
  if (Number.isInteger(fixed) && fixed > 0) return NextResponse.json({ chatroomId: fixed })

  const slug = (process.env.KICK_CHANNEL?.trim() || CHAT.channel).toLowerCase()
  if (cached?.slug === slug) return NextResponse.json({ chatroomId: cached.id })

  const id = await lookup(slug)
  if (id === null) {
    console.error(`[kick] could not resolve the chatroom of "${slug}" — set KICK_CHATROOM_ID`)
    return NextResponse.json({ error: `Chatroom of "${slug}" not found` }, { status: 502 })
  }
  cached = { slug, id }
  return NextResponse.json({ chatroomId: id })
}
