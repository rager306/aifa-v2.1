// components/safe-json-ld.tsx
"use client"

/**
 * SafeJsonLd - Secure JSON-LD component with XSS protection
 *
 * This component safely injects JSON-LD structured data for SEO purposes
 * with proper sanitization to prevent XSS attacks.
 *
 * Security features:
 * - Validates data is a safe object (no functions, symbols, undefined)
 * - Uses JSON.stringify with custom replacer for sanitization
 * - Prevents script injection through data validation
 * - TypeScript type checking for additional safety
 */

type SafeJsonLdProps = {
  /**
   * The structured data object to be serialized as JSON-LD
   * Must be a plain object without functions, symbols, or circular references
   */
  data: Record<string, unknown>
  /**
   * Optional ID for the script tag
   */
  id?: string
}

/**
 * Validates that a value is safe for JSON-LD serialization
 * @param value - The value to validate
 * @returns true if the value is safe, false otherwise
 */
function isSafeValue(value: unknown): boolean {
  // Reject functions and symbols
  if (typeof value === 'function' || typeof value === 'symbol') {
    return false
  }

  // Reject undefined (should be null instead)
  if (value === undefined) {
    return false
  }

  // Allow primitives
  if (value === null || typeof value !== 'object') {
    return true
  }

  // Validate arrays recursively
  if (Array.isArray(value)) {
    return value.every(isSafeValue)
  }

  // Validate objects recursively
  return Object.values(value as Record<string, unknown>).every(isSafeValue)
}

/**
 * SafeJsonLd component - Renders JSON-LD structured data with XSS protection
 *
 * @example
 * ```tsx
 * <SafeJsonLd
 *   id="website-schema"
 *   data={{
 *     "@context": "https://schema.org",
 *     "@type": "WebSite",
 *     name: "My Site",
 *     url: "https://example.com"
 *   }}
 * />
 * ```
 */
export function SafeJsonLd({ data, id }: SafeJsonLdProps) {
  // Validate the entire data structure is safe
  if (!isSafeValue(data)) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[SafeJsonLd] Unsafe data detected - contains functions, symbols, or undefined values')
    }
    return null
  }

  // Sanitize data with custom replacer that removes unsafe values
  const sanitizedData = JSON.stringify(data, (key, value) => {
    // Filter out functions, symbols, and undefined
    if (typeof value === 'function' || typeof value === 'symbol' || value === undefined) {
      return undefined
    }
    return value
  })

  // Additional validation: ensure no script tags in the serialized output
  if (sanitizedData.includes('</script>') || sanitizedData.includes('<script')) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[SafeJsonLd] Potential XSS detected - script tags found in data')
    }
    return null
  }

  return (
    <script
      {...(id && { id })}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedData }}
      suppressHydrationWarning
    />
  )
}
