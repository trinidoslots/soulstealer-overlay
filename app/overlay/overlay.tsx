"use client"

import { CANVAS, LAYOUT, at } from "@/lib/layout"
import { BannerRotator } from "@/components/banner-rotator"
import { BrandPanel } from "@/components/brand-panel"
import { ChatColumn } from "@/components/chat-column"
import { HuntPanel } from "@/components/hunt-panel"
import { Frame, Plate } from "@/components/scene"
import { Stage } from "@/components/stage"

/**
 * Both overlays. They differ in one slot, bottom left: the brand on the
 * standard one, the bonus hunt on the hunt one. Everything else — the chat
 * with the song and giveaways on top, the big banner — is the same.
 */
export function Overlay({ demo, plate, hunt }: { demo: boolean; plate: boolean; hunt: boolean }) {
  return (
    <Stage width={CANVAS.w} height={CANVAS.h}>
      {plate && <Plate />}
      <Frame rect={LAYOUT.game} />
      <Frame rect={LAYOUT.cam} />

      <ChatColumn demo={demo} />
      {hunt ? <HuntPanel demo={demo} /> : <BrandPanel />}
      <BannerRotator style={at(LAYOUT.banner)} />
    </Stage>
  )
}
