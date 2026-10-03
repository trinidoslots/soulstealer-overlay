# Banner

Eigene Banner-Bilder kommen in diesen Ordner und werden in `lib/config.ts` unter `BANNERS` eingetragen:

```ts
{ image: "/banners/leaderboard.png", alt: "Leaderboard" },
```

- Format: **1824 × 468 px** (doppelte Slot-Größe, bleibt in OBS scharf), PNG oder JPG
- Wichtige Inhalte nicht ganz an den Rand setzen: der Slot hat abgerundete Ecken
- Dasselbe Bild erscheint im Hunt-Overlay verkleinert oben in der Chat-Spalte. Text daher nicht zu klein gestalten
