//online-status-provider.tsx

"use client"

import type React from "react"
import { OfflinePlaceholder } from "@/components/offline-placeholder/offline-placeholder"
import { useOnlineStatus } from "@/hooks/use-online-status"

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus()
  return isOnline ? <>{children}</> : <OfflinePlaceholder />
}
