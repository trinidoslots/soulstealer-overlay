"use client"

import { BRAND } from "@/lib/config"
import { DEMO_NOW_PLAYING } from "@/lib/demo"
import { at, LAYOUT } from "@/lib/layout"
import type { NowPlaying } from "@/lib/types"
import { ReaperMark } from "@/components/reaper-mark"
import { usePoll } from "@/components/use-poll"

/**
 * Bottom left: who this is, and — only while Spotify is actually playing —
 * one quiet line saying what. Nothing playing, no line.
 */
export function BrandPanel({ demo }: { demo: boolean }) {
  const song = usePoll<NowPlaying>("/api/spotify/now-playing", 4000, demo ? () => DEMO_NOW_PLAYING : undefined)
  const playing = song?.playing ? song : null

  return (
    <div className="panel" style={{ ...at(LAYOUT.brand), padding: "0 28px", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 }}>
        {BRAND.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={BRAND.logo} alt="" width={44} height={44} style={{ objectFit: "contain" }} />
        ) : (
          <ReaperMark size={40} />
        )}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-brand)",
              fontWeight: 700,
              fontSize: 25,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {BRAND.name}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, letterSpacing: "0.04em" }}>{BRAND.site}</div>
        </div>
      </div>

      {playing && (
        <div
          key={playing.title}
          className="fade-in"
          style={{ borderTop: "1px solid var(--line-soft)", padding: "16px 0 20px", minWidth: 0 }}
        >
          <div className="label">Now playing</div>
          <div className="truncate" style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>
            {playing.title}
            {playing.artists && <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {playing.artists}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
