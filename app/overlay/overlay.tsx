"use client"

import { CANVAS, LAYOUT, at } from "@/lib/layout"
import { BannerRotator } from "@/components/banner-rotator"
import { BrandPanel } from "@/components/brand-panel"
import { ChatColumn } from "@/components/chat-column"
import { HuntPanel } from "@/components/hunt-panel"
import { Frame, Plate } from "@/components/scene"
import { Stage } from "@/components/stage"

/**
 * Both overlays. They differ in one slot, bottom left: the standard one has
 * the brand with the song under it, the hunt one has the bonus hunt there and
 * moves the song to the top of the chat column. The banner never moves.
 */
export function Overlay({ demo, plate, hunt }: { demo: boolean; plate: boolean; hunt: boolean }) {
  return (
    <Stage width={CANVAS.w} height={CANVAS.h}>
      {plate && <Plate />}
      <Frame rect={LAYOUT.game} />
      <Frame rect={LAYOUT.cam} />

      <ChatColumn demo={demo} nowPlaying={hunt} />
      {hunt ? <HuntPanel demo={demo} /> : <BrandPanel demo={demo} />}
      <BannerRotator style={at(LAYOUT.banner)} />
    </Stage>
  )
}
