/**
 * The 1920x1080 scene, in canvas pixels.
 *
 * Game and cam are holes: the overlay draws only a hairline around them, and
 * the OBS sources sit underneath at exactly these rectangles. The numbers are
 * in the README too, so nobody has to measure in OBS.
 *
 * The bottom row is the one difference between the two overlays: /overlay
 * gives all of it to the banner, /overlay/hunt splits it into the hunt on the
 * left and the banner on the right.
 */

export type Rect = { x: number; y: number; w: number; h: number }

export const CANVAS = { w: 1920, h: 1080 } as const

export const LAYOUT = {
  game: { x: 24, y: 24, w: 1376, h: 774 },
  cam: { x: 1424, y: 24, w: 472, h: 266 },
  chat: { x: 1424, y: 314, w: 472, h: 742 },
  /** /overlay: the banner across the whole bottom row. */
  bannerWide: { x: 24, y: 822, w: 1376, h: 234 },
  /** /overlay/hunt: the hunt bottom left, the banner beside it. */
  hunt: { x: 24, y: 822, w: 440, h: 234 },
  banner: { x: 488, y: 822, w: 912, h: 234 },
} satisfies Record<string, Rect>

/** The rectangles the background plate cuts out. */
export const HOLES: Rect[] = [LAYOUT.game, LAYOUT.cam]

/** Inner padding of the chat column. */
export const CHAT_PAD = 12

export const at = (rect: Rect) => ({ left: rect.x, top: rect.y, width: rect.w, height: rect.h })
