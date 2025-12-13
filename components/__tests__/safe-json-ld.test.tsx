// components/__tests__/safe-json-ld.test.tsx
import { render } from "@testing-library/react"
import { SafeJsonLd } from "../safe-json-ld"

describe("SafeJsonLd", () => {
  beforeEach(() => {
    // Suppress console.error in tests
    jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it("renders valid JSON-LD data", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Test Site",
      url: "https://example.com",
    }

    const { container } = render(<SafeJsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.textContent).toBe(JSON.stringify(data))
  })

  it("renders with custom id", () => {
    const data = { "@type": "Organization", name: "Test" }
    const { container } = render(<SafeJsonLd id="custom-id" data={data} />)
    const script = container.querySelector("script#custom-id")

    expect(script).toBeInTheDocument()
  })

  it("filters out functions from data", () => {
    const data = {
      name: "Test",
      callback: () => "unsafe",
    }

    const { container } = render(<SafeJsonLd data={data} />)

    // Component should return null for unsafe data
    expect(container.querySelector("script")).not.toBeInTheDocument()
    // biome-ignore lint/suspicious/noConsole: Testing console output
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Unsafe data detected"))
  })

  it("filters out symbols from data", () => {
    const data = {
      name: "Test",
      [Symbol("test")]: "unsafe",
    }

    const { container } = render(<SafeJsonLd data={data} />)
    expect(container.querySelector("script")).not.toBeInTheDocument()
  })

  it("filters out undefined values", () => {
    const data = {
      name: "Test",
      undefinedValue: undefined,
    }

    const { container } = render(<SafeJsonLd data={data} />)
    expect(container.querySelector("script")).not.toBeInTheDocument()
  })

  it("rejects data containing script tags", () => {
    const data = {
      name: 'Test</script><script>alert("xss")</script>',
    }

    const { container } = render(<SafeJsonLd data={data} />)
    expect(container.querySelector("script")).not.toBeInTheDocument()
    // biome-ignore lint/suspicious/noConsole: Testing console output
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Potential XSS detected"))
  })

  it("handles nested objects safely", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      contactPoint: {
        "@type": "ContactPoint",
        email: "test@example.com",
      },
    }

    const { container } = render(<SafeJsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.textContent).toBe(JSON.stringify(data))
  })

  it("handles arrays safely", () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "Organization",
      sameAs: ["https://twitter.com/example", "https://github.com/example"],
    }

    const { container } = render(<SafeJsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.textContent).toBe(JSON.stringify(data))
  })

  it("rejects arrays containing functions", () => {
    const data = {
      "@type": "Organization",
      items: ["safe", () => "unsafe"],
    }

    const { container } = render(<SafeJsonLd data={data} />)
    expect(container.querySelector("script")).not.toBeInTheDocument()
  })

  it("allows null values", () => {
    const data = {
      "@type": "Organization",
      name: "Test",
      alternateName: null,
    }

    const { container } = render(<SafeJsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.textContent).toBe(JSON.stringify(data))
  })

  it("allows primitive values", () => {
    const data = {
      "@type": "WebSite",
      name: "Test",
      isPublic: true,
      views: 1000,
      rating: 4.5,
    }

    const { container } = render(<SafeJsonLd data={data} />)
    const script = container.querySelector('script[type="application/ld+json"]')

    expect(script).toBeInTheDocument()
    expect(script?.textContent).toBe(JSON.stringify(data))
  })

  it("does not render in production when data is unsafe", () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    const data = {
      name: "Test",
      unsafeFunction: () => "xss",
    }

    const { container } = render(<SafeJsonLd data={data} />)
    expect(container.querySelector("script")).not.toBeInTheDocument()
    // biome-ignore lint/suspicious/noConsole: Testing console output
    expect(console.error).not.toHaveBeenCalled() // No console.error in production

    process.env.NODE_ENV = originalEnv
  })
})
