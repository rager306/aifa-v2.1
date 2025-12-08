import type { AuthorConfig, ContentType } from "@/config/app-config"

export const appConfig = {
  name: "Test App",
  short_name: "TestApp",
  description: "Test description",
  url: "https://test.example.com",
  manifest: "/manifest.json",
  lang: "en" as const,
  mailSupport: "test@example.com",
  chatBrand: "TestChat",

  images: {
    ogImage: {
      path: "/app-config-images/og-image.jpg",
      format: "jpeg" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "loading-dark": {
      path: "/app-config-images/loading-dark.png",
      format: "svg" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "loading-light": {
      path: "/app-config-images/loading-light.png",
      format: "svg" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "notFound-dark": {
      path: "/app-config-images/not-found-dark.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "notFound-light": {
      path: "/app-config-images/not-found-light.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "error500-dark": {
      path: "/app-config-images/error500-dark.png",
      format: "svg" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "error500-light": {
      path: "/app-config-images/error500-light.png",
      format: "svg" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "homePage-dark": {
      path: "/app-config-images/homepage-dark.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "homePage-light": {
      path: "/app-config-images/homepage-light.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "chatbot-dark": {
      path: "/app-config-images/chatbot-dark.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
    "chatbot-light": {
      path: "/app-config-images/chatbot-light.png",
      format: "png" as const,
      uploadedAt: "2025-01-01T00:00:00.000Z",
    },
  },

  logo: "/app-config-images/logo.png",

  icons: {
    faviconAny: "/favicon.ico",
    icon32: "/app-config-images/icons/icon-32.png",
    icon48: "/app-config-images/icons/icon-48.png",
    icon192: "/app-config-images/icons/icon-192.png",
    icon512: "/app-config-images/icons/icon-512.png",
    icon512Maskable: "/app-config-images/icons/icon-512-maskable.png",
    appleTouch: "/app-config-images/icons/apple-touch-icon.png",
  },

  pwa: {
    themeColor: "#ffffff",
    backgroundColor: "#ffffff",
    startUrl: "/",
    display: "standalone" as const,
    scope: "/",
    orientation: "portrait-primary" as const,
  },

  seo: {
    indexing: "allow" as const,
    sitemapUrl: "https://test.example.com/sitemap.xml",
    disallowPaths: ["/admin", "/api"],
    canonicalBase: "https://test.example.com",
    locales: ["en"],
    defaultLocale: "en",
    social: {
      twitter: "@test",
      github: "https://github.com/test",
      linkedin: "https://linkedin.com/company/test",
    },
  },

  og: {
    type: "website" as const,
    siteName: "Test App",
    imageWidth: 1200,
    imageHeight: 630,
  },

  pageDefaults: {
    titleTemplate: "%s | Test",
    robotsIndex: true,
    robotsFollow: true,
  },

  author: {
    name: "Test Author",
    email: "author@test.example.com",
  },

  contentTypeDefaults: {
    blog: "blog" as ContentType,
    product: "product" as ContentType,
    documentation: "documentation" as ContentType,
  },

  messages: {
    loading: {
      title: "Loading...",
      subtitle: "Please wait",
    },
  },
}

export const getOgImagePath = () => "/og-image.jpg"

export const getImagePath = (imageType: string) => `/images/${imageType}.jpg`

export const getImageFormat = (_imageType: string) => "jpeg"

export const getLogoPath = () => "/logo.png"

export const getLoadingIllustration = (theme: "dark" | "light") =>
  theme === "dark" ? "/loading-dark.png" : "/loading-light.png"

export const getErrorIllustration = (errorType: "404" | "500", _theme: "dark" | "light") =>
  errorType === "404" ? "/not-found.png" : "/error-500.png"

export const getHomePageIllustration = (theme: "dark" | "light") =>
  theme === "dark" ? "/homepage-dark.png" : "/homepage-light.png"

export const getChatbotIllustration = (theme: "dark" | "light") =>
  theme === "dark" ? "/chatbot-dark.png" : "/chatbot-light.png"

export const getAuthorConfig = (): AuthorConfig => ({
  name: "Test Author",
  email: "author@test.example.com",
})

export const getSocialUrls = () => ({
  twitter: "https://twitter.com/test",
  github: "https://github.com/test",
  linkedin: "https://linkedin.com/company/test",
})

export type { AuthorConfig, ContentType }
