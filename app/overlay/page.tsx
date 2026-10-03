import type { Metadata } from "next"
import { Overlay } from "@/app/overlay/overlay"

export const metadata: Metadata = { title: "Soul Stealer — Overlay", robots: { index: false } }

type Search = Promise<Record<string, string | string[] | undefined>>

/**
 * The everyday browser source, 1920x1080: game, cam, chat with events, brand
 * with now playing, and the big banner. /overlay/hunt is the same with the
 * bonus hunt in the banner's place.
 *
 *   ?demo=1   sample data everywhere, including a giveaway arriving in chat
 *   ?bg=0     no dark background — only the panels and hairlines
 */
export default async function OverlayPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams
  return <Overlay demo={params.demo === "1"} plate={params.bg !== "0"} hunt={false} />
}
