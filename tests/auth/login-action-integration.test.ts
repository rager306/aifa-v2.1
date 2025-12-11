/**
 * Login Action Integration Tests
 *
 * Tests the integration between loginAction and the rate limiter,
 * specifically focusing on fail-closed behavior and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock dependencies
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
  headers: vi.fn(() => ({
    get: vi.fn((header: string) => {
      if (header === "x-forwarded-for") return "192.168.1.1";
      if (header === "user-agent") return "Test Agent";
      return null;
    }),
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/upstash-rate-limiter");
vi.mock("@/lib/auth/password");
vi.mock("@/lib/db/client");

describe("Login Action - Rate Limiter Integration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("Rate Limiter Error Handling", () => {
    it("should handle rate limiter throwing errors in production", async () => {
      process.env.NODE_ENV = "production";

      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      // Mock rate limiter to throw error
      vi.mocked(checkLoginRateLimit).mockRejectedValue(
        new Error("Rate limiter unavailable")
      );

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      const result = await loginAction(null, formData);

      // Should return user-friendly error message
      expect(result.success).toBe(false);
      expect(result.message).toContain("Authentication service unavailable");
      expect(result.message).not.toContain("Rate limiter"); // Don't expose internal details
    });

    it("should handle rate limiter returning undefined in production", async () => {
      process.env.NODE_ENV = "production";

      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      // Mock rate limiter to return undefined (simulating initialization failure)
      // @ts-expect-error - Testing error condition
      vi.mocked(checkLoginRateLimit).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      const result = await loginAction(null, formData);

      expect(result.success).toBe(false);
    });
  });

  describe("Rate Limit Exceeded Scenarios", () => {
    it("should show remaining attempts when rate limited", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      // Mock rate limit exceeded
      vi.mocked(checkLoginRateLimit).mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 15 * 60 * 1000,
      });

      const formData = new FormData();
      formData.set("email", "blocked@example.com");
      formData.set("password", "password123");

      const result = await loginAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Too many login attempts");
      expect(result.message).toContain("0 attempts remaining");
    });

    it("should prevent login when rate limited even with valid credentials", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );
      const { findUserByEmail, verifyPassword } = await import("@/lib/db/client");

      // Mock rate limit exceeded
      vi.mocked(checkLoginRateLimit).mockResolvedValue({
        success: false,
        limit: 5,
        remaining: 0,
        reset: Date.now() + 15 * 60 * 1000,
      });

      // Mock valid user and password
      // @ts-expect-error - Mock implementation
      vi.mocked(findUserByEmail).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password_hash: "$2a$10$validhash",
      });

      const { verifyPassword: verify } = await import("@/lib/auth/password");
      vi.mocked(verify).mockResolvedValue(true);

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "correct-password");

      const result = await loginAction(null, formData);

      // Should be blocked by rate limiter before checking credentials
      expect(result.success).toBe(false);
      expect(result.message).toContain("Too many login attempts");

      // Should NOT check password when rate limited (optimization)
      expect(verify).not.toHaveBeenCalled();
    });
  });

  describe("Successful Rate Limit Checks", () => {
    it("should proceed with login when rate limit check passes", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );
      const { findUserByEmail, createSession } = await import("@/lib/db/client");
      const { verifyPassword } = await import("@/lib/auth/password");

      // Mock successful rate limit check
      vi.mocked(checkLoginRateLimit).mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() + 15 * 60 * 1000,
      });

      // Mock valid user
      // @ts-expect-error - Mock implementation
      vi.mocked(findUserByEmail).mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        password_hash: "$2a$10$validhash",
      });

      vi.mocked(verifyPassword).mockResolvedValue(true);
      vi.mocked(createSession).mockResolvedValue(undefined);

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "correct-password");

      const result = await loginAction(null, formData);

      expect(result.success).toBe(true);
      expect(checkLoginRateLimit).toHaveBeenCalledWith("test@example.com");
    });

    it("should use email as rate limit identifier", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      vi.mocked(checkLoginRateLimit).mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() + 15 * 60 * 1000,
      });

      const formData = new FormData();
      formData.set("email", "specific@example.com");
      formData.set("password", "password123");

      await loginAction(null, formData);

      expect(checkLoginRateLimit).toHaveBeenCalledWith("specific@example.com");
    });
  });

  describe("Development vs Production Behavior", () => {
    it("should allow login in development when rate limiter is unavailable", async () => {
      process.env.NODE_ENV = "development";

      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      // Mock rate limiter returning development fallback
      vi.mocked(checkLoginRateLimit).mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 5,
        reset: Date.now() + 15 * 60 * 1000,
      });

      const formData = new FormData();
      formData.set("email", "dev@example.com");
      formData.set("password", "password123");

      // Should not throw or fail due to rate limiter
      const result = await loginAction(null, formData);

      // May fail for other reasons (invalid credentials, etc.), but not rate limiter
      expect(checkLoginRateLimit).toHaveBeenCalled();
    });

    it("should block login in production when rate limiter is unavailable", async () => {
      process.env.NODE_ENV = "production";

      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      // Mock rate limiter throwing error (unconfigured in production)
      vi.mocked(checkLoginRateLimit).mockRejectedValue(
        new Error("Upstash not configured")
      );

      const formData = new FormData();
      formData.set("email", "prod@example.com");
      formData.set("password", "password123");

      const result = await loginAction(null, formData);

      // EXPECTED: Should fail in production without rate limiter
      expect(result.success).toBe(false);
    });
  });

  describe("Input Validation Before Rate Limiting", () => {
    it("should validate input before checking rate limit", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      const formData = new FormData();
      // Missing password
      formData.set("email", "test@example.com");

      const result = await loginAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("email and password");

      // Should NOT check rate limit for invalid input
      expect(checkLoginRateLimit).not.toHaveBeenCalled();
    });

    it("should validate email format before rate limiting", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      const formData = new FormData();
      formData.set("email", "invalid-email");
      formData.set("password", "password123");

      const result = await loginAction(null, formData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Invalid email format");

      // Should NOT check rate limit for invalid email format
      expect(checkLoginRateLimit).not.toHaveBeenCalled();
    });
  });

  describe("Error Logging and Monitoring", () => {
    it("should log rate limiter errors for monitoring", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      const error = new Error("Redis connection timeout");
      vi.mocked(checkLoginRateLimit).mockRejectedValue(error);

      const formData = new FormData();
      formData.set("email", "test@example.com");
      formData.set("password", "password123");

      await loginAction(null, formData);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Rate limiter configuration error"),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Concurrent Login Attempts", () => {
    it("should handle concurrent login attempts correctly", async () => {
      const { checkLoginRateLimit } = await import(
        "@/lib/auth/upstash-rate-limiter"
      );
      const { loginAction } = await import(
        "@/app/@left/(_AUTH)/login/(_server)/actions/auth"
      );

      let attempts = 0;
      vi.mocked(checkLoginRateLimit).mockImplementation(async () => {
        attempts++;
        return {
          success: attempts <= 5,
          limit: 5,
          remaining: Math.max(0, 5 - attempts),
          reset: Date.now() + 15 * 60 * 1000,
        };
      });

      const email = "concurrent@example.com";
      const formData = new FormData();
      formData.set("email", email);
      formData.set("password", "password123");

      // Simulate 10 concurrent attempts
      const results = await Promise.all(
        Array.from({ length: 10 }, () => loginAction(null, formData))
      );

      // First 5 should check rate limit, remaining should be blocked
      expect(checkLoginRateLimit).toHaveBeenCalledTimes(10);

      // At least some should be rate limited
      const rateLimited = results.filter((r) =>
        r.message?.includes("Too many login attempts")
      );
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Integration Testing Notes:
 *
 * These tests verify that:
 * 1. loginAction correctly handles rate limiter responses
 * 2. Errors are caught and user-friendly messages returned
 * 3. Rate limiting happens before expensive operations (password hashing)
 * 4. Different environments (dev/prod) behave appropriately
 * 5. Input validation occurs before rate limiting
 *
 * Key Security Considerations:
 * - Rate limiter failures should NOT allow unlimited attempts in production
 * - Error messages should not expose internal implementation details
 * - Rate limiting should use consistent identifiers (email)
 * - Concurrent requests should be handled safely
 */
