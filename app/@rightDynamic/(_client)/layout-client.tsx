//app/@rightDynamic/(_client)/layout-client.tsx
"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { initAuthState, useAuth } from "@/app/@left/(_AUTH)/login/(_client)/(_hooks)/use-auth-state"

interface RightDynamicLayoutClientProps {
  children: React.ReactNode
  initialAuth: boolean
}

export function RightDynamicLayoutClient({ children, initialAuth }: RightDynamicLayoutClientProps) {
  const { isAuthenticated } = useAuth()
  const _router = useRouter()
  const _pathname = usePathname()

  // Initialize auth state from server
  useEffect(() => {
    initAuthState(initialAuth)
  }, [initialAuth])
  // Hide overlay if user is not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <main
      className="absolute inset-0 z-50 bg-background overflow-y-auto hide-scrollbar"
      aria-label="Dynamic admin content"
    >
      {children}
    </main>
  )
}
