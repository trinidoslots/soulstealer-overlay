import { BRAND } from "@/lib/config"

const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: BRAND.currency, maximumFractionDigits: 0 })
const cents = new Intl.NumberFormat("en-US", { style: "currency", currency: BRAND.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** "$500", "$0.40", "$1,234.50" — cents only when there are any. */
export function money(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  return Math.abs(value % 1) > 0.004 ? cents.format(value) : whole.format(value)
}

/** "+$120" / "-$80". */
export function signedMoney(value: number): string {
  return `${value >= 0 ? "+" : "-"}${money(Math.abs(value))}`
}

/** "35.57x", "402x", "1,204x" — no decimals once it is in the hundreds. */
export function multiplier(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—"
  const digits = value >= 100 ? 0 : 2
  return `${value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}x`
}

/** "3:07" or "1:02:45". */
export function clock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = String(total % 60).padStart(2, "0")
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`
}
