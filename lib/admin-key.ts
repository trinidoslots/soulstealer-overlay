import { timingSafeEqual } from "node:crypto"

/**
 * OVERLAY_ADMIN_KEY guards the one thing on this app that changes state:
 * connecting a Spotify account. Unset means that route is switched off.
 */
export function adminKeyMatches(candidate: string | null | undefined): boolean {
  const expected = process.env.OVERLAY_ADMIN_KEY?.trim()
  if (!expected || !candidate) return false
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function adminKeyConfigured() {
  return !!process.env.OVERLAY_ADMIN_KEY?.trim()
}
