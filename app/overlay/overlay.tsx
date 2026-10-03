"use client"

import { CANVAS, LAYOUT, at } from "@/lib/layout"
import { BonusHuntCard } from "@/components/bonus-hunt-card"
import { GiveawayCard } from "@/components/giveaway-card"
import { NowPlayingCard } from "@/components/now-playing-card"
import { BrandBar, Embers, Frame, Plate } from "@/components/scene"
import { Stage } from "@/components/stage"
import { TickerCard } from "@/components/ticker-card"

export function Overlay({ demo, plate, embers }: { demo: boolean; plate: boolean; embers: boolean }) {
  return (
    <Stage width={CANVAS.w} height={CANVAS.h}>
      {plate && <Plate />}
      {plate && embers && <Embers />}

      <Frame rect={LAYOUT.game} />
      <Frame rect={LAYOUT.cam} />
      <Frame rect={LAYOUT.chat} tag="Live chat" live />

      <BrandBar />
      <NowPlayingCard style={at(LAYOUT.nowPlaying)} demo={demo} />
      <TickerCard style={at(LAYOUT.ticker)} />
      <BonusHuntCard style={at(LAYOUT.hunt)} demo={demo} />
      <GiveawayCard style={at(LAYOUT.giveaway)} demo={demo} />
    </Stage>
  )
}
