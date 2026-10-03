"use client"

import { CANVAS, LAYOUT, at } from "@/lib/layout"
import { BannerRotator } from "@/components/banner-rotator"
import { ChatColumn } from "@/components/chat-column"
import { HuntPanel } from "@/components/hunt-panel"
import { Frame, Plate } from "@/components/scene"
import { Stage } from "@/components/stage"

/**
 * Both overlays. They differ only in the bottom row: the standard one gives
 * it all to the banner, the hunt one puts the bonus hunt on its left. The
 * chat, with the song and giveaways on top, is the same on both.
 */
export function Overlay({ demo, plate, hunt }: { demo: boolean; plate: boolean; hunt: boolean }) {
  return (
    <Stage width={CANVAS.w} height={CANVAS.h}>
      {plate && <Plate />}
      <Frame rect={LAYOUT.game} />
      <Frame rect={LAYOUT.cam} />

      <ChatColumn demo={demo} />
      {hunt && <HuntPanel demo={demo} />}
      <BannerRotator wide={!hunt} style={at(hunt ? LAYOUT.banner : LAYOUT.bannerWide)} />
    </Stage>
  )
}
