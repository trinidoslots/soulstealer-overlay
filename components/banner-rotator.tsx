"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { BANNER_SECONDS, BANNERS, type Banner } from "@/lib/config"
import { useNow } from "@/components/use-poll"

/** The rotating banner. Image banners are fitted, never cropped. */
export function BannerRotator({ style }: { style: CSSProperties }) {
  const now = useNow(1000)
  const index = BANNERS.length ? Math.floor(now / (BANNER_SECONDS * 1000)) % BANNERS.length : 0
  const [previous, setPrevious] = useState(index)
  const [current, setCurrent] = useState(index)

  useEffect(() => {
    if (index === current) return
    setPrevious(current)
    setCurrent(index)
    // Preload the one after, so its swap never waits on the network.
    const next = BANNERS[(index + 1) % BANNERS.length]
    if (next && "image" in next) new Image().src = next.image
  }, [index, current])

  if (!BANNERS.length) return null

  return (
    <div className="panel" style={{ ...style, background: "var(--panel)" }}>
      {previous !== current && (
        <div className="banner-layer" key={`b-${previous}`}>
          <BannerFace banner={BANNERS[previous]} />
        </div>
      )}
      <div className="banner-layer front" key={`f-${current}`}>
        <BannerFace banner={BANNERS[current]} />
      </div>
    </div>
  )
}

function BannerFace({ banner }: { banner: Banner }) {
  if ("image" in banner) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={banner.image} alt={banner.alt} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    )
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 40,
        padding: "0 48px",
        background: "linear-gradient(90deg, transparent 55%, rgba(217, 21, 44, 0.07))",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot" style={{ width: 6, height: 6 }} />
          {banner.kicker}
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            marginTop: 14,
            textWrap: "balance",
          }}
        >
          {banner.title}
        </div>
      </div>
      {banner.cta && (
        <div
          style={{
            flex: "none",
            padding: "12px 20px",
            borderRadius: 10,
            border: "1px solid var(--red-line)",
            background: "var(--red-soft)",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          {banner.cta}
        </div>
      )}
    </div>
  )
}
