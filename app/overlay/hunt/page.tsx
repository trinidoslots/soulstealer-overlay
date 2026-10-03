import type { Metadata } from "next"
import { Overlay } from "@/app/overlay/overlay"

export const metadata: Metadata = { title: "Soul Stealer — Hunt overlay", robots: { index: false } }

type Search = Promise<Record<string, string | string[] | undefined>>

/** The overlay for hunt streams: the bonus hunt bottom left, the banner beside it. Same ?demo=1 and ?bg=0. */
export default async function HuntOverlayPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams
  return <Overlay demo={params.demo === "1"} plate={params.bg !== "0"} hunt />
}
