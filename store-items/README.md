# Store items

Bilder für den Store auf soul-stealer.com, im Stil des Overlays.

![Übersicht](overview.png)

Fertige Bilder liegen in `images/`:

| Datei | Größe |
| --- | --- |
| `<item>.png` | 334 × 465 px |
| `<item>@2x.png` | 668 × 930 px (für scharfe Darstellung auf hochauflösenden Bildschirmen) |

Items: `gifted-sub`, `vip`, `bonus-buy-20` … `bonus-buy-100`, `tip-5` … `tip-50`.

## Ändern oder neue Items

Alles steht in `render.cjs`:

- **Texte und Items**: Liste `ITEMS`
- **Slots hinter „ANY SLOT“**: Liste `THUMBS`. Die Bilder liegen in `thumbs/` und stammen aus der `slots`-Tabelle in Supabase (`image_url`). Für andere Slots die Datei austauschen (Hochformat, ca. 3:4)
- **Icons**: `ICONS`

Neu rendern (im Projektordner):

```bash
npx playwright install chromium   # einmalig
node store-items/render.cjs                 # alle
node store-items/render.cjs bonus-buy-40    # nur eins
```
