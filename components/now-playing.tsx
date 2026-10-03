"use client"

import { DEMO_NOW_PLAYING } from "@/lib/demo"
import type { NowPlaying } from "@/lib/types"
import { usePoll } from "@/components/use-poll"

/** What Spotify is playing, or null while it is paused or closed. */
export function useNowPlaying(demo: boolean) {
  const song = usePoll<NowPlaying>("/api/spotify/now-playing", 4000, demo ? () => DEMO_NOW_PLAYING : undefined)
  return song?.playing ? song : null
}

/** "NOW PLAYING" over "Title — Artist". */
export function NowPlayingLine({ song }: { song: Extract<NowPlaying, { playing: true }> }) {
  return (
    <div key={song.title} className="fade-in" style={{ minWidth: 0 }}>
      <div className="label">Now playing</div>
      <div className="truncate" style={{ fontSize: 15, fontWeight: 600, marginTop: 6 }}>
        {song.title}
        {song.artists && <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {song.artists}</span>}
      </div>
    </div>
  )
}
