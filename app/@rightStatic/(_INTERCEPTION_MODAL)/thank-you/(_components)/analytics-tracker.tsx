//app/@rightStatic/(_INTERCEPTION_MODAL)/thank-you/(_components)/analytics-tracker.tsx
"use client"

import { useEffect } from "react"

// Define types for analytics libraries
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function AnalyticsTracker() {
  useEffect(() => {
    // Google Analytics conversion tracking
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "CONVERSION_ID", // Replace with your actual conversion ID
        event_category: "Lead Generation",
        event_label: "Thank You Page View",
      })
    }

    // Facebook Pixel tracking
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead")
    }

    // Custom analytics event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "lead_submitted",
        event_category: "conversion",
        event_action: "thank_you_page_view",
      })
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics] Thank You page view tracked")
    }
  }, [])

  // This component renders nothing
  return null
}
