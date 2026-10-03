/**
 * Everything on the overlay that is text rather than data.
 *
 * Change it here, push, and Vercel redeploys — no env var juggling for copy.
 */

export const BRAND = {
  name: "Soul Stealer",
  site: "soul-stealer.com",
  /** Shown in the giveaway card when no round is running. */
  giveawayIdle: {
    title: "No giveaway running",
    subtitle: "Stay tuned — the reaper drops them live",
  },
  currency: "USD",
  /**
   * Optional: the streamer's real logo instead of the drawn scythe in the top-right bar.
   * Put the file in public/ (e.g. public/logo.png) and set "/logo.png" here.
   * Square, transparent PNG or SVG works best.
   */
  logo: null as string | null,
} as const

/**
 * The rotating promo card. Every message stays for TICKER_SECONDS, then the
 * next fades in. Keep `title` short: the card is 420px wide.
 */
export const TICKER_SECONDS = 9

export const TICKER: { kicker: string; title: string; cta: string }[] = [
  { kicker: "Leaderboards", title: "Over $5,000 paid out every month", cta: "!website" },
  { kicker: "Exclusive offers", title: "The best casino bonuses, only on our site", cta: "!website" },
  { kicker: "Giveaways", title: "Live giveaways right here on stream", cta: "!join" },
  { kicker: "Community", title: "Join the Discord and never miss a drop", cta: "!discord" },
]
