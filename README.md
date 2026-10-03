# Soul Stealer – OBS Overlay

Ein komplettes Stream-Overlay für **Soul Stealer** ([soul-stealer.com](https://soul-stealer.com)) in Schwarz/Grau/Rot, schlicht und modern.

**Am Ende ist es genau eine Browser Source in OBS: `https://<deine-domain>/overlay` mit 1920 × 1080.**
Alles andere in diesem Repo sind nur die Bausteine dieser einen Seite.

![Vorschau](docs/preview.png)

Auf dem Overlay:

| Bereich | Inhalt | Datenquelle |
| --- | --- | --- |
| Oben rechts | Logo + `soul-stealer.com` | `lib/config.ts` |
| Rahmen links (groß) | Ausschnitt für das Spiel | – |
| Rahmen rechts oben | Ausschnitt für die Cam | – |
| Rahmen rechts unten | Ausschnitt für den Chat | – |
| Unten links oben | Aktueller Spotify-Song mit Cover und Fortschritt | Spotify Web API |
| Unten links unten | Wechselnde Promo-Texte (`!website`, `!join` …) | `lib/config.ts` |
| Unten Mitte | Bonus Hunt: Start, Bonusse, Gewinn, Break-Even, aktueller Bonus | bonushunt.gg API |
| Unten rechts | Giveaway: Preis, Befehl, Teilnehmer, Timer, Ziehung, Gewinner | Giveaway-Modul auf soul-stealer.com |

Spiel, Cam und Chat sind **echte Löcher** im Overlay. Das Overlay liegt in OBS ganz oben, die drei Quellen darunter scheinen durch.

---

## Inhalt

1. [Server vorbereiten](#1-server-vorbereiten)
2. [Projekt auf den Server holen](#2-projekt-auf-den-server-holen)
3. [Konfiguration anlegen (.env.local)](#3-konfiguration-anlegen-envlocal)
4. [bonushunt.gg verbinden](#4-bonushuntgg-verbinden)
5. [Giveaway-Modul verbinden](#5-giveaway-modul-verbinden)
6. [Spotify verbinden](#6-spotify-verbinden)
7. [Bauen und dauerhaft starten (PM2)](#7-bauen-und-dauerhaft-starten-pm2)
8. [Domain und HTTPS (nginx)](#8-domain-und-https-nginx)
9. [In OBS einrichten](#9-in-obs-einrichten)
10. [Texte, Logo und Farben anpassen](#10-texte-logo-und-farben-anpassen)
11. [Updates einspielen](#11-updates-einspielen)
12. [Alternative: Docker](#12-alternative-docker)
13. [Fehlerbehebung](#13-fehlerbehebung)

---

## 1. Server vorbereiten

Gebraucht werden ein Linux-Server (z. B. Ubuntu 22.04/24.04), auf dem du `root` oder `sudo` hast, und eine Subdomain, z. B. `overlay.soul-stealer.com`.

1. Per SSH auf den Server verbinden.
2. Node.js 22 installieren (falls `node -v` nicht mindestens `v20` zeigt):
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   ```
3. PM2 installieren. Das hält das Overlay am Laufen und startet es nach einem Reboot neu:
   ```bash
   sudo npm install -g pm2
   ```
4. nginx und certbot installieren (für HTTPS, siehe Schritt 8):
   ```bash
   sudo apt-get install -y nginx certbot python3-certbot-nginx
   ```

> Läuft soul-stealer.com schon auf demselben Server mit nginx, ist Schritt 4 schon erledigt.

## 2. Projekt auf den Server holen

```bash
cd /var/www            # oder wo deine Projekte liegen
git clone https://github.com/trinidoslots/soulstealer-overlay.git
cd soulstealer-overlay
npm ci
```

Das Repo ist privat. Fragt `git clone` nach Zugangsdaten, nimm deinen GitHub-Benutzernamen und als Passwort einen [Personal Access Token](https://github.com/settings/tokens) mit Leserechten auf das Repo.

## 3. Konfiguration anlegen (.env.local)

1. Vorlage kopieren:
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
2. Diese zwei Werte gleich eintragen:
   - `PUBLIC_URL`: die spätere Adresse, z. B. `https://overlay.soul-stealer.com` (ohne `/` am Ende)
   - `OVERLAY_ADMIN_KEY`: ein langes Zufallspasswort. Erzeugen mit:
     ```bash
     openssl rand -hex 24
     ```
     Den Key brauchst du nur einmal, beim Spotify-Verbinden. Er gehört nicht in den Stream.
3. Die restlichen Werte kommen in den Schritten 4–6 dazu.
4. Speichern mit `Strg+O`, `Enter`, `Strg+X`.

Die `.env.local` wird nie committet (steht in `.gitignore`).

## 4. bonushunt.gg verbinden

Das Overlay liest denselben Hunt wie die Website. Dafür reicht derselbe API-Key.

1. Auf [bonushunt.gg](https://bonushunt.gg) einloggen und in den Einstellungen den API-Key kopieren. Oder den Key nehmen, den soul-stealer.com schon benutzt (steht dort in der Server-Konfiguration).
2. In `.env.local` eintragen:
   ```
   BONUSHUNT_API_KEY=dein_key
   ```
3. Optional: `BONUSHUNT_SHOW_COMPLETED_HOURS=12` legt fest, wie viele Stunden ein abgeschlossener Hunt noch mit Ergebnis im Overlay steht. `0` heißt: abgeschlossene Hunts nie zeigen.

Was das Overlay zeigt:

- **Collecting**: Startbetrag, Anzahl Bonusse, Break-Even und den zuletzt hinzugefügten Bonus
- **Opening**: Startbetrag, geöffnet/gesamt, bisheriger Gewinn, Live-Break-Even (benötigter Ø-Multi für den Rest) und den Bonus, der gerade geöffnet wird
- **Finished**: Ergebnis (+/−), Ø-Multi und der beste Bonus
- **Kein Hunt**: eine ruhige Leerkarte

bonushunt.gg erlaubt 100 Anfragen pro Minute pro Key, geteilt mit der Website. Das Overlay fragt alle 10 Sekunden und puffert die Antwort auf dem Server. Das bleibt weit unter dem Limit, auch wenn das Overlay in mehreren Szenen offen ist.

## 5. Giveaway-Modul verbinden

Das Giveaway läuft weiter über das Admin-Panel auf soul-stealer.com. Das Overlay liest dafür nur den aktuellen Stand über eine URL.

### 5.1 Endpunkt auf soul-stealer.com bereitstellen

Die Website braucht eine URL, die per `GET` den aktuellen Giveaway-Zustand als JSON zurückgibt, z. B. `https://soul-stealer.com/api/giveaway/current`. Hat das Modul so etwas schon, nimm einfach diese URL.

Das Overlay erwartet am besten dieses Format:

```json
{
  "status": "open",
  "title": "$250 Giveaway",
  "keyword": "!join",
  "entries": 128,
  "entrants": ["paun", "sasa55532", "Dexiii10"],
  "started_at": "2026-10-03T20:00:00Z",
  "ends_at": "2026-10-03T20:05:00Z",
  "winner": null
}
```

| Feld | Bedeutung |
| --- | --- |
| `status` | `idle` (nichts läuft), `open` (Teilnahme offen), `closed` (Teilnahme zu), `rolling` (wird gezogen), `finished` (Gewinner steht fest) |
| `title` | Was gewonnen wird, z. B. `$250 Giveaway` |
| `keyword` | Chat-Befehl zum Mitmachen. `join` wird automatisch zu `!join` |
| `entries` | Anzahl der Teilnehmer |
| `entrants` | Namen der Teilnehmer, optional. Laufen während `rolling` durch |
| `started_at` | Startzeit, optional. Ohne `ends_at` läuft dann ein Timer hoch |
| `ends_at` | Endzeit, optional. Dann gibt es einen Countdown und einen ablaufenden Balken |
| `winner` | Name des Gewinners (oder `{ "username": "…" }`) |

Das Overlay ist bei den Feldnamen tolerant. Es versteht auch camelCase (`endsAt`, `isActive`, `entryCount` …), Objekte statt Strings (`{ "username": "…" }`), eine Hülle wie `{ "giveaway": { … } }` oder `{ "data": { … } }` und Status-Wörter wie `active`, `running`, `drawing`, `completed`. Ein bestehender Endpunkt funktioniert deshalb meistens schon ohne Umbau. Die genauen Regeln stehen in `lib/giveaway.ts`.

Der Endpunkt darf öffentlich sein. Er zeigt nur, was ohnehin im Stream zu sehen ist. Wenn er geschützt werden soll, prüft die Website einfach den Header `Authorization: Bearer <key>`.

### 5.2 Im Overlay eintragen

In `.env.local`:

```
GIVEAWAY_API_URL=https://soul-stealer.com/api/giveaway/current
# nur wenn der Endpunkt geschützt ist:
GIVEAWAY_API_KEY=
```

Das Overlay fragt alle 2 Sekunden nach. Startest du ein Giveaway im Admin-Panel, erscheint es also nach spätestens 2 Sekunden im Stream.

So sieht der Ablauf im Stream aus:

1. `open`: Preis, großer roter Chat-Befehl, Teilnehmerzahl, Countdown
2. `rolling`: Teilnehmernamen laufen schnell durch
3. `finished`: Gewinnername groß, mit rotem Glow
4. `idle`: „No giveaway running“. Hier steht **kein** Admin-Hinweis mehr im Stream

## 6. Spotify verbinden

### 6.1 Spotify-App anlegen (einmalig)

1. [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) öffnen und mit **seinem** Spotify-Konto einloggen (dem, auf dem im Stream Musik läuft).
2. **Create app** klicken.
   - App name: `Soul Stealer Overlay`
   - App description: `Now playing for the stream overlay`
   - Redirect URI: `https://overlay.soul-stealer.com/api/spotify/callback`. Muss exakt `PUBLIC_URL` + `/api/spotify/callback` sein, mit `https`, ohne `/` am Ende
   - Bei „Which API/SDKs are you planning to use?“ **Web API** anhaken
   - Bedingungen akzeptieren, **Save**
3. In der App auf **Settings** gehen und **Client ID** und **Client secret** (über „View client secret“) kopieren.
4. Unter **User Management** das Spotify-Konto (Name + E-Mail) eintragen, dessen Musik angezeigt werden soll. Neue Apps laufen im „Development Mode“, und da dürfen nur eingetragene Konten sich verbinden.

### 6.2 In .env.local eintragen

```
SPOTIFY_CLIENT_ID=…
SPOTIFY_CLIENT_SECRET=…
```

### 6.3 Konto verbinden (nach Schritt 7 und 8, wenn das Overlay erreichbar ist)

1. Im Browser öffnen:
   ```
   https://overlay.soul-stealer.com/api/spotify/login?key=DEIN_OVERLAY_ADMIN_KEY
   ```
2. Mit dem Spotify-Konto einloggen und **Zustimmen**.
3. Es erscheint „Spotify verbunden“. Das Token liegt jetzt in `data/store.json` auf dem Server und überlebt Neustarts. Du musst nichts kopieren.
4. Ein Lied abspielen. Nach wenigen Sekunden steht es im Overlay.

Ein anderes Konto verbindest du, indem du einfach den Login-Link nochmal öffnest. Läuft keine Musik oder ist sie pausiert, zeigt die Karte „Nothing playing“.

## 7. Bauen und dauerhaft starten (PM2)

```bash
cd /var/www/soulstealer-overlay
npm run build
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup          # gibt einen Befehl aus. Den einmal kopieren und ausführen
```

Das Overlay läuft jetzt auf `127.0.0.1:3100`, nur lokal erreichbar. Nach außen geht es über nginx (Schritt 8).

Prüfen:

```bash
pm2 status                       # soulstealer-overlay sollte "online" sein
curl -s localhost:3100/api/giveaway
```

Port 3100 ist schon belegt? Dann in `deploy/ecosystem.config.cjs` (`-p 3100`) und in `deploy/nginx.conf` (`127.0.0.1:3100`) eine andere Zahl eintragen.

**Wichtig:** Nach jeder Änderung an `.env.local` einmal `pm2 restart soulstealer-overlay` ausführen.

## 8. Domain und HTTPS (nginx)

1. **DNS**: Bei deinem Domain-Anbieter einen `A`-Eintrag `overlay` → IP des Servers anlegen. Ein paar Minuten warten.
2. **nginx-Konfiguration** übernehmen:
   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/overlay.soul-stealer.com
   sudo ln -s /etc/nginx/sites-available/overlay.soul-stealer.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Nutzt du eine andere Subdomain, ersetze `overlay.soul-stealer.com` in der Datei.
3. **HTTPS-Zertifikat** holen (kostenlos, verlängert sich automatisch):
   ```bash
   sudo certbot --nginx -d overlay.soul-stealer.com
   ```
4. Im Browser `https://overlay.soul-stealer.com` öffnen. Die Statusseite zeigt pro Integration **OK** oder was noch fehlt.
5. `https://overlay.soul-stealer.com/overlay?demo=1` zeigt das Overlay mit Beispieldaten, inklusive des kompletten Giveaway-Ablaufs.

Jetzt kannst du Schritt 6.3 (Spotify verbinden) machen.

## 9. In OBS einrichten

### 9.1 Die Overlay-Quelle

1. In der Szene **+** → **Browser** → Name `Soul Stealer Overlay`.
2. Einstellungen:
   - **URL**: `https://overlay.soul-stealer.com/overlay`
   - **Breite**: `1920`, **Höhe**: `1080`
   - **Benutzerdefiniertes CSS**: Feld leeren
   - **Quelle herunterfahren, wenn nicht sichtbar**: aus
   - **Browser aktualisieren, wenn Szene aktiv wird**: aus
3. **OK**. In der Quellenliste ganz **nach oben** ziehen, damit das Overlay über allem liegt.
4. Rechtsklick → **Transformieren** → **Auf Bildschirm anpassen** (oder `Strg+F`).

Die Canvas-Auflösung in OBS (Einstellungen → Video → Basis-Auflösung) sollte 1920×1080 sein.

### 9.2 Spiel, Cam und Chat in die Ausschnitte setzen

Die drei Quellen liegen **unter** dem Overlay. Damit sie exakt passen, gibst du die Werte direkt ein: Quelle auswählen → Rechtsklick → **Transformieren** → **Transformation bearbeiten** (`Strg+E`).

| Quelle | Position X | Position Y | Größe Breite | Größe Höhe |
| --- | --- | --- | --- | --- |
| Spiel / Browser-Capture | 24 | 24 | 1376 | 774 |
| Cam | 1424 | 104 | 472 | 266 |
| Chat | 1424 | 394 | 472 | 662 |

Tipps:

- Die Cam hat 16:9. Passt das Bild nicht, nutze bei „Begrenzungsrahmen-Typ“ **Auf Größe des Begrenzungsrahmens skalieren**, oder schneide mit **Zuschneiden** zu.
- Ein Rand von ein paar Pixeln über die Ausschnitte hinaus schadet nicht. Das Overlay deckt ihn ab.
- Die alten Overlay-Quellen (Song, Banner, Giveaway-Kasten) kannst du löschen oder ausblenden, die macht jetzt alles diese eine Quelle.

### 9.3 Varianten über die URL

| URL | Wirkung |
| --- | --- |
| `/overlay` | Normalbetrieb |
| `/overlay?demo=1` | Beispieldaten für alle Karten, zum Testen ohne Live-Daten |
| `/overlay?bg=0` | Ohne dunklen Hintergrund. Nur Rahmen und Karten, z. B. über einer eigenen Hintergrund-Grafik |
| `/overlay?fx=0` | Ohne die langsam aufsteigenden roten Partikel |

Mehrere Parameter kombinierst du mit `&`, z. B. `/overlay?bg=0&fx=0`.

## 10. Texte, Logo und Farben anpassen

Alles hier sind normale Dateien. Nach einer Änderung immer [Schritt 11](#11-updates-einspielen) ausführen.

| Was | Wo |
| --- | --- |
| Name, Website-Text, Text der leeren Giveaway-Karte, Währung | `lib/config.ts` → `BRAND` |
| Wechselnde Promo-Texte und ihre Anzeigedauer | `lib/config.ts` → `TICKER`, `TICKER_SECONDS` |
| Echtes Logo statt der gezeichneten Sense | Datei nach `public/logo.png` legen, in `lib/config.ts` `logo: "/logo.png"` setzen |
| Farben (Rot, Grautöne, Hintergrund) | `app/globals.css`, ganz oben unter `:root` |
| Positionen und Größen aller Bereiche | `lib/layout.ts`. Danach die Tabelle in 9.2 anpassen |

## 11. Updates einspielen

```bash
cd /var/www/soulstealer-overlay
git pull
npm ci
npm run build
pm2 restart soulstealer-overlay
```

OBS lädt die Seite beim nächsten Szenenwechsel neu. Sofort geht es per Rechtsklick auf die Quelle → **Aktualisieren**.

## 12. Alternative: Docker

Wenn auf dem Server lieber alles in Docker läuft, ersetzt das die Schritte 1 (bis auf nginx), 7 und 11:

```bash
cp .env.example .env.local   # ausfüllen wie in Schritt 3–6
docker compose up -d --build
```

- Das Overlay lauscht auf `127.0.0.1:3100`. nginx und HTTPS genauso wie in Schritt 8.
- Das Spotify-Token liegt in `./data`. Der Ordner ist eingebunden und überlebt Neubauten.
- Update: `git pull && docker compose up -d --build`
- Nach Änderung an `.env.local`: `docker compose up -d`

## 13. Fehlerbehebung

| Problem | Lösung |
| --- | --- |
| Statusseite zeigt rote Punkte | Fehlender Wert in `.env.local`. Eintragen, dann `pm2 restart soulstealer-overlay` |
| Spotify: „INVALID_CLIENT: Invalid redirect URI“ | Die Redirect URI im Spotify-Dashboard muss **exakt** `PUBLIC_URL/api/spotify/callback` sein, mit `https`, ohne `/` am Ende |
| Spotify: „User not registered in the Developer Dashboard“ | Das Konto unter **User Management** der Spotify-App eintragen (6.1, Punkt 4) |
| Spotify-Login sagt „Falscher oder fehlender ?key=“ | `?key=` muss genau dem `OVERLAY_ADMIN_KEY` aus `.env.local` entsprechen |
| Song erscheint nicht | Läuft die Musik auf genau dem verbundenen Konto? Pausiert zählt als „Nothing playing“ |
| Bonus Hunt bleibt leer | API-Key prüfen. `curl -s localhost:3100/api/bonushunt` zeigt `"configured": true` und den Hunt. `pm2 logs soulstealer-overlay` zeigt Fehler von bonushunt.gg |
| Giveaway bleibt auf „No giveaway running“ | `GIVEAWAY_API_URL` im Browser öffnen: Kommt JSON mit einem Status? `curl -s localhost:3100/api/giveaway` zeigt, wie das Overlay es versteht |
| Overlay in OBS schwarz statt durchsichtig | Bei der Browser Source das Feld **Benutzerdefiniertes CSS** leeren und die Quelle aktualisieren |
| Overlay unscharf | Quelle muss 1920×1080 sein und auf Bildschirmgröße stehen (9.1), nicht hoch- oder runterskaliert |

---

### Technik in Kürze

Next.js (App Router), läuft als Node-Server. Keine Datenbank: Das Spotify-Token liegt in `data/store.json`, alles andere kommt live aus den APIs.
API-Keys bleiben auf dem Server. Der Browser bzw. OBS bekommt nur fertige Anzeigedaten über `/api/bonushunt`, `/api/giveaway` und `/api/spotify/now-playing`.
