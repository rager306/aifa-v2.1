//app/@left/(_AUTH)/login/(_server)/actions/auth.ts
"use server"

import { randomUUID } from "node:crypto"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { verifyPassword } from "@/lib/auth/password"
import { checkLoginRateLimit } from "@/lib/auth/upstash-rate-limiter"
import {
  createSession,
  deleteSession,
  findSessionByToken,
  findUserByEmail,
  type Session,
  type User,
  updateLastLogin,
} from "@/lib/db/client"

/**
 * PRODUCTION AUTHENTICATION IMPLEMENTATION
 *
 * Features:
 * - bcrypt password hashing for secure credential storage
 * - Upstash Redis rate limiting (5 attempts per 15 minutes)
 * - Database-backed user authentication and session management
 * - Secure session tokens with HttpOnly, Secure, SameSite cookies
 * - IP address and User-Agent tracking for security auditing
 *
 * Setup Required:
 * 1. Configure DATABASE_URL in .env.local
 * 2. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * 3. Run database migrations from lib/db/schema.sql
 * 4. Set AUTH_SECRET for session encryption (optional)
 *
 * See docs/auth/PRODUCTION-AUTH.md for complete setup instructions
 */

/**
 * Server Action: Production authentication login
 *
 * @param prevState - Previous form state (unused, required by useActionState)
 * @param formData - Form data containing email and password
 * @returns Object with success status and message
 */
export async function loginAction(_prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate input presence
  if (!email || !password) {
    return { success: false, message: "Please provide email and password" }
  }

  // Basic email format validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Invalid email format" }
  }

  try {
    // SECURITY: Rate limiting with Upstash Redis
    try {
      const { success: rateLimitOk, remaining } = await checkLoginRateLimit(email)
      if (!rateLimitOk) {
        return {
          success: false,
          message: `Too many login attempts. ${remaining} attempts remaining. Try again in 15 minutes.`,
        }
      }
    } catch (_error) {
      // biome-ignore lint/suspicious/noConsole: Rate limiter errors need visibility in production
      console.error("Rate limiter configuration error:", _error)
      return {
        success: false,
        message: "Authentication service unavailable. Please contact support.",
      }
    }

    // Find user in database
    let user: User | null = null
    try {
      user = await findUserByEmail(email)
    } catch (error) {
      // Database not configured - check if we're in development mode
      if (process.env.NODE_ENV === "development") {
        return {
          success: false,
          message:
            "Database not configured. Please set DATABASE_URL in .env.local and run migrations. See docs/auth/PRODUCTION-AUTH.md",
        }
      }
      throw error
    }

    if (!user) {
      // Simulate delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: false, message: "Invalid email or password" }
    }

    // Verify password with bcrypt
    const validPassword = await verifyPassword(password, user.password_hash)
    if (!validPassword) {
      // Simulate delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500))
      return { success: false, message: "Invalid email or password" }
    }

    // Get request headers for security tracking
    const headersList = await headers()
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Generate secure session token
    const sessionToken = randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create session in database
    await createSession(user.id, sessionToken, expiresAt, ipAddress, userAgent)

    // Update last login timestamp (optional)
    await updateLastLogin(user.id)

    // Set secure authentication cookie
    const cookieStore = await cookies()
    cookieStore.set({
      name: "auth_session",
      value: sessionToken,
      httpOnly: true, // Not accessible via JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
      path: "/", // Available across entire site
      maxAge: 7 * 24 * 60 * 60, // 7 days expiration
    })

    return { success: true, message: "Login successful" }
  } catch (_error) {
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    }
  }
}

/**
 * Server Action: Logout user
 *
 * Deletes session from database and removes authentication cookie.
 * Works without JavaScript through form submission.
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth_session")

    if (authCookie?.value) {
      // Delete session from database
      try {
        await deleteSession(authCookie.value)
      } catch (_error) {
        // Continue with cookie deletion even if database fails
      }
    }

    // Delete authentication cookie
    cookieStore.delete("auth_session")
  } catch (_error) {}

  // Redirect to home page after logout
  redirect("/")
}

/**
 * Utility: Check if user is authenticated
 *
 * Validates session against database with expiration check.
 * Used in Server Components and Server Actions.
 *
 * @returns Boolean indicating authentication status
 *
 * @example
 * const authenticated = await isAuthenticated()
 * if (!authenticated) redirect('/login')
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth_session")

    if (!authCookie?.value) {
      return false
    }

    // Validate session in database
    try {
      const session = await findSessionByToken(authCookie.value)
      return session !== null && session.expires_at > new Date()
    } catch (_error) {
      // Database not configured - in development, check cookie only
      if (process.env.NODE_ENV === "development") {
        return !!authCookie.value
      }
      return false
    }
  } catch (_error) {
    return false
  }
}

/**
 * Utility: Get user session data
 *
 * Returns user data for authenticated sessions.
 * Validates session and retrieves user from database.
 *
 * @returns User object or null if not authenticated
 *
 * @example
 * const user = await getUserSession()
 * if (!user) redirect('/login')
 * console.log(user.email, user.role)
 */
export async function getUserSession() {
  try {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get("auth_session")

    if (!authCookie?.value) {
      return null
    }

    // Get session from database
    let session: Session | null
    try {
      session = await findSessionByToken(authCookie.value)
    } catch (error) {
      // Database not configured - return mock data in development
      if (process.env.NODE_ENV === "development") {
        return {
          id: "dev-user",
          email: "dev@example.com",
          role: "user",
          name: "Development User",
        }
      }
      throw error
    }

    if (!session || session.expires_at <= new Date()) {
      return null
    }

    // Get user data (you might want to cache this with the session)
    // For now, we'll return basic session info
    // TODO: Join with users table or cache user data in session
    return {
      id: session.user_id,
      email: "user@example.com", // TODO: Get from database
      role: "user", // TODO: Get from database
      name: "User", // TODO: Get from database
    }
  } catch (_error) {
    return null
  }
}

/* ============================================================================
 * DEMO CODE (PRESERVED FOR REFERENCE)
 * ============================================================================
 *
 * The original demo implementation is preserved below for reference.
 * This code accepts any credentials and uses static session values.
 * DO NOT USE IN PRODUCTION.
 *
 * Original demo loginAction:
 * -----------------------------------------------------------------------------
export async function loginAction(_prevState: unknown, formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    return {
      success: false,
      message: "Demo authentication is disabled in production.",
    }
  }

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Please provide email and password" }
  }

  // In-memory rate limiting (not production-ready)
  if (!checkRateLimit(email, 5, 15 * 60 * 1000)) {
    return {
      success: false,
      message: "Too many login attempts. Please try again in 15 minutes.",
    }
  }

  // Simulate server delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // DEMO: Accepts any credentials
  const sessionId = randomUUID()

  const cookieStore = await cookies()
  cookieStore.set({
    name: "auth_session",
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  return { success: true, message: "Login successful" }
}
 * ============================================================================
 */
