/**
 * Everything on the overlay that is copy or artwork rather than live data.
 * Change it here, then rebuild (README, step 11).
 */

export const BRAND = {
  /** Currency the hunt figures are shown in. */
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
 * The rotating banner. It is 1376x234 across the bottom of /overlay and
 * 912x234 beside the hunt on /overlay/hunt.
 *
 * Two kinds of entry:
 *   { image: "/banners/leaderboard.png", wide: "/banners/leaderboard-wide.png", alt: "Leaderboard" }
 *     artwork in public/banners/. `image` is for the hunt overlay, ideally
 *     1824x468 px; `wide` for the standard one, ideally 2752x468 px (both are
 *     twice the slot, so they stay sharp). Leave `wide` out and the standard
 *     overlay shows `image`, centred. Nothing is ever cropped.
 *   { kicker, title, cta }
 *     a plain text banner in the overlay's own style — fits both sizes, no
 *     artwork needed.
 *
 * Order here is the rotation order.
 */
export type Banner = { image: string; wide?: string; alt: string } | { kicker: string; title: string; cta?: string }

export const BANNERS: Banner[] = [
  { kicker: "Leaderboards", title: "Over $5,000 paid out every month", cta: "!website" },
  { kicker: "Exclusive offers", title: "The best casino bonuses, only on soul-stealer.com", cta: "!website" },
  { kicker: "Community", title: "Join the Discord and never miss a giveaway", cta: "!discord" },
]

/** Seconds each banner stays before the next fades in. */
export const BANNER_SECONDS = 12
