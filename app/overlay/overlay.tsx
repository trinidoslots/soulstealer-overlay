"use client"

import { CANVAS, LAYOUT, at } from "@/lib/layout"
import { BannerRotator } from "@/components/banner-rotator"
import { BrandPanel } from "@/components/brand-panel"
import { ChatColumn } from "@/components/chat-column"
import { HuntPanel } from "@/components/hunt-panel"
import { Frame, Plate } from "@/components/scene"
import { Stage } from "@/components/stage"

/**
 * Both overlays. They differ in one slot: the standard one has the big banner
 * bottom right, the hunt one has the bonus hunt there and moves the banner,
 * smaller, to the top of the chat column.
 */
export function Overlay({ demo, plate, hunt }: { demo: boolean; plate: boolean; hunt: boolean }) {
  return (
    <Stage width={CANVAS.w} height={CANVAS.h}>
      {plate && <Plate />}
      <Frame rect={LAYOUT.game} />
      <Frame rect={LAYOUT.cam} />

      <ChatColumn demo={demo} banner={hunt} />
      <BrandPanel demo={demo} />
      {hunt ? <HuntPanel demo={demo} /> : <BannerRotator size="lg" style={at(LAYOUT.feature)} />}
    </Stage>
  )
}
