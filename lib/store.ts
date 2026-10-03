import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

/**
 * A tiny JSON file on the server's disk, for the few things that have to
 * survive a restart (the Spotify refresh token). No database needed.
 *
 * DATA_DIR defaults to ./data next to the app. On Docker, mount it as a volume.
 */

const DIR = process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data")
const FILE = path.join(DIR, "store.json")

type Store = { spotifyRefreshToken?: string }

export async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store
  } catch {
    return {}
  }
}

export async function writeStore(patch: Partial<Store>) {
  const next = { ...(await readStore()), ...patch }
  await mkdir(DIR, { recursive: true })
  // Write-then-rename, so a crash mid-write never leaves half a file.
  const tmp = `${FILE}.${process.pid}.tmp`
  await writeFile(tmp, JSON.stringify(next, null, 2), { mode: 0o600 })
  await rename(tmp, FILE)
}
