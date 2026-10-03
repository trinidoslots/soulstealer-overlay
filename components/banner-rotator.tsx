"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { BANNER_SECONDS, BANNERS, type Banner } from "@/lib/config"
import { useNow } from "@/components/use-poll"

/**
 * The rotating banner. `size` picks the typography for text banners: "lg" is
 * the 912x234 slot on /overlay, "sm" the strip at the top of the chat column
 * on /overlay/hunt. Image banners are fitted, never cropped, at either size.
 */
export function BannerRotator({ style, size }: { style: CSSProperties; size: "lg" | "sm" }) {
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
          <BannerFace banner={BANNERS[previous]} size={size} />
        </div>
      )}
      <div className="banner-layer front" key={`f-${current}`}>
        <BannerFace banner={BANNERS[current]} size={size} />
      </div>
    </div>
  )
}

function BannerFace({ banner, size }: { banner: Banner; size: "lg" | "sm" }) {
  if ("image" in banner) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={banner.image} alt={banner.alt} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
    )
  }

  const lg = size === "lg"
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: lg ? 40 : 14,
        padding: lg ? "0 48px" : "0 18px",
        background: "linear-gradient(90deg, transparent 55%, rgba(217, 21, 44, 0.07))",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="label" style={{ fontSize: lg ? 11 : 9, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="dot" style={{ width: lg ? 6 : 5, height: lg ? 6 : 5 }} />
          {banner.kicker}
        </div>
        <div
          style={{
            fontSize: lg ? 34 : 16,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
            marginTop: lg ? 14 : 6,
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
            padding: lg ? "12px 20px" : "6px 10px",
            borderRadius: lg ? 10 : 7,
            border: "1px solid var(--red-line)",
            background: "var(--red-soft)",
            fontSize: lg ? 18 : 12,
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
