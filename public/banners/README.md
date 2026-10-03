# Banner

Eigene Banner-Bilder kommen in diesen Ordner und werden in `lib/config.ts` unter `BANNERS` eingetragen:

```ts
{ image: "/banners/leaderboard.png", wide: "/banners/leaderboard-wide.png", alt: "Leaderboard" },
```

| Feld | Größe | Wo |
| --- | --- | --- |
| `image` | **1824 × 468 px** | Hunt-Overlay, rechts neben dem Hunt (Pflicht) |
| `wide` | **2752 × 468 px** | Standard-Overlay, über die ganze Breite (optional, sonst wird `image` mittig gezeigt) |

- Beide Größen sind die doppelte Slot-Größe. So bleiben die Bilder in OBS scharf
- PNG oder JPG
- Wichtige Inhalte nicht ganz an den Rand setzen, der Slot hat abgerundete Ecken
