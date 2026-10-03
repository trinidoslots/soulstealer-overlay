"use client"

import type { ReactNode } from "react"
import { DEMO_HUNT } from "@/lib/demo"
import { at, LAYOUT } from "@/lib/layout"
import { money, multiplier, signedMoney } from "@/lib/format"
import type { Hunt, HuntBonus, HuntResponse } from "@/lib/types"
import { usePoll } from "@/components/use-poll"

const STATUS = { collecting: "Collecting", opening: "Opening", completed: "Finished" } as const
const ROWS = 5

/**
 * The bonus hunt on /overlay/hunt: four figures on the left, the bonuses on
 * the right — a window of five around the one being opened, so the list moves
 * along by itself as the hunt goes on.
 */
export function HuntPanel({ demo }: { demo: boolean }) {
  const data = usePoll<HuntResponse>("/api/bonushunt", 10_000, demo ? () => ({ hunt: DEMO_HUNT, configured: true }) : undefined)
  const hunt = data?.hunt ?? null

  return (
    <div className="panel" style={{ ...at(LAYOUT.feature), padding: "20px 24px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 14 }}>
        {hunt?.status === "opening" && <span className="dot pulse" />}
        <span className="label">Bonus Hunt{hunt ? ` · ${STATUS[hunt.status]}` : ""}</span>
        {hunt && (
          <span className="truncate" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
            {hunt.title}
            {hunt.casino ? ` · ${hunt.casino}` : ""}
          </span>
        )}
      </div>

      {hunt ? (
        <div style={{ flex: 1, display: "flex", gap: 28, marginTop: 16, minHeight: 0 }}>
          <Stats hunt={hunt} />
          <List hunt={hunt} />
        </div>
      ) : (
        <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 14 }}>
          No hunt yet — it appears here as soon as one is created on bonushunt.gg
        </div>
      )}
    </div>
  )
}

function Stats({ hunt }: { hunt: Hunt }) {
  const { stats } = hunt
  const finished = hunt.status === "completed"
  return (
    <div style={{ width: 220, flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <Stat label="Start">{money(hunt.startCost)}</Stat>
      <Stat label="Bonuses">{hunt.status === "collecting" ? stats.count : `${stats.opened} / ${stats.count}`}</Stat>
      {finished ? (
        <Stat label="Result" red={stats.profit < 0}>
          {signedMoney(stats.profit)}
        </Stat>
      ) : (
        <Stat label="Won">{money(stats.totalWin)}</Stat>
      )}
      {finished ? (
        <Stat label="Average">{multiplier(stats.averageX)}</Stat>
      ) : (
        <Stat label="Break even" red>
          {multiplier(stats.opened ? stats.breakEvenLive : stats.breakEvenStart)}
        </Stat>
      )}
    </div>
  )
}

function Stat({ label, children, red }: { label: string; children: ReactNode; red?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
      <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>
      <span className="tnum" style={{ fontSize: 18, fontWeight: 700, color: red ? "var(--red)" : "var(--text)" }}>
        {children}
      </span>
    </div>
  )
}

/** Which five rows to show, and which of them to mark. */
function windowOf(hunt: Hunt): { rows: { bonus: HuntBonus; number: number }[]; marked: string | null } {
  const numbered = hunt.bonuses.map((bonus, index) => ({ bonus, number: index + 1 }))
  if (hunt.status === "completed") {
    const best = [...numbered].sort((a, b) => (b.bonus.multiplier ?? -1) - (a.bonus.multiplier ?? -1))
    return { rows: best.slice(0, ROWS), marked: hunt.stats.best?.id ?? null }
  }
  if (hunt.status === "collecting") return { rows: numbered.slice(-ROWS), marked: null }

  const at = Math.max(0, numbered.findIndex((row) => row.bonus.id === hunt.current?.id))
  const start = Math.max(0, Math.min(at - 1, numbered.length - ROWS))
  return { rows: numbered.slice(start, start + ROWS), marked: hunt.current?.id ?? null }
}

function List({ hunt }: { hunt: Hunt }) {
  const { rows, marked } = windowOf(hunt)
  const columns = "36px 1fr 80px 96px 76px"

  return (
    <div style={{ flex: 1, minWidth: 0, borderLeft: "1px solid var(--line-soft)", paddingLeft: 28 }}>
      <div
        className="label"
        style={{ display: "grid", gridTemplateColumns: columns, fontSize: 9, color: "var(--dim)", paddingBottom: 6 }}
      >
        <span>#</span>
        <span>{hunt.status === "completed" ? "Best bonuses" : "Slot"}</span>
        <span style={{ textAlign: "right" }}>Bet</span>
        <span style={{ textAlign: "right" }}>Win</span>
        <span style={{ textAlign: "right" }}>Multi</span>
      </div>
      {rows.map(({ bonus, number }) => {
        const current = bonus.id === marked
        return (
          <div
            key={bonus.id}
            className="tnum"
            style={{
              display: "grid",
              gridTemplateColumns: columns,
              alignItems: "center",
              height: 28,
              fontSize: 14,
              borderTop: "1px solid var(--line-soft)",
              color: bonus.payout === null && !current ? "var(--muted)" : "var(--text)",
              fontWeight: current ? 700 : 500,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: current ? "var(--red)" : "var(--dim)" }}>
              {number}
            </span>
            <span className="truncate" style={{ paddingRight: 12 }}>
              {bonus.slot}
              {current && hunt.status === "opening" && (
                <span className="label" style={{ fontSize: 9, color: "var(--red)", marginLeft: 10 }}>
                  Now
                </span>
              )}
            </span>
            <span style={{ textAlign: "right" }}>{money(bonus.bet)}</span>
            <span style={{ textAlign: "right" }}>{bonus.payout === null ? "—" : money(bonus.payout)}</span>
            <span style={{ textAlign: "right" }}>{bonus.payout === null ? "—" : multiplier(bonus.multiplier)}</span>
          </div>
        )
      })}
    </div>
  )
}
