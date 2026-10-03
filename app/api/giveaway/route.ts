import { NextResponse } from "next/server"
import { giveawayConfigured, IDLE, readGiveaway } from "@/lib/giveaway"
import type { GiveawayResponse } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const configured = giveawayConfigured()
  try {
    const body: GiveawayResponse = { giveaway: await readGiveaway(), configured }
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[giveaway]", error)
    const body: GiveawayResponse = { giveaway: IDLE, configured }
    return NextResponse.json(body, { status: 502, headers: { "Cache-Control": "no-store" } })
  }
}
