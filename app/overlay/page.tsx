import type { Metadata } from "next"
import { Overlay } from "@/app/overlay/overlay"

export const metadata: Metadata = { title: "Soul Stealer — Overlay", robots: { index: false } }

/**
 * THE browser source: one page, 1920x1080, everything on it.
 *
 *   ?demo=1     sample data for every card, cycling through all giveaway states
 *   ?bg=0       no dark plate — only frames and cards, over whatever is behind
 *   ?fx=0       no drifting embers
 */
export default async function OverlayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  return <Overlay demo={params.demo === "1"} plate={params.bg !== "0"} embers={params.fx !== "0"} />
}
