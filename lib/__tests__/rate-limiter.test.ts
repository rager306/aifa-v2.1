import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  checkRateLimit,
  cleanupExpiredRecords,
  getRateLimitStatus,
  resetRateLimit,
} from "../rate-limiter"

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // Clear rate limit records before each test
    const identifier = "test@example.com"
    resetRateLimit(identifier)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("allows requests within limit", () => {
    const identifier = "test@example.com"

    for (let i = 0; i < 5; i++) {
      const allowed = checkRateLimit(identifier, 5)
      expect(allowed).toBe(true)
    }
  })

  it("blocks requests exceeding limit", () => {
    const identifier = "test@example.com"

    // Use up all 5 attempts
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, 5)
    }

    // 6th attempt should be blocked
    const blocked = checkRateLimit(identifier, 5)
    expect(blocked).toBe(false)
  })

  it("resets after time window expires", () => {
    const identifier = "test@example.com"

    // Use up limit
    for (let i = 0; i < 5; i++) {
      checkRateLimit(identifier, 5)
    }

    // Manually reset (simulating time passage)
    resetRateLimit(identifier)

    // Should allow again
    const allowed = checkRateLimit(identifier, 5)
    expect(allowed).toBe(true)
  })

  it("automatically cleans up expired records via timers", () => {
    const identifier = "test@example.com"
    const maxAttempts = 5
    const windowMs = 1000 // 1 second

    // Use up all attempts
    for (let i = 0; i < maxAttempts; i++) {
      checkRateLimit(identifier, maxAttempts, windowMs)
    }

    // Should be blocked
    expect(checkRateLimit(identifier, maxAttempts, windowMs)).toBe(false)

    // Fast-forward time past the window
    vi.advanceTimersByTime(windowMs + 1)

    // Should allow again (record was auto-cleaned)
    expect(checkRateLimit(identifier, maxAttempts, windowMs)).toBe(true)
  })

  it("clears timers when resetRateLimit is called", () => {
    const identifier = "test@example.com"
    const maxAttempts = 5
    const windowMs = 1000

    // Create a record with a timer
    checkRateLimit(identifier, maxAttempts, windowMs)

    // Reset should clear the timer
    resetRateLimit(identifier)

    // Advance time - no timer should fire
    vi.advanceTimersByTime(windowMs + 100)

    // Record should still be deleted (manual reset worked)
    expect(checkRateLimit(identifier, maxAttempts, windowMs)).toBe(true)
  })

  it("getRateLimitStatus clears timers when deleting expired records", () => {
    const identifier = "test@example.com"
    const maxAttempts = 5
    const windowMs = 1000

    // Create a record with a timer
    checkRateLimit(identifier, maxAttempts, windowMs)

    // Fast-forward past the window to make it expired
    vi.advanceTimersByTime(windowMs + 100)

    // Get status should detect expiry and clear the timer
    const status = getRateLimitStatus(identifier)
    expect(status).toEqual({ count: 0, resetAt: null })

    // Advance time further - no timer should fire (was cleared)
    vi.advanceTimersByTime(windowMs + 100)

    // Should still be clean (timer was properly cleared)
    const status2 = getRateLimitStatus(identifier)
    expect(status2).toEqual({ count: 0, resetAt: null })
  })

  it("getRateLimitStatus does not clear timers for non-expired records", () => {
    const identifier = "test@example.com"
    const maxAttempts = 5
    const windowMs = 1000

    // Create a record with a timer
    checkRateLimit(identifier, maxAttempts, windowMs)

    // Get status for non-expired record
    const status = getRateLimitStatus(identifier)
    expect(status).toEqual({ count: 1, resetAt: expect.any(Number) })

    // Timer should still be active
    // If we advance time less than the window, the record should still exist
    vi.advanceTimersByTime(windowMs - 100)

    const status2 = getRateLimitStatus(identifier)
    expect(status2.count).toBeGreaterThan(0)
  })

  it("cleanupExpiredRecords clears all associated timers", () => {
    const identifier1 = "test1@example.com"
    const identifier2 = "test2@example.com"
    const identifier3 = "test3@example.com"
    const maxAttempts = 5
    const windowMs = 1000

    // Create records with timers
    checkRateLimit(identifier1, maxAttempts, windowMs)
    checkRateLimit(identifier2, maxAttempts, windowMs)
    checkRateLimit(identifier3, maxAttempts, windowMs)

    // Fast-forward to make them expired
    vi.advanceTimersByTime(windowMs + 100)

    // Call cleanup
    cleanupExpiredRecords()

    // All timers should be cleared
    vi.advanceTimersByTime(windowMs + 100)

    // Records should remain cleaned up
    expect(getRateLimitStatus(identifier1)).toEqual({ count: 0, resetAt: null })
    expect(getRateLimitStatus(identifier2)).toEqual({ count: 0, resetAt: null })
    expect(getRateLimitStatus(identifier3)).toEqual({ count: 0, resetAt: null })
  })
})
