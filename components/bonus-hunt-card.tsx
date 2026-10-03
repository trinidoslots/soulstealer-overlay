"use client"

import type { CSSProperties, ReactNode } from "react"
import { DEMO_HUNT } from "@/lib/demo"
import { money, multiplier, signedMoney } from "@/lib/format"
import type { Hunt, HuntResponse } from "@/lib/types"
import { ReaperMark } from "@/components/reaper-mark"
import { usePoll } from "@/components/use-poll"

const STATUS_LABEL = { collecting: "Collecting", opening: "Opening", completed: "Finished" } as const

/**
 * The current hunt from bonushunt.gg: four figures, the bonus being opened,
 * and how far through the hunt is. Polled every 10s — the API is shared with
 * the website and capped at 100 requests a minute.
 */
export function BonusHuntCard({ style, demo }: { style: CSSProperties; demo?: boolean }) {
  const data = usePoll<HuntResponse>("/api/bonushunt", 10_000, demo ? () => ({ hunt: DEMO_HUNT, configured: true }) : undefined)
  const hunt = data?.hunt ?? null

  return (
    <div
      className={`card${hunt?.status === "opening" ? " is-live" : ""}`}
      style={{ ...style, padding: 16, display: "flex", flexDirection: "column" }}
    >
      <div className="card-head">
        <span className="label-mark" />
        <span className="label">Bonus Hunt</span>
        {hunt && (
          <span className={`chip${hunt.status === "opening" ? " red" : ""}`}>
            {hunt.status === "opening" && <span className="live-dot" />}
            {STATUS_LABEL[hunt.status]}
          </span>
        )}
        {hunt && (
          <span className="truncate" style={{ marginLeft: "auto", fontSize: 12, color: "var(--dim)", fontWeight: 600 }}>
            {hunt.title}
          </span>
        )}
      </div>

      {hunt ? <HuntBody hunt={hunt} /> : <Idle />}
    </div>
  )
}

function HuntBody({ hunt }: { hunt: Hunt }) {
  const { stats } = hunt
  const finished = hunt.status === "completed"
  const progress = stats.count ? stats.opened / stats.count : 0

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 12 }}>
        <Stat label="Start">{money(hunt.startCost)}</Stat>
        <Stat label="Bonuses">
          {hunt.status === "collecting" ? stats.count : `${stats.opened}/${stats.count}`}
        </Stat>
        {finished ? (
          <Stat label="Result" tone={stats.profit >= 0 ? "up" : "down"}>
            {signedMoney(stats.profit)}
          </Stat>
        ) : (
          <Stat label="Won">{money(stats.totalWin)}</Stat>
        )}
        {finished ? (
          <Stat label="Avg">{multiplier(stats.averageX)}</Stat>
        ) : (
          <Stat label={stats.opened ? "BE live" : "Break even"} tone="red">
            {multiplier(stats.opened ? stats.breakEvenLive : stats.breakEvenStart)}
          </Stat>
        )}
      </div>

      <Current hunt={hunt} />

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              background: "linear-gradient(90deg, var(--red-deep), var(--red-bright))",
              transition: "width 800ms ease",
            }}
          />
        </div>
        <span className="tnum" style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
          {stats.best ? (
            <>
              Best <b style={{ color: "var(--text)" }}>{multiplier(stats.best.multiplier)}</b>
              <span style={{ color: "var(--dim)" }}> · </span>
            </>
          ) : null}
          Avg <b style={{ color: "var(--text)" }}>{multiplier(stats.averageX)}</b>
        </span>
      </div>
    </>
  )
}

/** The one bonus that matters right now, given a red edge. */
function Current({ hunt }: { hunt: Hunt }) {
  const finished = hunt.status === "completed"
  const bonus = finished ? hunt.stats.best : hunt.current
  const caption = finished ? "Best bonus" : hunt.status === "opening" ? "Now opening" : "Last added"
  if (!bonus) return <div style={{ height: 52, marginTop: 12 }} />

  return (
    <div
      key={bonus.id}
      className="fade-in"
      style={{
        marginTop: 12,
        height: 52,
        padding: "0 14px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        borderRadius: "var(--radius-sm)",
        background: "var(--surface-sunk)",
        border: "1px solid var(--line)",
        borderLeft: "2px solid var(--red)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
          {caption}
        </div>
        <div className="truncate" style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>
          {bonus.slot}
          {bonus.provider && (
            <span style={{ color: "var(--dim)", fontWeight: 500, fontSize: 12 }}> · {bonus.provider}</span>
          )}
        </div>
      </div>
      <div className="tnum" style={{ textAlign: "right", flex: "none" }}>
        <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
          Bet
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{money(bonus.bet)}</div>
      </div>
      {bonus.payout !== null && (
        <div className="tnum" style={{ textAlign: "right", flex: "none" }}>
          <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
            Win
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {money(bonus.payout)} <span style={{ color: "var(--red-bright)" }}>{multiplier(bonus.multiplier)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, children, tone }: { label: string; children: ReactNode; tone?: "up" | "down" | "red" }) {
  const color = tone === "down" || tone === "red" ? "var(--red-bright)" : "var(--text)"
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: "var(--radius-sm)",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid var(--line)",
        minWidth: 0,
      }}
    >
      <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
        {label}
      </div>
      <div className="tnum truncate" style={{ fontSize: 17, fontWeight: 800, marginTop: 3, color }}>
        {children}
      </div>
    </div>
  )
}

function Idle() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18, paddingLeft: 4 }}>
      <ReaperMark size={56} className="idle-mark" />
      <div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>No hunt running</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Every hunt and its results live on the website
        </div>
      </div>
    </div>
  )
}
