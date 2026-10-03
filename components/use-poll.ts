"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Polls a JSON endpoint and keeps the last good answer.
 *
 * A failed request (network blip, a 502 from an upstream API) leaves what is
 * on screen alone rather than blanking it — on stream, stale for ten seconds
 * beats flickering empty. In demo mode `demo` is called instead, on the same
 * clock, so the cards animate exactly as they would live.
 */
export function usePoll<T>(url: string, intervalMs: number, demo?: () => T): T | null {
  const [data, setData] = useState<T | null>(() => (demo ? demo() : null))
  const demoRef = useRef(demo)
  demoRef.current = demo

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    const tick = async () => {
      if (demoRef.current) {
        setData(demoRef.current())
      } else {
        try {
          const response = await fetch(url, { cache: "no-store" })
          if (response.ok && !cancelled) setData((await response.json()) as T)
        } catch {
          // keep the last good value
        }
      }
      if (!cancelled) timer = setTimeout(tick, demoRef.current ? Math.min(intervalMs, 1000) : intervalMs)
    }

    tick()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url, intervalMs])

  return data
}

/** Re-renders every `ms`, for clocks and progress bars between polls. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
