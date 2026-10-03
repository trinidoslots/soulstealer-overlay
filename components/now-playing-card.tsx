"use client"

import type { CSSProperties } from "react"
import { demoNowPlaying } from "@/lib/demo"
import { clock } from "@/lib/format"
import type { NowPlaying } from "@/lib/types"
import { useNow, usePoll } from "@/components/use-poll"

/**
 * The song on the streamer's Spotify. Cover, title, artist, and a progress bar
 * that runs on between polls so it moves smoothly rather than in 3s jumps.
 *
 * `hideIdle` is for the stand-alone widget: nothing playing, nothing drawn.
 * In the full scene the card stays and says so, so the layout keeps its shape.
 */
export function NowPlayingCard({
  style,
  demo,
  hideIdle = false,
}: {
  style: CSSProperties
  demo?: boolean
  hideIdle?: boolean
}) {
  const data = usePoll<NowPlaying>("/api/spotify/now-playing", 3000, demo ? demoNowPlaying : undefined)
  const now = useNow(500)
  const playing = data?.playing ? data : null

  if (!playing && hideIdle) return null

  const progress = playing
    ? Math.min(playing.durationMs, playing.progressMs + (now - playing.readAt))
    : 0
  const ratio = playing && playing.durationMs > 0 ? progress / playing.durationMs : 0

  return (
    <div className={`card${playing ? " is-live" : ""}`} style={{ ...style, padding: 14, display: "flex", gap: 14 }}>
      <Cover image={playing?.image ?? null} playing={!!playing} />

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div className="card-head" style={{ height: 16 }}>
          <span className="label" style={{ fontSize: 10 }}>
            {playing ? "Now playing" : "Spotify"}
          </span>
          {playing && <Equalizer />}
        </div>

        {playing ? (
          <div key={playing.title} className="fade-in" style={{ minWidth: 0 }}>
            <div className="truncate" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
              {playing.title}
            </div>
            <div className="truncate" style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>
              {playing.artists}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 14, color: "var(--dim)", fontWeight: 600 }}>Nothing playing</div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div
              style={{
                width: `${ratio * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--red-deep), var(--red-bright))",
                boxShadow: "0 0 8px var(--red-glow)",
                transition: "width 500ms linear",
              }}
            />
          </div>
          <span className="tnum" style={{ fontSize: 11, color: "var(--dim)", fontWeight: 600, minWidth: 64, textAlign: "right" }}>
            {playing ? `${clock(progress)} / ${clock(playing.durationMs)}` : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}

function Cover({ image, playing }: { image: string | null; playing: boolean }) {
  return (
    <div
      style={{
        width: 75,
        height: 75,
        flex: "none",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        background: "radial-gradient(circle at 30% 25%, #26262c, #0c0c0e)",
        border: "1px solid var(--line)",
        display: "grid",
        placeItems: "center",
        position: "relative",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" width={75} height={75} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <Disc spinning={playing} />
      )}
    </div>
  )
}

function Disc({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="46"
      height="46"
      viewBox="0 0 46 46"
      style={{ animation: spinning ? "spin 4s linear infinite" : undefined }}
      aria-hidden
    >
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
      <circle cx="23" cy="23" r="22" fill="#111114" stroke="rgba(255,255,255,0.08)" />
      <circle cx="23" cy="23" r="15" fill="none" stroke="rgba(255,255,255,0.05)" />
      <circle cx="23" cy="23" r="10" fill="none" stroke="rgba(255,255,255,0.05)" />
      <circle cx="23" cy="23" r="6" fill="var(--red)" />
      <circle cx="23" cy="23" r="1.6" fill="#0b0b0d" />
    </svg>
  )
}

function Equalizer() {
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 2, height: 10 }} aria-hidden>
      {[0, 0.25, 0.5, 0.15].map((delay, index) => (
        <span
          key={index}
          style={{
            width: 2,
            height: 10,
            background: "var(--red-bright)",
            transformOrigin: "bottom",
            animation: `eq 900ms ease-in-out ${delay}s infinite`,
          }}
        />
      ))}
    </span>
  )
}
