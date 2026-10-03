"use client"

import type { ReactNode } from "react"
import { DEMO_HUNT } from "@/lib/demo"
import { at, LAYOUT } from "@/lib/layout"
import { money, multiplier, signedMoney } from "@/lib/format"
import type { Hunt, HuntBonus, HuntResponse } from "@/lib/types"
import { usePoll } from "@/components/use-poll"

const STATUS = { collecting: "Collecting", opening: "Opening", completed: "Finished" } as const
const ROWS = 4

/**
 * The bonus hunt, bottom left on /overlay/hunt: three figures, then four
 * bonuses — while opening, the one before, the one being opened and the next
 * two, so the list moves along by itself as the hunt goes on.
 */
export function HuntPanel({ demo }: { demo: boolean }) {
  const data = usePoll<HuntResponse>("/api/bonushunt", 10_000, demo ? () => ({ hunt: DEMO_HUNT, configured: true }) : undefined)
  const hunt = data?.hunt ?? null

  return (
    <div className="panel" style={{ ...at(LAYOUT.side), padding: "18px 22px", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 14 }}>
        {hunt?.status === "opening" && <span className="dot pulse" />}
        <span className="label">Bonus Hunt{hunt ? ` · ${STATUS[hunt.status]}` : ""}</span>
        {hunt && (
          <span className="tnum" style={{ marginLeft: "auto", fontSize: 12, color: "var(--muted)" }}>
            {hunt.status === "collecting" ? `${hunt.stats.count} bonuses` : `${hunt.stats.opened} / ${hunt.stats.count}`}
          </span>
        )}
      </div>

      {hunt ? (
        <>
          <Stats hunt={hunt} />
          <List hunt={hunt} />
        </>
      ) : (
        <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          No hunt yet
        </div>
      )}
    </div>
  )
}

function Stats({ hunt }: { hunt: Hunt }) {
  const { stats } = hunt
  const finished = hunt.status === "completed"
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
      <Stat label="Start">{money(hunt.startCost)}</Stat>
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
    <div style={{ minWidth: 0 }}>
      <div className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
        {label}
      </div>
      <div className="tnum truncate" style={{ fontSize: 18, fontWeight: 700, marginTop: 4, color: red ? "var(--red)" : "var(--text)" }}>
        {children}
      </div>
    </div>
  )
}

/** Which rows to show, and which of them to mark. */
function windowOf(hunt: Hunt): { rows: { bonus: HuntBonus; number: number }[]; marked: string | null } {
  const numbered = hunt.bonuses.map((bonus, index) => ({ bonus, number: index + 1 }))
  if (hunt.status === "completed") {
    const best = [...numbered].sort((a, b) => (b.bonus.multiplier ?? -1) - (a.bonus.multiplier ?? -1))
    return { rows: best.slice(0, ROWS), marked: hunt.stats.best?.id ?? null }
  }
  if (hunt.status === "collecting") return { rows: numbered.slice(-ROWS), marked: null }

  const index = Math.max(0, numbered.findIndex((row) => row.bonus.id === hunt.current?.id))
  const start = Math.max(0, Math.min(index - 1, numbered.length - ROWS))
  return { rows: numbered.slice(start, start + ROWS), marked: hunt.current?.id ?? null }
}

function List({ hunt }: { hunt: Hunt }) {
  const { rows, marked } = windowOf(hunt)
  const columns = "26px 1fr 58px 66px"

  return (
    <div style={{ marginTop: 14 }}>
      {rows.map(({ bonus, number }) => {
        const current = bonus.id === marked
        const open = bonus.payout === null
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
              color: open && !current ? "var(--muted)" : "var(--text)",
              fontWeight: current ? 700 : 500,
            }}
          >
            <span style={{ color: current ? "var(--red)" : "var(--dim)" }}>{number}</span>
            <span className="truncate" style={{ paddingRight: 10 }}>
              {bonus.slot}
            </span>
            <span style={{ textAlign: "right", color: "var(--muted)", fontWeight: 500 }}>{money(bonus.bet)}</span>
            <span style={{ textAlign: "right", color: current && open ? "var(--red)" : undefined }}>
              {current && open && hunt.status === "opening" ? (
                <span className="label" style={{ fontSize: 9, color: "var(--red)" }}>
                  Now
                </span>
              ) : open ? (
                "—"
              ) : (
                multiplier(bonus.multiplier)
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}
