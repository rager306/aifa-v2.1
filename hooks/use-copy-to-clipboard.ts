//hooks/use-copy-to-clipboard.ts

"use client"

import * as React from "react"

export function useCopyToClipboard({
  timeout = 2000,
  onCopy,
}: {
  timeout?: number
  onCopy?: () => void
} = {}) {
  const [isCopied, setIsCopied] = React.useState(false)

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return
    }

    if (!value) return

    navigator.clipboard
      .writeText(value)
      .then(() => {
        setIsCopied(true)

        if (onCopy) {
          onCopy()
        }

        if (timeout !== 0) {
          setTimeout(() => {
            setIsCopied(false)
          }, timeout)
        }
      })
      .catch((error: unknown) => {
        // Handle clipboard write errors silently or log to error monitoring service
        if (process.env.NODE_ENV === "development") {
          // biome-ignore lint/suspicious/noConsole: Error logging in development
          console.error("Failed to copy to clipboard:", error)
        }
      })
  }

  return { isCopied, copyToClipboard }
}
