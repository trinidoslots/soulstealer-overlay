"use client"

import { BRAND } from "@/lib/config"
import { at, LAYOUT } from "@/lib/layout"
import { ReaperMark } from "@/components/reaper-mark"

/** Bottom left on /overlay: who this is. */
export function BrandPanel() {
  return (
    <div className="panel" style={{ ...at(LAYOUT.side), padding: "0 32px", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 18 }}>
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
    </div>
  )
}
