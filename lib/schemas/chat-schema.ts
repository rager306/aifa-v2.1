import { z } from "zod"

// Sanitize message content by removing potentially harmful patterns
export function sanitizeMessageContent(content: string): string {
  return content
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
    .substring(0, 10000) // Enforce max length
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
