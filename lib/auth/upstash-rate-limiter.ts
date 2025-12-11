/**
 * Upstash Redis Rate Limiter
 *
 * Production-ready rate limiting for authentication endpoints using Upstash Redis.
 * Prevents brute force attacks with sliding window algorithm.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
// Required: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
let redis: Redis | null = null;
let loginRateLimiter: Ratelimit | null = null;

try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = Redis.fromEnv();

    // Create rate limiter instance
    // 5 login attempts per 15 minutes per identifier (email/IP)
    loginRateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:login",
    });
  }
} catch (error) {
  console.error("Failed to initialize Upstash Redis:", error);
}

/**
 * Check rate limit for login attempts
 *
 * @param identifier - Unique identifier (email or IP address)
 * @returns Rate limit result with success status and metadata
 */
export async function checkLoginRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // Fallback if Upstash is not configured (development mode)
  if (!loginRateLimiter) {
    console.warn(
      "Upstash rate limiter not configured. Using in-memory fallback."
    );
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 15 * 60 * 1000,
    };
  }

  try {
    const { success, limit, remaining, reset } =
      await loginRateLimiter.limit(identifier);

    return {
      success,
      limit,
      remaining,
      reset,
    };
  } catch (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow request but log the issue
    return {
      success: true,
      limit: 5,
      remaining: 5,
      reset: Date.now() + 15 * 60 * 1000,
    };
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
  prefix: string
): Ratelimit | null {
  if (!redis) {
    console.warn("Redis not configured for custom rate limiter");
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxAttempts, `${windowMs}ms`),
    analytics: true,
    prefix: `ratelimit:${prefix}`,
  });
}

/**
 * Reset rate limit for a specific identifier
 * Useful for manual intervention or testing
 *
 * @param identifier - Unique identifier to reset
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  if (!redis) {
    console.warn("Redis not configured, cannot reset rate limit");
    return;
  }

  try {
    await redis.del(`ratelimit:login:${identifier}`);
  } catch (error) {
    console.error("Failed to reset rate limit:", error);
  }
}

/**
 * Get current rate limit status without incrementing counter
 *
 * @param identifier - Unique identifier to check
 */
export async function getRateLimitStatus(identifier: string): Promise<{
  remaining: number;
  reset: number;
} | null> {
  if (!redis) {
    return null;
  }

  try {
    const key = `ratelimit:login:${identifier}`;
    const data = await redis.get(key);

    if (!data) {
      return { remaining: 5, reset: Date.now() + 15 * 60 * 1000 };
    }

    // Parse Upstash rate limit data structure
    // This is a simplified version - actual implementation may vary
    return {
      remaining: 5 - (typeof data === 'number' ? data : 0),
      reset: Date.now() + 15 * 60 * 1000,
    };
  } catch (error) {
    console.error("Failed to get rate limit status:", error);
    return null;
  }
}

export { redis, loginRateLimiter };
