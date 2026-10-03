import type { Metadata } from "next"
import { Cinzel, Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const cinzel = Cinzel({ subsets: ["latin"], weight: ["700"], variable: "--font-cinzel", display: "swap" })

export const metadata: Metadata = {
  title: "Soul Stealer — Overlay",
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body>{children}</body>
    </html>
  )
}
