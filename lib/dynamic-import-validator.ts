/**
 * Dynamic Import Validator
 *
 * Provides a secure allowlist-based validation system for dynamic imports.
 * Only modules explicitly listed in ALLOWED_DYNAMIC_IMPORTS can be dynamically loaded.
 *
 * @module dynamic-import-validator
 */

/**
 * Allowlist of permitted dynamic import paths.
 * All dynamic imports must be explicitly declared here.
 */
const ALLOWED_DYNAMIC_IMPORTS = [
  '@/components/pwa-install-prompt',
] as const;

/**
 * Type representing a valid dynamic import path
 */
type AllowedImport = typeof ALLOWED_DYNAMIC_IMPORTS[number];

/**
 * Validates if a given path is in the allowlist of permitted dynamic imports
 *
 * @param path - The import path to validate
 * @returns True if the path is allowed, false otherwise
 *
 * @example
 * ```typescript
 * if (validateDynamicImport('@/components/pwa-install-prompt')) {
 *   // Path is valid and safe to import
 * }
 * ```
 */
export function validateDynamicImport(path: string): path is AllowedImport {
  return ALLOWED_DYNAMIC_IMPORTS.includes(path as AllowedImport);
}

/**
 * Safely imports a module after validating it's in the allowlist
 *
 * @param path - The module path to import (must be in ALLOWED_DYNAMIC_IMPORTS)
 * @returns Promise resolving to the imported module
 * @throws Error if the path is not in the allowlist
 *
 * @example
 * ```typescript
 * const module = await safeDynamicImport<typeof import("@/components/pwa-install-prompt")>(
 *   "@/components/pwa-install-prompt"
 * );
 * ```
 */
export async function safeDynamicImport<T>(path: AllowedImport): Promise<T> {
  if (!validateDynamicImport(path)) {
    throw new Error(`Unauthorized dynamic import: ${path}`);
  }
  return import(path) as Promise<T>;
}

/**
 * Type-safe helper for dynamic imports with Next.js dynamic()
 *
 * @param path - The module path to import
 * @returns A function compatible with Next.js dynamic()
 *
 * @example
 * ```typescript
 * const Component = dynamic(
 *   createSafeImporter("@/components/pwa-install-prompt")
 *     .then((mod) => mod.PWAInstallPrompt)
 * );
 * ```
 */
export function createSafeImporter<T>(path: AllowedImport): Promise<T> {
  return safeDynamicImport<T>(path);
}
