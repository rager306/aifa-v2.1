// Common Next.js module mocks for testing
// These mocks provide basic stubs for frequently used Next.js modules

import { vi } from "vitest"

// Mock next/navigation
export const mockUseRouter = vi.fn()
export const mockPush = vi.fn()
export const mockReplace = vi.fn()
export const mockBack = vi.fn()
export const mockForward = vi.fn()
export const mockRefresh = vi.fn()
export const mockPrefetch = vi.fn()

mockUseRouter.mockReturnValue({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  forward: mockForward,
  refresh: mockRefresh,
  prefetch: mockPrefetch,
  pathname: "/",
  route: "/",
  segments: [],
  query: {},
})

vi.mock("next/navigation", () => ({
  useRouter: mockUseRouter,
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  useParams: vi.fn(() => ({})),
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock next/headers
export const mockHeaders = vi.fn()

vi.mock("next/headers", () => ({
  headers: mockHeaders,
  cookies: vi.fn(() => ({
    get: vi.fn(),
    getAll: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    clear: vi.fn(),
  })),
}))

// Mock next/cookies
export const mockCookie = vi.fn()

vi.mock("next/cookies", () => ({
  cookies: mockCookie,
}))

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    // Return a simple object instead of JSX to avoid transpilation issues
    return {
      type: "img",
      props,
    }
  },
}))

// Mock next/link
vi.mock("next/link", () => ({
  default: (props: any) => {
    // Return a simple object instead of JSX to avoid transpilation issues
    return {
      type: "a",
      props,
    }
  },
}))

// Mock next/script
vi.mock("next/script", () => ({
  default: (props: any) => {
    // Return a simple object instead of JSX to avoid transpilation issues
    return {
      type: "script",
      props,
    }
  },
}))

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((data: any, init?: any) => ({
      json: async () => data,
      status: init?.status || 200,
      headers: init?.headers || {},
    })),
    redirect: vi.fn((url: string, init?: any) => ({
      redirect: url,
      status: init?.status || 307,
    })),
  },
  NextRequest: vi.fn(),
}))

// Re-export all mocks for easy importing
export const NextMocks = {
  mockUseRouter,
  mockPush,
  mockReplace,
  mockBack,
  mockForward,
  mockRefresh,
  mockPrefetch,
  mockHeaders,
  mockCookie,
}

// Reset all mocks before each test suite
export const setupNextMocks = () => {
  vi.clearAllMocks()
}

// Call this in your test setup
setupNextMocks()
