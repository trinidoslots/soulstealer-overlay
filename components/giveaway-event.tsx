"use client"

import { useRef } from "react"
import { clock } from "@/lib/format"
import type { Giveaway } from "@/lib/types"
import { Reveal } from "@/components/reveal"
import { useNow } from "@/components/use-poll"

/**
 * The giveaway as an event at the top of the chat column: it slides in when
 * the admin starts a round on soul-stealer.com and folds away once the round
 * is over. While idle it takes no space at all.
 */
export function GiveawayEvent({ giveaway }: { giveaway: Giveaway | null }) {
  const live = !!giveaway && giveaway.status !== "idle"
  // Keep drawing the last round while the card folds away, not an empty one.
  const last = useRef<Giveaway | null>(null)
  if (live) last.current = giveaway
  const shown = live ? giveaway : last.current

  return (
    <Reveal show={live}>
      {shown && (
        <div
          style={{
            padding: "14px 16px",
            marginBottom: 10,
            borderRadius: 10,
            border: "1px solid var(--red-line)",
            background: "linear-gradient(180deg, rgba(217, 21, 44, 0.08), rgba(217, 21, 44, 0.03))",
          }}
        >
          <Head giveaway={shown} />
          <div key={shown.status} className="fade-in">
            <Body giveaway={shown} />
          </div>
        </div>
      )}
    </Reveal>
  )
}

const STATE = { idle: "", open: "Live", closed: "Closed", rolling: "Drawing", finished: "Winner" } as const

function Head({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(1000)
  const ends = giveaway.endsAt ? Date.parse(giveaway.endsAt) : null
  const started = giveaway.startedAt ? Date.parse(giveaway.startedAt) : null
  const timer =
    giveaway.status !== "open" ? null : ends ? `Ends in ${clock(ends - now)}` : started ? clock(now - started) : null

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span className="dot pulse" />
      <span className="label" style={{ color: "var(--text)" }}>
        Giveaway · {STATE[giveaway.status]}
      </span>
      {timer && (
        <span className="tnum" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
          {timer}
        </span>
      )}
    </div>
  )
}

function Body({ giveaway }: { giveaway: Giveaway }) {
  const prize = giveaway.title ?? giveaway.prize ?? "Giveaway"

  if (giveaway.status === "rolling") return <Rolling giveaway={giveaway} />

  if (giveaway.status === "finished") {
    return (
      <div style={{ marginTop: 10 }}>
        <div className="truncate" style={{ fontSize: 22, fontWeight: 800 }}>
          {giveaway.winner}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>wins {prize}</div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div className="truncate" style={{ fontSize: 20, fontWeight: 700 }}>
        {prize}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", marginTop: 4, fontSize: 14, color: "var(--muted)" }}>
        {giveaway.status === "closed" ? (
          <span>Entries closed — drawing soon</span>
        ) : (
          <span>
            Type <b style={{ color: "var(--text)" }}>{giveaway.keyword ?? "!join"}</b> to enter
          </span>
        )}
        <span className="tnum" style={{ marginLeft: "auto" }}>
          <b style={{ color: "var(--text)" }}>{giveaway.entries.toLocaleString("en-US")}</b>{" "}
          {giveaway.entries === 1 ? "entry" : "entries"}
        </span>
      </div>
      <Countdown giveaway={giveaway} />
    </div>
  )
}

/** A hairline that runs down to the end time, when there is one. */
function Countdown({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(1000)
  const ends = giveaway.endsAt ? Date.parse(giveaway.endsAt) : NaN
  const started = giveaway.startedAt ? Date.parse(giveaway.startedAt) : NaN
  if (giveaway.status !== "open" || !(ends > started)) return null
  const left = Math.max(0, Math.min(1, (ends - now) / (ends - started)))
  return (
    <div style={{ height: 2, marginTop: 12, background: "var(--line-soft)", borderRadius: 1, overflow: "hidden" }}>
      <div style={{ width: `${left * 100}%`, height: "100%", background: "var(--red)", transition: "width 1s linear" }} />
    </div>
  )
}

/** Names flick past until the site settles on a winner. */
function Rolling({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(100)
  const names = giveaway.entrants.length ? giveaway.entrants : ["…"]
  return (
    <div style={{ marginTop: 10 }}>
      <div className="truncate" style={{ fontSize: 22, fontWeight: 800, opacity: 0.85 }}>
        {names[Math.floor(now / 100) % names.length]}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>
        drawing from {giveaway.entries.toLocaleString("en-US")} entries
      </div>
    </div>
  )
}
