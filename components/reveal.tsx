"use client"

import { useEffect, useState, type ReactNode } from "react"

const MS = 450

/**
 * Opens downwards when `show` turns on and folds away when it turns off,
 * pushing whatever is below it (the chat) instead of covering it. The
 * children stay mounted until the fold has finished.
 */
export function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(show)
  const [open, setOpen] = useState(show)

  useEffect(() => {
    if (show) {
      setMounted(true)
      // Two frames: one to mount closed, one to start the transition from there.
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)))
      return () => cancelAnimationFrame(id)
    }
    setOpen(false)
    const timer = setTimeout(() => setMounted(false), MS)
    return () => clearTimeout(timer)
  }, [show])

  if (!mounted) return null
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        opacity: open ? 1 : 0,
        transition: `grid-template-rows ${MS}ms ease, opacity ${MS}ms ease`,
        flex: "none",
      }}
    >
      <div style={{ overflow: "hidden", minHeight: 0 }}>{children}</div>
    </div>
  )
}
