/**
 * Reading Kick chat: the same public Pusher app Kick's own web client uses.
 * Shapes and emote syntax live here so the hook and the feed agree.
 */

export const KICK_PUSHER_URL =
  "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0&flash=false"

export type KickBadge = { type: string; text?: string; count?: number }

export type KickMessage = {
  id: string
  username: string
  content: string
  color: string
  badges: KickBadge[]
  isMod: boolean
}

export type KickChatPayload = {
  id?: string
  content?: string
  sender?: { username?: string; identity?: { color?: string; badges?: KickBadge[] } }
}

const MOD_TYPES = new Set(["moderator", "broadcaster"])

export function toMessage(payload: KickChatPayload, fallbackId: string): KickMessage {
  const badges = payload.sender?.identity?.badges ?? []
  return {
    id: payload.id ?? fallbackId,
    username: payload.sender?.username ?? "unknown",
    content: payload.content ?? "",
    color: payload.sender?.identity?.color || "#ffffff",
    badges,
    isMod: badges.some((badge) => MOD_TYPES.has(badge.type)),
  }
}

/** Kick sends emotes inline as "[emote:553704:name]", never as the image. */
const EMOTE = /\[(?:emote|emoji):(\d+):([^\]]+)\]/g

export type ContentPart = { kind: "text"; text: string } | { kind: "emote"; id: string; name: string }

export function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = []
  let last = 0
  for (const match of content.matchAll(EMOTE)) {
    const index = match.index ?? 0
    if (index > last) parts.push({ kind: "text", text: content.slice(last, index) })
    parts.push({ kind: "emote", id: match[1], name: match[2] })
    last = index + match[0].length
  }
  if (last < content.length) parts.push({ kind: "text", text: content.slice(last) })
  return parts
}

export const emoteUrl = (id: string) => `https://files.kick.com/emotes/${id}/fullsize`
