"use client"

import { CHAT } from "@/lib/config"
import { demoChat, demoGiveaway } from "@/lib/demo"
import { emoteUrl, parseContent, type KickMessage } from "@/lib/kick"
import { at, CHAT_PAD, LAYOUT } from "@/lib/layout"
import type { GiveawayResponse } from "@/lib/types"
import { BannerRotator } from "@/components/banner-rotator"
import { GiveawayEvent } from "@/components/giveaway-event"
import { useKickChat } from "@/components/use-kick-chat"
import { useNow, usePoll } from "@/components/use-poll"

const BADGES = new Set(["broadcaster", "moderator", "vip", "subscriber", "og", "verified", "staff"])

/** Same shape as the 912x234 slot, so one banner file fits both. */
const SMALL_BANNER = { w: LAYOUT.chat.w - CHAT_PAD * 2, h: Math.round(((LAYOUT.chat.w - CHAT_PAD * 2) * 234) / 912) }

/**
 * The right-hand column: events on top, Kick chat filling the rest — the
 * layout of the Trinido stream column. Events push the chat down while they
 * are on, and give the space back when they end.
 */
export function ChatColumn({ demo, banner }: { demo: boolean; banner: boolean }) {
  const data = usePoll<GiveawayResponse>("/api/giveaway", 2000, demo ? () => ({ giveaway: demoGiveaway(), configured: true }) : undefined)
  const live = useKickChat(!demo)
  const tick = useNow(demo ? 500 : 60_000)
  const messages = demo ? demoChat(tick) : live

  return (
    <div className="panel" style={{ ...at(LAYOUT.chat), padding: CHAT_PAD, display: "flex", flexDirection: "column" }}>
      {banner && (
        <div style={{ position: "relative", flex: "none", height: SMALL_BANNER.h, marginBottom: 10 }}>
          <BannerRotator size="sm" style={{ left: 0, top: 0, width: SMALL_BANNER.w, height: SMALL_BANNER.h }} />
        </div>
      )}

      <GiveawayEvent giveaway={data?.giveaway ?? null} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
          // Older lines fade out at the top instead of being cut through.
          maskImage: "linear-gradient(transparent, black 56px)",
          WebkitMaskImage: "linear-gradient(transparent, black 56px)",
        }}
      >
        {messages.map((message) => (
          <ChatLine key={message.id} message={message} />
        ))}
      </div>
    </div>
  )
}

function ChatLine({ message }: { message: KickMessage }) {
  const nameColor = CHAT.nameColors ? message.color : message.isMod ? "var(--red)" : "var(--text)"
  return (
    <div className="chat-line">
      {message.badges
        .filter((badge) => BADGES.has(badge.type))
        .map((badge, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} className="badge" src={`/kick-badges/${badge.type}.svg`} alt={badge.type} />
        ))}
      <b style={{ color: nameColor, fontWeight: 700 }}>{message.username}</b>
      <span style={{ color: "var(--dim)" }}>: </span>
      {parseContent(message.content).map((part, index) =>
        part.kind === "text" ? (
          <span key={index}>{part.text}</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={index} className="emote" src={emoteUrl(part.id)} alt={part.name} />
        ),
      )}
    </div>
  )
}
