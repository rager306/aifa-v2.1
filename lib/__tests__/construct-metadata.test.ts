import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  type AuthorConfig,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildCollectionSchema,
  buildFAQSchema,
  buildOrganizationSchemaWithDefaults,
  buildProductSchema,
  constructMetadata,
  getDefaultAuthorInfo,
} from "../construct-metadata"

// Mock the app-config module
// Using dedicated mock file to avoid duplication and maintain a single source of truth
vi.mock("@/config/app-config", async () => {
  const mock = await vi.importActual("./__mocks__/app-config.mock")
  return {
    ...mock,
  }
})

describe("constructMetadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_GOOGLE_VERIFICATION", "test-google-token")
    vi.stubEnv("NEXT_PUBLIC_YANDEX_VERIFICATION", "yandex-token")
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_AUTHOR_NAME", "Test Author")
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_AUTHOR_EMAIL", "author@test.example.com")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("should return default metadata", () => {
    const metadata = constructMetadata()

    expect(metadata.title).toEqual({
      default: "Test App",
      template: "%s | Test",
    })
    expect(metadata.description).toBe("Test description")
    expect(metadata.metadataBase).toEqual(new URL("https://test.example.com"))
  })

  it("should handle custom title and description", () => {
    const metadata = constructMetadata({
      title: "Custom Title",
      description: "Custom description",
    })

    expect(metadata.title).toEqual({
      default: "Custom Title",
      template: "%s | Test",
    })
    expect(metadata.description).toBe("Custom description")
  })

  it("should generate correct canonical URL", () => {
    const metadata = constructMetadata({ pathname: "/about" })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/about")
  })

  it("should handle root path", () => {
    const metadata = constructMetadata({ pathname: "/" })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/")
  })

  it("should handle path without leading slash", () => {
    const metadata = constructMetadata({ pathname: "about" })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/about")
  })

  it("should handle path with double slashes", () => {
    const metadata = constructMetadata({ pathname: "//about//page" })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/about/page")
  })

  it("should set noIndex and noFollow", () => {
    const metadata = constructMetadata({ noIndex: true, noFollow: true })

    expect(metadata.robots?.index).toBe(false)
    expect(metadata.robots?.follow).toBe(false)
  })

  it("should respect default robots settings", () => {
    const metadata = constructMetadata()

    expect(metadata.robots?.index).toBe(true)
    expect(metadata.robots?.follow).toBe(true)
  })

  it("should include verification tokens", () => {
    const metadata = constructMetadata()

    expect(metadata.verification).toEqual({
      google: "test-google-token",
      yandex: "yandex-token",
    })
  })

  it("should handle custom author", () => {
    const customAuthor: AuthorConfig = {
      name: "John Doe",
      email: "john@example.com",
      url: "https://john.example.com",
    }

    const metadata = constructMetadata({ author: customAuthor })

    expect(metadata.authors).toEqual([{ name: "John Doe", url: "https://john.example.com" }])
  })

  it("should use default author when none provided", () => {
    const metadata = constructMetadata()

    expect(metadata.authors).toEqual([{ name: "Test Author", url: undefined }])
  })

  it("should handle author without social URLs", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe", email: "john@example.com" },
    })

    // sameAs should be undefined when no social URLs are provided
    expect((schema.author as any).sameAs).toBeUndefined()
  })

  it("should handle author with social URLs", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: {
        name: "John Doe",
        email: "john@example.com",
        twitter: "johndoe",
        facebook: "johndoe",
      },
    })

    // sameAs should be present when social URLs are provided
    expect((schema.author as any).sameAs).toContain("https://twitter.com/johndoe")
    expect((schema.author as any).sameAs).toContain("https://facebook.com/johndoe")
  })

  it("should format facebook URL without http prefix", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe", email: "john@example.com", facebook: "johndoe" },
    })

    expect((schema.author as any).sameAs).toContain("https://facebook.com/johndoe")
  })

  it("should handle author with facebook URL starting with http", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: {
        name: "John Doe",
        email: "john@example.com",
        facebook: "https://facebook.com/johndoe",
      },
    })

    expect((schema.author as any).sameAs).toContain("https://facebook.com/johndoe")
  })

  it("should handle author with url field", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe", email: "john@example.com", url: "https://johndoe.com" },
    })

    expect((schema.author as any).url).toBe("https://johndoe.com")
  })

  it("should handle author with linkedin URL starting with http", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: {
        name: "John Doe",
        email: "john@example.com",
        linkedin: "https://linkedin.com/in/johndoe",
      },
    })

    expect((schema.author as any).sameAs).toContain("https://linkedin.com/in/johndoe")
  })

  it("should format linkedin URL without http prefix", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe", email: "john@example.com", linkedin: "johndoe" },
    })

    expect((schema.author as any).sameAs).toContain("https://linkedin.com/in/johndoe")
  })

  it("should handle author with twitter URL starting with http", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: {
        name: "John Doe",
        email: "john@example.com",
        twitter: "https://twitter.com/johndoe",
      },
    })

    expect((schema.author as any).sameAs).toContain("https://twitter.com/johndoe")
  })

  it("should use website as default content type", () => {
    const metadata = constructMetadata({ contentType: "documentation" })

    expect(metadata.openGraph?.type).toBe("website")
  })

  it("should build organization schema with defaults", () => {
    const schema = buildOrganizationSchemaWithDefaults()

    expect(schema["@type"]).toBe("Organization")
    expect(schema.name).toBe("TestApp")
  })

  it("should handle different content types", () => {
    const metadata = constructMetadata({ contentType: "article" })

    expect(metadata.openGraph?.type).toBe("article")
    expect(metadata.other?.["content-type"]).toBe("article")
  })

  it("should handle website content type", () => {
    const metadata = constructMetadata({ contentType: "website" })

    expect(metadata.openGraph?.type).toBe("website")
  })

  it("should handle blog content type", () => {
    const metadata = constructMetadata({ contentType: "blog" })

    expect(metadata.openGraph?.type).toBe("article")
  })

  it("should handle product content type", () => {
    const metadata = constructMetadata({ contentType: "product" })

    expect(metadata.openGraph?.type).toBe("website")
    expect(metadata.other?.["content-type"]).toBe("product")
  })

  it("should handle custom image", () => {
    const metadata = constructMetadata({ image: "/custom-image.jpg" })

    expect(metadata.openGraph?.images?.[0]?.url).toBe("/custom-image.jpg")
    expect(metadata.twitter?.images?.[0]).toBe("/custom-image.jpg")
  })

  it("should handle custom locale", () => {
    const metadata = constructMetadata({ locale: "es" })

    expect(metadata.openGraph?.locale).toBe("es")
  })

  it("should truncate long descriptions", () => {
    const longDescription = "a".repeat(200)
    const metadata = constructMetadata({ description: longDescription })

    expect(metadata.description?.length).toBe(160)
    expect(metadata.description?.endsWith("...")).toBe(true)
  })

  it("should not truncate short descriptions", () => {
    const shortDescription = "Short description"
    const metadata = constructMetadata({ description: shortDescription })

    expect(metadata.description).toBe(shortDescription)
  })

  it("should include icons", () => {
    const metadata = constructMetadata()

    expect(metadata.icons).toBeDefined()
    expect(Array.isArray(metadata.icons)).toBe(true)
    expect(metadata.icons?.length).toBeGreaterThan(0)
  })

  it("should include manifest", () => {
    const metadata = constructMetadata()

    expect(metadata.manifest).toBe("/manifest.json")
  })

  it("should handle custom pathname with base URL", () => {
    const metadata = constructMetadata({ pathname: "/products/123" })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/products/123")
  })

  it("should handle undefined pathname", () => {
    const metadata = constructMetadata({ pathname: undefined })

    expect(metadata.alternates?.canonical).toBe("https://test.example.com/")
  })
})

describe("buildArticleSchema", () => {
  it("should generate valid BlogPosting schema", () => {
    const schema = buildArticleSchema({
      headline: "Test Article",
      datePublished: "2024-01-01",
      author: { name: "John Doe", email: "john@example.com" },
      image: "/article.jpg",
      description: "Test description",
    })

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("BlogPosting")
    expect(schema.headline).toBe("Test Article")
    expect(schema.datePublished).toBe("2024-01-01")
    expect(schema.description).toBe("Test description")
    expect(schema.image).toEqual({
      "@type": "ImageObject",
      url: "/article.jpg",
    })
  })

  it("should handle single author", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe" },
    })

    expect(schema.author).toHaveProperty("name", "John Doe")
    expect(Array.isArray(schema.author)).toBe(false)
  })

  it("should handle multiple authors", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: [{ name: "Author 1" }, { name: "Author 2" }],
    })

    expect(Array.isArray(schema.author)).toBe(true)
    expect(schema.author).toHaveLength(2)
  })

  it("should use dateModified when provided", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      dateModified: "2024-01-02",
      author: { name: "John Doe" },
    })

    expect(schema.dateModified).toBe("2024-01-02")
  })

  it("should fall back to datePublished when dateModified not provided", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe" },
    })

    expect(schema.dateModified).toBe("2024-01-01")
  })

  it("should include optional image", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe" },
      image: "/article.jpg",
    })

    expect(schema.image).toBeDefined()
  })

  it("should exclude image when not provided", () => {
    const schema = buildArticleSchema({
      headline: "Test",
      datePublished: "2024-01-01",
      author: { name: "John Doe" },
    })

    expect(schema.image).toBeUndefined()
  })
})

describe("buildFAQSchema", () => {
  it("should generate valid FAQPage schema", () => {
    const faqs = [
      { question: "What is X?", answer: "X is Y" },
      { question: "How does Z work?", answer: "Z works by A" },
    ]

    const schema = buildFAQSchema(faqs)

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("FAQPage")
    expect(schema.mainEntity).toHaveLength(2)
  })

  it("should handle single FAQ", () => {
    const faqs = [{ question: "What is X?", answer: "X is Y" }]

    const schema = buildFAQSchema(faqs)

    expect(schema.mainEntity).toHaveLength(1)
  })

  it("should have correct Question structure", () => {
    const faqs = [{ question: "What is X?", answer: "X is Y" }]

    const schema = buildFAQSchema(faqs)

    expect(schema.mainEntity[0]["@type"]).toBe("Question")
    expect(schema.mainEntity[0].name).toBe("What is X?")
    expect(schema.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer")
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("X is Y")
  })
})

describe("buildProductSchema", () => {
  it("should generate valid Product schema", () => {
    const schema = buildProductSchema({
      name: "Test Product",
      description: "A great product",
      price: 99.99,
      currency: "USD",
      image: "/product.jpg",
      brand: "TestBrand",
      url: "/products/test",
    })

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("Product")
    expect(schema.name).toBe("Test Product")
    expect(schema.description).toBe("A great product")
    expect(schema.brand).toEqual({ "@type": "Brand", name: "TestBrand" })
  })

  it("should include price and currency", () => {
    const schema = buildProductSchema({
      name: "Test Product",
      price: 99.99,
      currency: "USD",
    })

    expect(schema.offers).toEqual({
      "@type": "Offer",
      price: "99.99",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: undefined,
    })
  })

  it("should handle rating and review count", () => {
    const schema = buildProductSchema({
      name: "Test Product",
      price: 99.99,
      currency: "USD",
      rating: 4.5,
      reviewCount: 100,
    })

    expect(schema.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.5,
      reviewCount: 100,
    })
  })

  it("should exclude optional fields when not provided", () => {
    const schema = buildProductSchema({
      name: "Test Product",
      price: 99.99,
      currency: "USD",
    })

    expect(schema.description).toBeUndefined()
    expect(schema.image).toBeUndefined()
    expect(schema.brand).toBeUndefined()
    expect(schema.aggregateRating).toBeUndefined()
  })

  it("should format price to 2 decimal places", () => {
    const schema = buildProductSchema({
      name: "Test Product",
      price: 99.9,
      currency: "USD",
    })

    expect(schema.offers.price).toBe("99.90")
  })
})

describe("buildBreadcrumbSchema", () => {
  it("should generate valid BreadcrumbList schema", () => {
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
      { name: "Laptop", url: "/products/laptop" },
    ]

    const schema = buildBreadcrumbSchema(breadcrumbs)

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("BreadcrumbList")
    expect(schema.itemListElement).toHaveLength(3)
  })

  it("should have correct ListItem structure", () => {
    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Products", url: "/products" },
    ]

    const schema = buildBreadcrumbSchema(breadcrumbs)

    expect(schema.itemListElement[0]["@type"]).toBe("ListItem")
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[0].name).toBe("Home")
    expect(schema.itemListElement[0].item).toBe("https://test.example.com/")

    expect(schema.itemListElement[1].position).toBe(2)
    expect(schema.itemListElement[1].name).toBe("Products")
    expect(schema.itemListElement[1].item).toBe("https://test.example.com/products")
  })

  it("should handle single breadcrumb", () => {
    const breadcrumbs = [{ name: "Home", url: "/" }]

    const schema = buildBreadcrumbSchema(breadcrumbs)

    expect(schema.itemListElement).toHaveLength(1)
    expect(schema.itemListElement[0].position).toBe(1)
  })
})

describe("buildCollectionSchema", () => {
  it("should generate valid CollectionPage schema", () => {
    const schema = buildCollectionSchema({
      name: "Product Collection",
      description: "A collection of products",
      image: "/collection.jpg",
      itemListElement: [
        { name: "Product 1", url: "/products/1" },
        { name: "Product 2", url: "/products/2" },
      ],
    })

    expect(schema["@context"]).toBe("https://schema.org")
    expect(schema["@type"]).toBe("CollectionPage")
    expect(schema.name).toBe("Product Collection")
    expect(schema.description).toBe("A collection of products")
  })

  it("should include ItemList in mainEntity", () => {
    const schema = buildCollectionSchema({
      name: "Collection",
      itemListElement: [
        { name: "Item 1", url: "/items/1", image: "/img1.jpg" },
        { name: "Item 2", url: "/items/2" },
      ],
    })

    expect(schema.mainEntity["@type"]).toBe("ItemList")
    expect(schema.mainEntity.itemListElement).toHaveLength(2)
  })

  it("should handle items with images", () => {
    const schema = buildCollectionSchema({
      name: "Collection",
      itemListElement: [{ name: "Item 1", url: "/items/1", image: "/img1.jpg" }],
    })

    expect(schema.mainEntity.itemListElement[0].image).toBe("/img1.jpg")
  })

  it("should exclude optional fields when not provided", () => {
    const schema = buildCollectionSchema({
      name: "Collection",
      itemListElement: [{ name: "Item 1", url: "/items/1" }],
    })

    expect(schema.description).toBeUndefined()
    expect(schema.image).toBeUndefined()
  })
})

describe("getDefaultAuthorInfo", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_AUTHOR_NAME", "Test Author")
    vi.stubEnv("NEXT_PUBLIC_DEFAULT_AUTHOR_EMAIL", "author@test.example.com")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("should return default author config", () => {
    const author = getDefaultAuthorInfo()

    expect(author.name).toBe("Test Author")
    expect(author.email).toBe("author@test.example.com")
  })

  it("should return AuthorConfig type", () => {
    const author = getDefaultAuthorInfo()

    expect(typeof author.name).toBe("string")
  })
})
