import { NextResponse } from "next/server"
import { bonushuntConfigured, readCurrentHunt } from "@/lib/bonushunt"
import type { HuntResponse } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const configured = bonushuntConfigured()
  let body: HuntResponse = { hunt: null, configured }
  if (configured) {
    try {
      body = { hunt: await readCurrentHunt(), configured }
    } catch (error) {
      console.error("[bonushunt]", error)
      // 502 so the overlay keeps the last good hunt instead of blanking.
      return NextResponse.json(body, { status: 502, headers: { "Cache-Control": "no-store" } })
    }
  }
  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } })
}
