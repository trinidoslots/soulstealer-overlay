"use client"

import { useRef } from "react"
import { CHAT } from "@/lib/config"
import { demoChat, demoGiveaway } from "@/lib/demo"
import { emoteUrl, parseContent, type KickMessage } from "@/lib/kick"
import { at, CHAT_PAD, LAYOUT } from "@/lib/layout"
import type { GiveawayResponse } from "@/lib/types"
import { GiveawayEvent } from "@/components/giveaway-event"
import { NowPlayingLine, useNowPlaying } from "@/components/now-playing"
import { Reveal } from "@/components/reveal"
import { useKickChat } from "@/components/use-kick-chat"
import { useNow, usePoll } from "@/components/use-poll"

const BADGES = new Set(["broadcaster", "moderator", "vip", "subscriber", "og", "verified", "staff"])

/**
 * The right-hand column: events on top, Kick chat filling the rest — the
 * layout of the Trinido stream column. Events push the chat down while they
 * are on, and give the space back when they end.
 *
 * `nowPlaying` is for /overlay/hunt, where the hunt has taken the brand
 * panel's place: the song then sits at the top of the column instead.
 */
export function ChatColumn({ demo, nowPlaying }: { demo: boolean; nowPlaying: boolean }) {
  const data = usePoll<GiveawayResponse>("/api/giveaway", 2000, demo ? () => ({ giveaway: demoGiveaway(), configured: true }) : undefined)
  const live = useKickChat(!demo)
  const tick = useNow(demo ? 500 : 60_000)
  const messages = demo ? demoChat(tick) : live
  const song = useNowPlaying(demo)
  // Keep drawing the last song while its card folds away, not an empty card.
  const lastSong = useRef(song)
  if (song) lastSong.current = song

  return (
    <div className="panel" style={{ ...at(LAYOUT.chat), padding: CHAT_PAD, display: "flex", flexDirection: "column" }}>
      {nowPlaying && (
        <Reveal show={!!song}>
          {lastSong.current && (
            <div style={{ padding: "12px 14px", marginBottom: 10, borderRadius: 10, background: "var(--sunk)", border: "1px solid var(--line-soft)" }}>
              <NowPlayingLine song={lastSong.current} />
            </div>
          )}
        </Reveal>
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
