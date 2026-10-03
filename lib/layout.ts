/**
 * The 1920x1080 scene, in canvas pixels.
 *
 * Game, cam and chat are holes: the overlay draws only their frames, and the
 * OBS sources sit underneath (or on top) at exactly these rectangles. The
 * numbers are on the setup page too, so nobody has to measure in OBS.
 */

export type Rect = { x: number; y: number; w: number; h: number }

export const CANVAS = { w: 1920, h: 1080 } as const

const M = 24 // outer margin and gutter

export const LAYOUT = {
  game: { x: M, y: M, w: 1376, h: 774 },
  brand: { x: 1424, y: M, w: 472, h: 56 },
  cam: { x: 1424, y: 104, w: 472, h: 266 },
  chat: { x: 1424, y: 394, w: 472, h: 662 },
  nowPlaying: { x: M, y: 822, w: 420, h: 105 },
  ticker: { x: M, y: 951, w: 420, h: 105 },
  hunt: { x: 468, y: 822, w: 520, h: 234 },
  giveaway: { x: 1012, y: 822, w: 388, h: 234 },
} satisfies Record<string, Rect>

/** The rectangles the background plate cuts out. */
export const HOLES: Rect[] = [LAYOUT.game, LAYOUT.cam, LAYOUT.chat]

export const at = (rect: Rect) => ({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
