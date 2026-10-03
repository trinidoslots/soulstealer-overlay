"use client"

import { useEffect, useState } from "react"
import { CHAT } from "@/lib/config"
import { KICK_PUSHER_URL, toMessage, type KickChatPayload, type KickMessage } from "@/lib/kick"

/*
 * An OBS source runs unattended for hours, so a dropped socket has to heal on
 * its own. Backs off so an offline channel or a Kick hiccup is not hammered.
 */
const RETRY_BASE_MS = 2_000
const RETRY_MAX_MS = 30_000

export function useKickChat(enabled: boolean): KickMessage[] {
  const [messages, setMessages] = useState<KickMessage[]>([])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let socket: WebSocket | null = null
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    let counter = 0

    const retry = () => {
      if (cancelled) return
      timer = setTimeout(connect, Math.min(RETRY_BASE_MS * 2 ** attempts++, RETRY_MAX_MS))
    }

    async function connect() {
      let chatroomId: number
      try {
        const response = await fetch("/api/kick/chatroom", { cache: "no-store" })
        const data = await response.json()
        if (!response.ok || typeof data.chatroomId !== "number") throw new Error(data.error)
        chatroomId = data.chatroomId
      } catch {
        return retry()
      }
      if (cancelled) return

      const ws = new WebSocket(KICK_PUSHER_URL)
      socket = ws

      ws.onmessage = (event) => {
        let frame: { event?: string; data?: string }
        try {
          frame = JSON.parse(event.data)
        } catch {
          return
        }
        if (frame.event === "pusher:connection_established") {
          ws.send(JSON.stringify({ event: "pusher:subscribe", data: { channel: `chatrooms.${chatroomId}.v2` } }))
          attempts = 0
          return
        }
        if (frame.event !== "App\\Events\\ChatMessageEvent" || !frame.data) return
        let payload: KickChatPayload
        try {
          payload = JSON.parse(frame.data)
        } catch {
          return
        }
        const message = toMessage(payload, `local-${++counter}`)
        setMessages((current) => [...current, message].slice(-CHAT.limit))
      }

      ws.onclose = () => {
        if (!cancelled && socket === ws) retry()
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(timer)
      socket?.close()
    }
  }, [enabled])

  return messages
}
