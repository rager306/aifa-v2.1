/**
 * Upstash Redis Rate Limiter
 *
 * Production-ready rate limiting for authentication endpoints using Upstash Redis.
 * Prevents brute force attacks with sliding window algorithm.
 */

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Initialize Redis client from environment variables
// Required: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null
let loginRateLimiter: Ratelimit | null = null

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()

    // Create rate limiter instance
    // 5 login attempts per 15 minutes per identifier (email/IP)
    loginRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:login",
    })
  }
} catch (_error) {}

/**
 * Check if rate limiter is properly configured
 * Throws an error in production if rate limiter is not configured
 */
function _checkRateLimiterConfig(): void {
  if (!loginRateLimiter && process.env.NODE_ENV === "production") {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables are not configured. " +
        "Rate limiting is required in production to prevent brute force attacks. " +
        "Please configure Upstash Redis credentials in your environment variables.",
    )
  }
}

/**
 * Check rate limit for login attempts
 *
 * @param identifier - Unique identifier (email or IP address)
 * @returns Rate limit result with success status and metadata
 */
export async function checkLoginRateLimit(identifier: string): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: number
}> {
  // Check rate limiter configuration
  // In production: fail closed (throw error if not configured)
  // In development: fail open (allow requests with warning)
  if (!loginRateLimiter) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Rate limiter not configured. UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN " +
          "environment variables are required in production to prevent brute force attacks.",
      )
    }
    // biome-ignore lint/suspicious/noConsole: Development warning for missing rate limiter configuration
    console.warn(
      "Upstash rate limiter not configured. Rate limiting is disabled in development mode.",
    )
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 15 * 60 * 1000,
    }
  }

  try {
    const { success, limit, remaining, reset } = await loginRateLimiter.limit(identifier)

    return {
      success,
      limit,
      remaining,
      reset,
    }
  } catch (_error) {
    // biome-ignore lint/suspicious/noConsole: Production error logging for rate limiter failures
    console.error("Rate limiter configuration error:", _error)
    // Fail closed in production on errors
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: Date.now(),
      }
    }
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 15 * 60 * 1000,
    }
  }
}

/**
 * Create a custom rate limiter with different limits
 *
 * @param maxAttempts - Maximum number of attempts
 * @param windowMs - Time window in milliseconds
 * @param prefix - Key prefix for Redis
 * @returns Custom rate limiter instance
 */
export function createCustomRateLimiter(
  maxAttempts: number,
  windowMs: number,
  prefix: string,
): Ratelimit | null {
  if (!redis) {
    return null
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxAttempts, `${windowMs}ms`),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  })
}

/**
 * Reset rate limit for a specific identifier
 * Useful for manual intervention or testing
 *
 * @param identifier - Unique identifier to reset
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  if (!redis) {
    return
  }

  try {
    await redis.del(`ratelimit:login:${identifier}`)
  } catch (_error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for rate limit reset failures
    console.error("Failed to reset rate limit:", _error)
  }
}

/**
 * Get current rate limit status without incrementing counter
 *
 * @param identifier - Unique identifier to check
 */
export async function getRateLimitStatus(identifier: string): Promise<{
  remaining: number
  reset: number
} | null> {
  if (!redis) {
    return null
  }

  try {
    const key = `ratelimit:login:${identifier}`
    const data = await redis.get(key)

    if (!data) {
      return { remaining: 5, reset: Date.now() + 15 * 60 * 1000 }
    }

    // Parse Upstash rate limit data structure
    // This is a simplified version - actual implementation may vary
    return {
      remaining: 5 - (typeof data === "number" ? data : 0),
      reset: Date.now() + 15 * 60 * 1000,
    }
  } catch (_error) {
    // biome-ignore lint/suspicious/noConsole: Error logging for rate limit status check failures
    console.error("Failed to get rate limit status:", _error)
    return null
  }
}

export { redis, loginRateLimiter }
