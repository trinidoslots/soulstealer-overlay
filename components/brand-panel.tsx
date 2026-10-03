"use client"

import { BRAND } from "@/lib/config"
import { at, LAYOUT } from "@/lib/layout"
import { NowPlayingLine, useNowPlaying } from "@/components/now-playing"
import { ReaperMark } from "@/components/reaper-mark"

/**
 * Bottom left on /overlay: who this is, and — only while Spotify is actually
 * playing — one quiet line saying what. Nothing playing, no line.
 */
export function BrandPanel({ demo }: { demo: boolean }) {
  const song = useNowPlaying(demo)

  return (
    <div className="panel" style={{ ...at(LAYOUT.side), padding: "0 28px", display: "flex", flexDirection: "column" }}>
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

      {song && (
        <div style={{ borderTop: "1px solid var(--line-soft)", padding: "16px 0 20px" }}>
          <NowPlayingLine song={song} />
        </div>
      )}
    </div>
  )
}
