import { adminKeyConfigured } from "@/lib/admin-key"
import { CHAT } from "@/lib/config"
import { bonushuntConfigured } from "@/lib/bonushunt"
import { giveawayConfigured } from "@/lib/giveaway"
import { spotifyConnected, spotifyCredentials } from "@/lib/spotify"

export const dynamic = "force-dynamic"

/**
 * A status page for setting up, not for stream: what is configured, and the
 * one URL that goes into OBS. It says only yes or no — never a value.
 */
export default async function Home() {
  const channel = process.env.KICK_CHANNEL?.trim() || CHAT.channel
  const rows: [string, boolean, string][] = [
    [`Kick-Chat: kick.com/${channel}`, true, ""],
    ["bonushunt.gg API-Key", bonushuntConfigured(), "BONUSHUNT_API_KEY in .env"],
    ["Giveaway-API", giveawayConfigured(), "GIVEAWAY_API_URL in .env"],
    ["Spotify App", !!spotifyCredentials(), "SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET in .env"],
    ["Spotify-Konto verbunden", await spotifyConnected(), "/api/spotify/login?key=… öffnen"],
    ["Admin-Key", adminKeyConfigured(), "OVERLAY_ADMIN_KEY in .env"],
  ]

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--ground)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 620 }}>
        <h1 style={{ fontFamily: "var(--font-brand)", letterSpacing: "0.14em", fontSize: 24, margin: "0 0 6px" }}>
          SOUL STEALER <span style={{ color: "var(--red)" }}>·</span> OVERLAY
        </h1>
        <p style={{ color: "var(--muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
          Zwei Overlays, je eine Browser Source mit 1920 × 1080:{" "}
          <code style={{ color: "var(--text)" }}>/overlay</code> für normale Streams und{" "}
          <code style={{ color: "var(--text)" }}>/overlay/hunt</code> für Bonus Hunts.
        </p>

        <div style={{ border: "1px solid var(--line)", borderRadius: 14, overflow: "hidden", background: "#0f0f12" }}>
          {rows.map(([name, ok, hint]) => (
            <div
              key={name}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderTop: "1px solid var(--line)" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flex: "none",
                  background: ok ? "#e7e7ea" : "var(--red)",
                                  }}
              />
              <span style={{ fontWeight: 600 }}>{name}</span>
              <span style={{ marginLeft: "auto", color: ok ? "var(--muted)" : "var(--red)", fontSize: 13, textAlign: "right" }}>
                {ok ? "OK" : hint}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <a href="/overlay" style={button(true)}>
            Overlay öffnen
          </a>
          <a href="/overlay/hunt" style={button(true)}>
            Hunt-Overlay öffnen
          </a>
          <a href="/overlay?demo=1" style={button(false)}>
            Demo
          </a>
          <a href="/overlay/hunt?demo=1" style={button(false)}>
            Hunt-Demo
          </a>
        </div>
      </div>
    </main>
  )
}

function button(primary: boolean): React.CSSProperties {
  return {
    padding: "10px 16px",
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    color: "#fff",
    background: primary ? "var(--red)" : "rgba(255,255,255,0.05)",
    border: `1px solid ${primary ? "var(--red)" : "var(--line)"}`,
  }
}
