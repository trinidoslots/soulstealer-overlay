import { NextResponse, type NextRequest } from "next/server"
import { exchangeCode, redirectUriFor, STATE_COOKIE } from "@/lib/spotify"

/**
 * Spotify sends the streamer back here with a one-time code. It is traded for
 * a refresh token and stored in data/store.json — from then on the overlay
 * shows the current song, across restarts, with nothing to copy anywhere.
 */

export const dynamic = "force-dynamic"

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${escape(title)}</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#09090b;color:#ededf0;font:15px/1.6 system-ui,sans-serif;padding:16px}
main{max-width:640px;width:100%;background:#121215;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:28px}
h1{margin:0 0 8px;font-size:20px}h1 span{color:#e3132d}
p{color:#a1a1aa}code{font-family:ui-monospace,monospace}
a{color:#ff2e4a}
</style></head><body><main>${body}</main></body></html>`
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const error = params.get("error")
  if (error) return page("Spotify", `<h1>Abgebrochen</h1><p>Spotify meldet: <code>${escape(error)}</code></p><p><a href="/">Zurück</a></p>`, 400)

  const expected = request.cookies.get(STATE_COOKIE)?.value
  if (!expected || expected !== params.get("state")) {
    return page("Spotify", `<h1>Sitzung abgelaufen</h1><p>Bitte den Vorgang von vorn starten.</p><p>Den Login-Link mit <code>?key=</code> erneut öffnen.</p>`, 400)
  }

  try {
    await exchangeCode(params.get("code") ?? "", redirectUriFor(request.nextUrl.origin))
    const response = page(
      "Spotify verbunden",
      `<h1><span>●</span> Spotify verbunden</h1>
<p>Fertig. Das Overlay zeigt ab jetzt den Song, der auf diesem Spotify-Konto läuft – auch nach einem Neustart des Servers.</p>
<p>Anderes Konto verbinden? Einfach den Login-Link erneut öffnen.</p>
<p><a href="/overlay">Overlay öffnen</a></p>`,
    )
    response.cookies.delete({ name: STATE_COOKIE, path: "/api/spotify" })
    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return page("Spotify", `<h1>Fehlgeschlagen</h1><p>${escape(message)}</p><p>Den Login-Link mit <code>?key=</code> erneut öffnen.</p>`, 500)
  }
}
