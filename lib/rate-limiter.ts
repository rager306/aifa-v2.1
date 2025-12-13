/**
 * Simple in-memory rate limiter for authentication attempts
 *
 * WARNING: This is a basic implementation suitable for development/demo only.
 * For production, use:
 * - Redis-based rate limiting (distributed across servers)
 * - IP-based tracking with proper headers (X-Forwarded-For, X-Real-IP)
 * - Database-backed tracking for persistence
 * - Commercial solutions (Cloudflare, AWS WAF, etc.)
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

// In-memory storage - will reset on server restart
const attempts = new Map<string, RateLimitRecord>()

// Track cleanup timers for automatic memory management
// Prevents memory leaks by auto-deleting expired records after window expires
const timers = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Check if identifier has exceeded rate limit
 *
 * Automatically schedules cleanup of expired records to prevent memory leaks.
 * Each identifier gets a timer that deletes its record after the window expires.
 *
 * @param identifier - Unique identifier (email, IP address, etc.)
 * @param maxAttempts - Maximum attempts allowed (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns true if within limit, false if exceeded
 *
 * @example
 * if (!checkRateLimit(email, 5)) {
 *   return { success: false, message: 'Too many attempts. Try again later.' }
 * }
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000, // 15 minutes
): boolean {
  const now = Date.now()
  const record = attempts.get(identifier)

  // No previous attempts or window expired - allow and reset
  if (!record || now > record.resetAt) {
    attempts.set(identifier, { count: 1, resetAt: now + windowMs })

    // Schedule automatic cleanup after window expires to prevent memory leaks
    const existingTimer = timers.get(identifier)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    const timer = setTimeout(() => {
      attempts.delete(identifier)
      timers.delete(identifier)
    }, windowMs)
    timers.set(identifier, timer)

    return true
  }

  // Too many attempts within window
  if (record.count >= maxAttempts) {
    return false
  }

  // Within limit - increment count
  record.count++
  return true
}

/**
 * Reset rate limit for an identifier (useful for testing or manual override)
 *
 * Also clears any associated cleanup timer to prevent orphaned timers.
 *
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  // Clear any associated timer before deleting the record
  const timer = timers.get(identifier)
  if (timer) {
    clearTimeout(timer)
    timers.delete(identifier)
  }
  attempts.delete(identifier)
}

/**
 * Get current attempt count for an identifier
 *
 * @param identifier - Unique identifier to check
 * @returns Current attempt count or 0 if no attempts
 */
export function getRateLimitStatus(identifier: string): { count: number; resetAt: number | null } {
  const record = attempts.get(identifier)

  if (!record) {
    return { count: 0, resetAt: null }
  }

  // Check if window expired
  if (Date.now() > record.resetAt) {
    // Clear associated timer to prevent orphaned timeouts
    const timer = timers.get(identifier)
    if (timer) {
      clearTimeout(timer)
      timers.delete(identifier)
    }
    attempts.delete(identifier)
    return { count: 0, resetAt: null }
  }

  return { count: record.count, resetAt: record.resetAt }
}

/**
 * Cleanup expired rate limit records (periodic maintenance)
 * Call this periodically to prevent memory leaks
 *
 * Also clears associated timers to prevent orphaned timeout references.
 * Note: With automatic timer-based cleanup, this function is now optional
 * but maintained for backward compatibility.
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now()

  for (const [identifier, record] of attempts.entries()) {
    if (now > record.resetAt) {
      // Also clear any associated timer
      const timer = timers.get(identifier)
      if (timer) {
        clearTimeout(timer)
        timers.delete(identifier)
      }
      attempts.delete(identifier)
    }
  }
}
