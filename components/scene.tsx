import { BRAND } from "@/lib/config"
import { CANVAS, HOLES, LAYOUT, at, type Rect } from "@/lib/layout"
import { ReaperMark } from "@/components/reaper-mark"

const R = 14 // matches --radius

/** A rounded rectangle as an SVG subpath, for cutting holes in the plate. */
function roundedRect({ x, y, w, h }: Rect, r = R) {
  return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`
}

/**
 * The dark background with game, cam and chat cut out of it.
 *
 * Because the holes are real holes, the overlay can sit on TOP of the game,
 * cam and chat sources in OBS — they show through, and nothing has to be
 * cropped to fit behind a frame.
 */
/** The canvas minus the holes, as one even-odd path. */
const PLATE_PATH = `M0,0H${CANVAS.w}V${CANVAS.h}H0Z` + HOLES.map((rect) => roundedRect(rect)).join("")

export function Plate() {
  return (
    <svg
      width={CANVAS.w}
      height={CANVAS.h}
      viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <defs>
        <radialGradient id="glow-bottom" cx="0.38" cy="1.05" r="0.75">
          <stop offset="0" stopColor="#3a0710" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#16070a" stopOpacity="0.6" />
          <stop offset="1" stopColor="#070708" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="glow-top" cx="0.95" cy="-0.1" r="0.55">
          <stop offset="0" stopColor="#2a0509" stopOpacity="0.7" />
          <stop offset="1" stopColor="#070708" stopOpacity="0" />
        </radialGradient>
        <pattern id="grain" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="rgba(255,255,255,0.018)" />
          <rect x="2" y="2" width="1" height="1" fill="rgba(255,255,255,0.012)" />
        </pattern>
        <clipPath id="plate-clip">
          <path d={PLATE_PATH} clipRule="evenodd" />
        </clipPath>
      </defs>
      <g clipPath="url(#plate-clip)">
        <rect width={CANVAS.w} height={CANVAS.h} fill="var(--ground)" />
        <rect width={CANVAS.w} height={CANVAS.h} fill="url(#glow-bottom)" />
        <rect width={CANVAS.w} height={CANVAS.h} fill="url(#glow-top)" />
        <rect width={CANVAS.w} height={CANVAS.h} fill="url(#grain)" />
      </g>
    </svg>
  )
}

/**
 * Slow red specks drifting up the background — souls, if you like. Fixed
 * positions rather than random so server and client render the same thing.
 */
export function Embers({ count = 22 }: { count?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Kept off the game, cam and chat — specks drifting over gameplay look like dead pixels.
        clipPath: `path(evenodd, "${PLATE_PATH}")`,
      }}
      aria-hidden
    >
      {Array.from({ length: count }, (_, i) => {
        const seed = (i * 7919) % 997
        return (
          <span
            key={i}
            className="ember"
            style={
              {
                left: `${(seed * 13) % 100}%`,
                animationDuration: `${14 + (seed % 12)}s`,
                animationDelay: `-${(seed * 3) % 26}s`,
                width: 2 + (seed % 3),
                height: 2 + (seed % 3),
                "--o": 0.25 + (seed % 5) / 14,
                "--drift": `${(seed % 80) - 40}px`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

/** Hairline frame with red corner brackets around a hole. */
export function Frame({ rect, tag, live }: { rect: Rect; tag?: string; live?: boolean }) {
  return (
    <div className="frame" style={at(rect)}>
      <span className="frame-corner tl" />
      <span className="frame-corner tr" />
      <span className="frame-corner bl" />
      <span className="frame-corner br" />
      {tag && (
        <span className="frame-tag">
          {live && <span className="live-dot" />}
          {tag}
        </span>
      )}
    </div>
  )
}

/** Wordmark and site address above the cam. */
export function BrandBar() {
  return (
    <div className="card" style={{ ...at(LAYOUT.brand), display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
      {BRAND.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={BRAND.logo} alt="" width={30} height={30} style={{ objectFit: "contain" }} />
      ) : (
        <ReaperMark size={28} />
      )}
      <span
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: 21,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          lineHeight: 1,
          paddingTop: 2,
        }}
      >
        {BRAND.name}
      </span>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span className="live-dot" />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.02em" }}>{BRAND.site}</span>
      </span>
    </div>
  )
}
