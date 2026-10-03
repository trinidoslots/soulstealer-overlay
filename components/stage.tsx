"use client"

import { useEffect, useState, type ReactNode } from "react"

/**
 * Draws its children at a fixed pixel size and scales the whole thing to fit
 * the window. In OBS the source is the native size, so the scale is exactly 1
 * and text stays sharp; in a browser preview it shrinks to fit.
 */
export function Stage({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const [scale, setScale] = useState<number | null>(null)

  useEffect(() => {
    document.body.classList.add("obs")
    const fit = () => setScale(Math.min(window.innerWidth / width, window.innerHeight / height))
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [width, height])

  return (
    <div className="stage-viewport">
      {/* Rendered only once mounted: clocks, the ticker and demo data all read
          the time, which would never match between server and browser. */}
      {scale !== null && (
        <div className="stage" style={{ width, height, transform: `scale(${scale})` }}>
          {children}
        </div>
      )}
    </div>
  )
}
