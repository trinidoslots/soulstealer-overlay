"use client"

import { useMemo, type CSSProperties } from "react"
import { BRAND } from "@/lib/config"
import { demoGiveaway } from "@/lib/demo"
import { clock } from "@/lib/format"
import type { Giveaway, GiveawayResponse } from "@/lib/types"
import { ReaperMark } from "@/components/reaper-mark"
import { useNow, usePoll } from "@/components/use-poll"

/**
 * The round from the giveaway module on soul-stealer.com.
 *
 *   idle      quiet card, nothing to do
 *   open      prize, the chat command, entries, time left (or running)
 *   closed    entries locked, waiting for the draw
 *   rolling   names flicker past until the site picks the winner
 *   finished  the winner, large
 *
 * The card never says anything meant for the admin — that is what made the
 * old overlay put "start a giveaway from admin" on stream.
 */
export function GiveawayCard({ style, demo }: { style: CSSProperties; demo?: boolean }) {
  const data = usePoll<GiveawayResponse>(
    "/api/giveaway",
    2000,
    demo ? () => ({ giveaway: demoGiveaway(), configured: true }) : undefined,
  )
  const giveaway = data?.giveaway
  const status = giveaway?.status ?? "idle"
  const live = status !== "idle"

  return (
    <div className={`card${live ? " is-live" : ""}`} style={{ ...style, padding: 16, display: "flex", flexDirection: "column" }}>
      <div className="card-head">
        <span className="label-mark" />
        <span className="label">Giveaway</span>
        {status === "open" && (
          <span className="chip red">
            <span className="live-dot" /> Live
          </span>
        )}
        {status === "closed" && <span className="chip">Closed</span>}
        {status === "rolling" && <span className="chip red">Drawing</span>}
        {status === "finished" && <span className="chip red">Winner</span>}
        {giveaway && status === "open" && <Timer giveaway={giveaway} />}
      </div>

      <div key={status} className="fade-in" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {!giveaway || status === "idle" ? (
          <Idle />
        ) : status === "rolling" ? (
          <Rolling giveaway={giveaway} />
        ) : status === "finished" ? (
          <Winner giveaway={giveaway} />
        ) : (
          <Open giveaway={giveaway} />
        )}
      </div>
    </div>
  )
}

function prizeOf(giveaway: Giveaway) {
  return giveaway.title ?? giveaway.prize ?? "Giveaway"
}

function Timer({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(1000)
  const ends = giveaway.endsAt ? new Date(giveaway.endsAt).getTime() : null
  const started = giveaway.startedAt ? new Date(giveaway.startedAt).getTime() : null
  const text = ends ? clock(ends - now) : started ? clock(now - started) : null
  if (!text) return null
  return (
    <span className="tnum" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
      {ends ? "Ends in " : ""}
      <span style={{ color: "var(--text)" }}>{text}</span>
    </span>
  )
}

function Open({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(1000)
  const ends = giveaway.endsAt ? new Date(giveaway.endsAt).getTime() : null
  const started = giveaway.startedAt ? new Date(giveaway.startedAt).getTime() : null
  const left = ends && started && ends > started ? Math.max(0, Math.min(1, (ends - now) / (ends - started))) : null

  return (
    <>
      <div className="truncate" style={{ fontSize: 26, fontWeight: 800, marginTop: 14, letterSpacing: "-0.01em" }}>
        {prizeOf(giveaway)}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(224, 20, 44, 0.12)",
            border: "1px solid var(--red-line)",
          }}
        >
          <div className="label" style={{ fontSize: 9, color: "rgba(255,255,255,0.55)" }}>
            {giveaway.status === "closed" ? "Entries closed" : "Type in chat"}
          </div>
          <div className="truncate" style={{ fontSize: 22, fontWeight: 800, marginTop: 2, color: "#fff" }}>
            {giveaway.keyword ?? "!join"}
          </div>
        </div>
        <div
          style={{
            width: 104,
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            background: "rgba(255,255,255,0.025)",
            border: "1px solid var(--line)",
          }}
        >
          <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
            Entries
          </div>
          <div key={giveaway.entries} className="tnum fade-in" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>
            {giveaway.entries.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <div style={{ marginTop: "auto", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
        <div
          style={{
            width: `${(left ?? 1) * 100}%`,
            height: "100%",
            background:
              left === null
                ? "repeating-linear-gradient(90deg, var(--red) 0 12px, transparent 12px 20px)"
                : "linear-gradient(90deg, var(--red-deep), var(--red-bright))",
            opacity: left === null ? 0.5 : 1,
            transition: "width 1s linear",
          }}
        />
      </div>
    </>
  )
}

/** A name every 90ms out of the entrants, until the site settles on one. */
function Rolling({ giveaway }: { giveaway: Giveaway }) {
  const now = useNow(90)
  const names = useMemo(() => (giveaway.entrants.length ? giveaway.entrants : ["· · ·"]), [giveaway.entrants])
  const name = names[Math.floor(now / 90) % names.length]

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <div className="label" style={{ fontSize: 10 }}>
        Drawing from {giveaway.entries.toLocaleString("en-US")} entries
      </div>
      <div
        className="truncate"
        style={{
          maxWidth: "100%",
          fontSize: 30,
          fontWeight: 800,
          marginTop: 10,
          color: "var(--text)",
          filter: "blur(0.4px)",
          opacity: 0.9,
        }}
      >
        {name}
      </div>
      <div className="label" style={{ fontSize: 10, marginTop: 10, color: "var(--dim)" }}>
        {prizeOf(giveaway)}
      </div>
    </div>
  )
}

function Winner({ giveaway }: { giveaway: Giveaway }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", position: "relative" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-20px -16px -16px",
          background: "radial-gradient(ellipse at 50% 55%, rgba(224,20,44,0.28), transparent 65%)",
        }}
      />
      <ReaperMark size={30} />
      <div
        className="truncate"
        style={{
          position: "relative",
          maxWidth: "100%",
          fontSize: 32,
          fontWeight: 900,
          marginTop: 8,
          color: "#fff",
          textShadow: "0 0 24px var(--red-glow)",
        }}
      >
        {giveaway.winner}
      </div>
      <div className="label" style={{ position: "relative", fontSize: 10, marginTop: 8, color: "var(--muted)" }}>
        wins {prizeOf(giveaway)}
      </div>
    </div>
  )
}

function Idle() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <ReaperMark size={44} className="idle-mark" />
      <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>{BRAND.giveawayIdle.title}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>{BRAND.giveawayIdle.subtitle}</div>
    </div>
  )
}
