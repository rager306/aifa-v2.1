import { describe, expect, it } from "vitest"
import { THEMES, type Theme } from "../themes"

describe("THEMES constant", () => {
  it("should have 7 themes", () => {
    expect(THEMES).toHaveLength(7)
  })

  it("should have correct structure", () => {
    THEMES.forEach((theme) => {
      expect(theme).toHaveProperty("name")
      expect(theme).toHaveProperty("value")
      expect(typeof theme.name).toBe("string")
      expect(typeof theme.value).toBe("string")
    })
  })

  it("should have unique values", () => {
    const values = THEMES.map((t) => t.value)
    const uniqueValues = new Set(values)
    expect(uniqueValues.size).toBe(values.length)
  })

  it("should include expected themes", () => {
    const values = THEMES.map((t) => t.value)
    expect(values).toContain("default")
    expect(values).toContain("neutral")
    expect(values).toContain("stone")
    expect(values).toContain("zinc")
    expect(values).toContain("gray")
    expect(values).toContain("slate")
    expect(values).toContain("scaled")
  })

  it("should have correct theme names", () => {
    const names = THEMES.map((t) => t.name)
    expect(names).toContain("Default")
    expect(names).toContain("Neutral")
    expect(names).toContain("Stone")
    expect(names).toContain("Zinc")
    expect(names).toContain("Gray")
    expect(names).toContain("Slate")
    expect(names).toContain("Scaled")
  })

  it("should export Theme type", () => {
    // Type check - this will fail at compile time if Theme is not exported
    const theme: Theme = THEMES[0]
    expect(theme.name).toBe("Default")
    expect(theme.value).toBe("default")
  })

  it("should have consistent name-value pairs", () => {
    THEMES.forEach((theme) => {
      expect(theme.name.length).toBeGreaterThan(0)
      expect(theme.value.length).toBeGreaterThan(0)
      // Values should be lowercase
      expect(theme.value).toBe(theme.value.toLowerCase())
    })
  })
})
