/**
 * Everything on the overlay that is copy or artwork rather than live data.
 * Change it here, then rebuild (README, step 11).
 */

export const BRAND = {
  name: "Soul Stealer",
  site: "soul-stealer.com",
  /**
   * Optional: the streamer's real logo instead of the drawn scythe.
   * Put the file in public/ (e.g. public/logo.png) and set "/logo.png" here.
   */
  logo: null as string | null,
  currency: "USD",
} as const

export const CHAT = {
  /**
   * The Kick channel whose chat fills the right column, as in kick.com/<slug>.
   * KICK_CHANNEL in .env.local overrides it without a rebuild.
   */
  channel: "soulstealer",
  /**
   * Kick gives every chatter a colour. Off keeps the column in the overlay's
   * own black/grey/red; mods and the broadcaster are then picked out in red.
   */
  nameColors: false,
  /** Messages kept on screen; older ones scroll away. */
  limit: 60,
}

/**
 * The banner slot. 912x234 at the bottom of /overlay, and the same artwork
 * shrunk into the top of the chat column on /overlay/hunt — both are the same
 * shape, so one file serves both.
 *
 * Two kinds of entry:
 *   { image: "/banners/leaderboard.png", alt: "Leaderboard" }
 *     artwork in public/banners/, ideally 1824x468 px (twice the slot, so it
 *     stays sharp). Anything else is fitted without being cropped.
 *   { kicker, title, cta }
 *     a plain text banner in the overlay's own style — no artwork needed.
 *
 * Order here is the rotation order.
 */
export type Banner = { image: string; alt: string } | { kicker: string; title: string; cta?: string }

export const BANNERS: Banner[] = [
  { kicker: "Leaderboards", title: "Over $5,000 paid out every month", cta: "!website" },
  { kicker: "Exclusive offers", title: "The best casino bonuses, only on soul-stealer.com", cta: "!website" },
  { kicker: "Community", title: "Join the Discord and never miss a giveaway", cta: "!discord" },
]

/** Seconds each banner stays before the next fades in. */
export const BANNER_SECONDS = 12
