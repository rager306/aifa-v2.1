import { describe, expect, it } from "vitest"
import { chatRequestSchema, sanitizeMessageContent } from "../chat-schema"

describe("Chat Schema Validation", () => {
  it("validates correct message format", () => {
    const validData = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ],
    }

    const result = chatRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects invalid role", () => {
    const invalidData = {
      messages: [{ role: "invalid", content: "Hello" }],
    }

    const result = chatRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it("rejects empty content", () => {
    const invalidData = {
      messages: [{ role: "user", content: "" }],
    }

    const result = chatRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it("rejects content exceeding max length", () => {
    const invalidData = {
      messages: [{ role: "user", content: "a".repeat(10001) }],
    }

    const result = chatRequestSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it("sanitizes control characters", () => {
    const dirty = "Hello\x00\x01World"
    const clean = sanitizeMessageContent(dirty)
    expect(clean).toBe("HelloWorld")
  })

  it("enforces max length in sanitization", () => {
    const tooLong = "a".repeat(15000)
    const sanitized = sanitizeMessageContent(tooLong)
    expect(sanitized.length).toBe(10000)
  })
})
