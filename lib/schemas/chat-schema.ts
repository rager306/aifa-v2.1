import { z } from "zod"

// Sanitize message content by removing potentially harmful patterns
export function sanitizeMessageContent(content: string): string {
  const sanitized = content
    .trim()
    // biome-ignore lint/suspicious/noControlCharactersInRegex: Removing control characters is intentional
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/gu, "") // Remove control characters
    .substring(0, 10000)

  // Additional prompt injection pattern detection
  // SECURITY: Detect and neutralize common prompt injection attempts
  const injectionPatterns = [
    /ignore previous instructions/gi,
    /disregard the above/gi,
    /forget everything/gi,
    /system prompt/gi,
    /you are now/gi,
    /role-play as/gi,
    /pretend you are/gi,
    /you must follow/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
  ]

  for (const pattern of injectionPatterns) {
    if (pattern.test(sanitized)) {
      // Neutralize by replacing with safe marker
      return sanitized.replace(pattern, "[FILTERED_CONTENT]")
    }
  }

  return sanitized
}

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(10000).transform(sanitizeMessageContent),
      }),
    )
    .min(1)
    .max(50),
})

export type ChatRequest = z.infer<typeof chatRequestSchema>
