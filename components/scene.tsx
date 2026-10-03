import { CANVAS, HOLES, at, type Rect } from "@/lib/layout"

const R = 12 // matches --radius

/** A rounded rectangle as an SVG subpath, for cutting holes in the plate. */
function roundedRect({ x, y, w, h }: Rect, r = R) {
  return `M${x + r},${y}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${y + r}V${y + h - r}A${r},${r} 0 0 1 ${x + w - r},${y + h}H${x + r}A${r},${r} 0 0 1 ${x},${y + h - r}V${y + r}A${r},${r} 0 0 1 ${x + r},${y}Z`
}

const PLATE_PATH = `M0,0H${CANVAS.w}V${CANVAS.h}H0Z` + HOLES.map((rect) => roundedRect(rect)).join("")

/**
 * The dark background with game and cam cut out of it. The holes are real,
 * so the overlay sits on TOP of those two sources in OBS and they show through.
 * One flat colour and the faintest warmth along the bottom edge — no more.
 */
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
        <radialGradient id="warmth" cx="0.5" cy="1.15" r="0.8">
          <stop offset="0" stopColor="#2a070c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0a0a0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={PLATE_PATH} fillRule="evenodd" fill="var(--ground)" />
      <path d={PLATE_PATH} fillRule="evenodd" fill="url(#warmth)" />
    </svg>
  )
}

/** A hairline around a hole. */
export function Frame({ rect }: { rect: Rect }) {
  return <div className="frame" style={at(rect)} />
}
