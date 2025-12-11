/**
 * Password Hashing Utilities
 *
 * Secure password hashing using bcrypt with configurable salt rounds.
 * Industry-standard implementation for production authentication.
 */

import bcrypt from "bcrypt"

// Salt rounds for bcrypt (12 is a good balance between security and performance)
// Higher values increase security but also increase hashing time
// 10 = ~10 hashes/sec, 12 = ~2.5 hashes/sec, 14 = ~0.6 hashes/sec
const SALT_ROUNDS = 12

/**
 * Hash a plain text password using bcrypt
 *
 * @param password - Plain text password to hash
 * @returns Hashed password string (safe to store in database)
 * @throws Error if password is empty or hashing fails
 *
 * @example
 * const hash = await hashPassword("MySecurePassword123!");
 * // Returns: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWDCg7Wu
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error("Password cannot be empty")
  }

  // Validate password strength before hashing
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long")
  }

  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    return hash
  } catch (_error) {
    throw new Error("Failed to hash password")
  }
}

/**
 * Verify a plain text password against a hashed password
 *
 * @param password - Plain text password to verify
 * @param hash - Hashed password from database
 * @returns True if password matches hash, false otherwise
 * @throws Error if inputs are invalid
 *
 * @example
 * const isValid = await verifyPassword("MyPassword123!", hashedPassword);
 * if (isValid) {
 *   // Password is correct
 * }
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    throw new Error("Password and hash are required")
  }

  try {
    const isValid = await bcrypt.compare(password, hash)
    return isValid
  } catch (_error) {
    // Return false instead of throwing to avoid leaking information
    return false
  }
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!password) {
    errors.push("Password is required")
    return { valid: false, errors }
  }

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long")
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  // Check for common weak passwords
  const commonPasswords = ["password", "12345678", "qwerty", "abc123", "password123"]
  if (commonPasswords.some((weak) => password.toLowerCase().includes(weak))) {
    errors.push("Password is too common")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Check if password needs rehashing (e.g., if salt rounds increased)
 *
 * @param hash - Current password hash
 * @returns True if hash should be updated
 */
export function needsRehash(hash: string): boolean {
  try {
    const rounds = bcrypt.getRounds(hash)
    return rounds < SALT_ROUNDS
  } catch (_error) {
    // If we can't determine rounds, assume it needs rehashing
    return true
  }
}

/**
 * Generate a secure random password
 * Useful for temporary passwords or password reset
 *
 * @param length - Length of password (default: 16)
 * @returns Secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz"
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  const special = "!@#$%^&*()_+-=[]{}|;:,.<>?"
  const all = lowercase + uppercase + numbers + special

  let password = ""

  // Ensure at least one of each type
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}
