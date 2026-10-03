"use client"

import type { CSSProperties } from "react"
import { TICKER, TICKER_SECONDS } from "@/lib/config"
import { useNow } from "@/components/use-poll"

/** The rotating promo card: one message at a time, with its chat command. */
export function TickerCard({ style }: { style: CSSProperties }) {
  const now = useNow(1000)
  const slot = Math.floor(now / (TICKER_SECONDS * 1000))
  const index = TICKER.length ? slot % TICKER.length : 0
  const item = TICKER[index]
  if (!item) return null

  return (
    <div className="card" style={{ ...style, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
      <div key={index} className="fade-in" style={{ flex: 1, minWidth: 0 }}>
        <div className="card-head" style={{ height: 16 }}>
          <span className="label-mark red" />
          <span className="label" style={{ fontSize: 10 }}>
            {item.kicker}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginTop: 6, hyphens: "none", textWrap: "balance" }}>
          {item.title}
        </div>
      </div>

      <div
        key={`cta-${index}`}
        className="fade-in"
        style={{
          flex: "none",
          padding: "9px 12px",
          borderRadius: 8,
          background: "linear-gradient(180deg, var(--red-bright), var(--red))",
          color: "#fff",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: "0.04em",
          boxShadow: "0 6px 18px var(--red-glow), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        {item.cta}
      </div>

      <div style={{ position: "absolute", left: 16, right: 16, bottom: 8, display: "flex", gap: 4 }}>
        {TICKER.map((_, dot) => (
          <span
            key={dot}
            style={{
              height: 2,
              flex: 1,
              borderRadius: 1,
              background: dot === index ? "var(--red)" : "rgba(255,255,255,0.07)",
              transition: "background 400ms ease",
            }}
          />
        ))}
      </div>
    </div>
  )
}
