# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Serena Code Intelligence Tools

This repository is equipped with **MCP Serena**, a powerful semantic code analysis system. Serena provides intelligent, resource-efficient code exploration and editing capabilities.

### Core Philosophy

- **Avoid reading entire files** unless absolutely necessary
- Use **symbolic tools** for intelligent, step-by-step code acquisition
- Leverage **semantic understanding** to navigate relationships between symbols
- **Prioritize Serena tools** over basic file operations when available

### Essential Serena Tools

#### 1. **Symbol Overview & Discovery**

```typescript
// Get high-level overview of all symbols in a file
mcp__serena__get_symbols_overview(relative_path: string)

// Search for symbols by name path pattern
// Example patterns:
// - "Foo" - finds class/function named Foo
// - "Foo/method" - finds method inside Foo
// - "Foo/__init__" - finds constructor in Python class
mcp__serena__find_symbol({
  name_path_pattern: string,
  relative_path?: string,
  depth?: number,           // 0 = just the symbol, 1 = include children
  include_body?: boolean    // true = include source code
})
```

**Usage Pattern**:
```typescript
// First, get overview of a class
mcp__serena__find_symbol({
  name_path_pattern: "RootLayout",
  relative_path: "app/layout.tsx",
  include_body: false,
  depth: 1
})

// Then read specific methods
mcp__serena__find_symbol({
  name_path_pattern: "RootLayout/default",
  relative_path: "app/layout.tsx",
  include_body: true
})
```

#### 2. **Finding References & Relationships**

```typescript
// Find all references to a specific symbol
mcp__serena__find_referencing_symbols({
  name_path: string,        // e.g., "constructMetadata"
  relative_path: string     // file containing the symbol
})
```

This shows:
- Where the symbol is used
- Code snippets around each reference
- Symbolic information about referencing code

#### 3. **Pattern Search**

```typescript
// Fast, flexible search across codebase
mcp__serena__search_for_pattern({
  substring_pattern: string,     // Regex pattern
  relative_path?: string,        // Limit to specific file/directory
  paths_include_glob?: string,   // e.g., "*.tsx", "**/*.ts"
  paths_exclude_glob?: string,   // Exclude patterns
  context_lines_before?: number,
  context_lines_after?: number
})
```

**Best for**:
- Finding usage patterns across files
- Searching when you don't know exact symbol names
- Exploring code with flexible patterns

#### 4. **Directory & File Discovery**

```typescript
// List directory contents
mcp__serena__list_dir({
  relative_path: string,
  recursive?: boolean,
  skip_ignored_files?: boolean
})

// Find files by name pattern
mcp__serena__find_file({
  file_mask: string,      // e.g., "*.tsx", "config.*"
  relative_path?: string
})
```

#### 5. **Symbolic Editing**

When you need to modify code, use **symbol-level editing** for precision:

```typescript
// Replace entire symbol definition
mcp__serena__replace_symbol_body({
  name_path: string,      // Symbol to replace
  relative_path: string,  // File containing symbol
  body: string           // New symbol body (with signature)
})

// Insert code after a symbol
mcp__serena__insert_after_symbol({
  name_path: string,
  relative_path: string,
  body: string
})

// Insert code before a symbol
mcp__serena__insert_before_symbol({
  name_path: string,
  relative_path: string,
  body: string
})

// Rename symbol everywhere
mcp__serena__rename_symbol({
  name_path: string,
  relative_path: string,
  new_name: string
})
```

### Recommended Workflows

#### **Understanding a Component**
```typescript
// 1. Get overview
mcp__serena__get_symbols_overview({ relative_path: "app/layout.tsx" })

// 2. Find specific symbol
mcp__serena__find_symbol({
  name_path_pattern: "RootLayout",
  relative_path: "app/layout.tsx",
  include_body: true
})

// 3. Find where it's used
mcp__serena__find_referencing_symbols({
  name_path: "RootLayout",
  relative_path: "app/layout.tsx"
})
```

#### **Exploring a Pattern**
```typescript
// 1. Search for the pattern
mcp__serena__search_for_pattern({
  substring_pattern: "constructMetadata",
  paths_include_glob: "**/*.ts"
})

// 2. Get symbol details
mcp__serena__find_symbol({
  name_path_pattern: "constructMetadata",
  relative_path: "lib/construct-metadata.ts",
  include_body: true
})
```

#### **Making Edits**
```typescript
// 1. Find the symbol
mcp__serena__find_symbol({
  name_path_pattern: "constructMetadata",
  relative_path: "lib/construct-metadata.ts",
  include_body: true
})

// 2. Replace the symbol body
mcp__serena__replace_symbol_body({
  name_path: "constructMetadata",
  relative_path: "lib/construct-metadata.ts",
  body: "new implementation..."
})

// 3. Check for references to update
mcp__serena__find_referencing_symbols({
  name_path: "constructMetadata",
  relative_path: "lib/construct-metadata.ts"
})
```

### Serena Memory System

Serena provides a persistent memory system for storing project insights:

```typescript
// Write memory
mcp__serena__write_memory({
  memory_file_name: string,    // Descriptive name
  content: string,             // Markdown content
  max_answer_chars?: number
})

// Read memory
mcp__serena__read_memory({
  memory_file_name: string
})

// List all memories
mcp__serena__list_memories()

// Edit memory
mcp__serena__edit_memory({
  memory_file_name: string,
  mode: "literal" | "regex",
  needle: string,
  repl: string
})

// Delete memory
mcp__serena__delete_memory({
  memory_file_name: string
})
```

**Use memories for**:
- Architecture decisions and patterns
- Common workflows and gotchas
- Configuration explanations
- Team knowledge that should persist

### Important Guidelines

1. **Start with Serena tools** before using basic file operations
2. **Use `depth` parameter** wisely (0 for quick overview, 1 for children)
3. **Always use `relative_path`** to limit searches to relevant files
4. **Prefer symbolic editing** over line-based edits when possible
5. **Check references** before renaming symbols
6. **Use memories** to capture important project knowledge
7. **Avoid reading entire files** - use symbol-level acquisition

### Example: Understanding the Parallel Routing Architecture

```typescript
// 1. Get layout overview
mcp__serena__find_symbol({
  name_path_pattern: "RootLayout",
  relative_path: "app/layout.tsx",
  depth: 1
})

// 2. Find the three slots
mcp__serena__search_for_pattern({
  substring_pattern: "@left|@rightStatic|@rightDynamic",
  relative_path: "app/layout.tsx"
})

// 3. Explore left slot
mcp__serena__list_dir({
  relative_path: "app/@left",
  recursive: true
})

// 4. Get left slot layout
mcp__serena__find_symbol({
  name_path_pattern: "default",
  relative_path: "app/@left/default.tsx",
  include_body: true
})
```

### When to Use Basic Tools

Use basic file tools (`Read`, `Edit`, `Glob`) when:
- You need to see the entire file content
- Making simple line-based edits
- Working with non-code files (JSON, Markdown, etc.)
- The symbol tools don't return what you need

**Remember**: Serena tools are designed to be more intelligent and efficient. Prefer them for code exploration and modification.

---

## Common Commands

### Development
- **Development server**: `npm run dev` or `pnpm dev` - Runs with Turbopack enabled
- **Build**: `npm run build` or `pnpm build` - Builds with Turbopack
- **Start production server**: `npm start` or `pnpm start`
- **Lint**: `npm run lint` or `pnpm lint`

### Important Notes
- Use **Incognito Mode** when testing locally (mentioned in README)
- This project uses **npm** as specified in recent commits (was previously using pnpm)

## Project Overview

**AIFA v2.1** is a production-ready Next.js 15 starter template focused on:
- **Parallel routes** with three independent UI streams
- **Intercepting routes** for modals and seamless UX
- **AI-ready architecture** with Vercel AI SDK integration
- **SEO-first approach** with static generation and perfect crawlability
- **PWA support** with offline functionality

## High-Level Architecture

### Three Parallel Slot Architecture

The app uses Next.js **parallel routing** with three independent slots:

```
app/
├── layout.tsx                    # Root parallel layout
├── @left/                        # Left slot (AI chat/auth) - Hidden on mobile, visible sidebar on desktop
│   ├── (_AUTH)/                  # Authentication pages
│   ├── (_CHAT)/                  # AI chat interface
│   ├── default.tsx               # Default left panel content
│   └── layout.tsx                # Left slot layout
├── @rightStatic/                 # Static content slot - Main SEO-optimized pages
│   ├── (_PUBLIC)/                # Public pages (features, docs, examples)
│   ├── (_INTERCEPTION_MODAL)/    # Intercepting route modals
│   ├── @modal/                   # Modal overlay routes
│   ├── default.tsx               # Default content
│   ├── error.tsx                 # Error boundary for static content
│   └── page.tsx                  # Home page
└── @rightDynamic/                # Dynamic overlay slot - Authenticated/dashboard content
    └── default.tsx               # Default dynamic content
```

**Slot Responsibilities**:
- **@left**: Persistent AI assistant (desktop) or modal trigger (mobile), authentication UI
- **@rightStatic**: SEO-perfect static pages (server components only, works without JS)
- **@rightDynamic**: Dynamic overlays for authenticated flows, dashboards, admin panels

This separation allows **SEO-perfect static pages** and **AI-driven UX** to coexist without compromise.

### Core Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + custom components
- **Animation**: Motion (Framer Motion successor)
- **AI Integration**: Vercel AI SDK (`ai`, `@ai-sdk/react`)
- **SEO**: Advanced metadata API, JSON-LD schemas, OpenGraph
- **PWA**: next-pwa with service worker
- **Deployment**: Vercel (Analytics & Speed Insights integrated)

## Key Configuration Files

### `/config/app-config.ts`
Central configuration for the entire application:
- **Site settings**: name, description, URLs, manifest
- **PWA configuration**: theme colors, icons, display settings
- **SEO settings**: indexing, robots, canonical URLs, locales
- **Social media**: OpenGraph, Twitter cards, social links
- **Content types**: Default types for blog/product/doc sections
- **Author information**: Default author for articles
- **Image management**: Theme-aware illustrations for loading, errors, homepage, chatbot

Helper functions:
- `getImagePath()`, `getLogoPath()`, `getOgImagePath()`
- `getErrorIllustration()`, `getHomePageIllustration()`, `getChatbotIllustration()`
- `getAuthorConfig()`, `getSocialUrls()`

### `/config/content-data.ts`
Content-driven navigation configuration:
- Defines menu categories (Home, Examples, Features)
- Each page has metadata: id, href, roles, type, publish status
- Centralized content management for the entire site
- Supports unpublished features (many features marked `isPublished: false`)

### `/lib/construct-metadata.ts`
Comprehensive metadata construction utilities:
- **`constructMetadata()`**: Main function for creating Next.js metadata
  - Handles title templates, descriptions, OpenGraph, Twitter cards
  - Supports robots.txt configuration, canonical URLs
  - Includes Google/Yandex verification tokens
  - Creates JSON-LD schemas (WebSite, Organization, Person)
- **Schema builders**:
  - `buildArticleSchema()` - BlogPosting schema
  - `buildFAQSchema()` - FAQPage schema
  - `buildProductSchema()` - Product schema
  - `buildBreadcrumbSchema()` - BreadcrumbList schema
  - `buildCollectionSchema()` - CollectionPage schema

### `/app/layout.tsx`
Root layout implementing the parallel routing structure:
- Sets up viewport, theme colors, PWA meta tags
- Includes JSON-LD schemas (WebSite, Organization) in head
- Implements **three-column layout**:
  - Left: Hidden on mobile, sidebar on desktop (50% width on lg, 35% on xl)
  - Right main: Static content area (50% on lg, 65% on xl)
- Theme providers: ThemeProvider, LayoutProvider, ActiveThemeProvider
- Providers: OnlineStatusProvider, CookieBanner, GoogleAnalytics, Vercel Analytics
- Includes **no-JavaScript fallback** message in noscript tag
- Tailwind CSS variables for header/footer heights

### `/next.config.mjs`
Next.js configuration:
- **Turbopack enabled** for dev and build
- **Security headers**:
  - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing attacks
  - `X-Frame-Options: SAMEORIGIN` - Prevents clickjacking

### `/eslint.config.mjs`
ESLint configuration with special rules:
- Extends `next/core-web-vitals` and `next/typescript`
- **Global ignores**: node_modules, .next, build, dist, config files
- **AI components** (`components/ai-elements/**/*`): Relaxed rules for development
- **Prompt input**: Additional exceptions for AI chat components

## Development Patterns

### Parallel Routes Pattern
```tsx
// app/layout.tsx
export default async function RootLayout({
  left,        // Rendered from app/@left/
  rightStatic, // Rendered from app/@rightStatic/
  rightDynamic // Rendered from app/@rightDynamic/
}: {
  left: React.ReactNode;
  rightStatic: React.ReactNode;
  rightDynamic: React.ReactNode;
}) {
  // Layout orchestrates all three slots
}
```

### Intercepting Routes
- Modals are implemented in `app/@rightStatic/@modal/` or `app/@rightStatic/(_INTERCEPTION_MODAL)/`
- Allows opening modals without page navigation
- Preserves user context and navigation state
- Examples: authentication, lead capture, chat interfaces

### SEO-First Static Generation
- **@rightStatic** uses pure server components
- No client-side JavaScript required for core content
- Works perfectly when JavaScript is disabled
- Static generation with ISR where appropriate
- Complete metadata API implementation with JSON-LD schemas

### Error Handling
- **app/error.tsx**: Root error boundary
- **app/global-not-found.tsx**: Application-wide 404 handler
- **app/@rightStatic/error.tsx**: Error boundary for static content slot
- Each parallel route can have independent error handling

### Theme System
- **ThemeProvider**: React context for theme management
- **ActiveThemeProvider**: Tracks active theme (light/dark/system)
- Theme-aware illustrations for different states
- CSS variables for colors: `META_THEME_COLORS` in app-config

### Utility Functions
- **`/lib/utils.ts`**: `cn()` - Combines clsx and tailwind-merge for className management
- **`/lib/fonts.ts`**: Font variable definitions for Next.js font optimization
- **`/lib/seo-generators.ts`**: Additional SEO utilities
- **`/lib/themes.ts`**: Theme management helpers

## Environment Variables

Key environment variables (all prefixed with `NEXT_PUBLIC_`):

### Site Configuration
- `SITE_URL`, `APP_NAME`, `APP_SHORT_NAME`, `APP_DESCRIPTION`
- `MAIL_SUPPORT`, `CHAT_BRAND`, `DEFAULT_LOCALE`

### SEO
- `SEO_INDEXING`, `ROBOTS_INDEX`, `ROBOTS_FOLLOW`
- `OG_LOCALE`, `OG_IMAGE_WIDTH`, `OG_IMAGE_HEIGHT`, `OG_TYPE`
- `GOOGLE_VERIFICATION`, `YANDEX_VERIFICATION`
- `GOOGLE_ANALYTICS_ID`

### Social Media
- `TWITTER_HANDLE`, `GITHUB_URL`, `LINKEDIN_URL`, `FACEBOOK_URL`

### PWA
- `PWA_THEME_COLOR`, `PWA_BACKGROUND_COLOR`
- `PWA_SCREENSHOT_MOBILE`, `PWA_SCREENSHOT_DESKTOP`
- `THEME_COLORS_LIGHT`, `THEME_COLORS_DARK`

### Author Defaults
- `DEFAULT_AUTHOR_NAME`, `DEFAULT_AUTHOR_EMAIL`
- `DEFAULT_AUTHOR_TWITTER`, `DEFAULT_AUTHOR_LINKEDIN`
- `DEFAULT_AUTHOR_BIO`, `DEFAULT_AUTHOR_IMAGE`, `DEFAULT_AUTHOR_URL`

### Content Types
- `BLOG_CONTENT_TYPE`, `PRODUCT_CONTENT_TYPE`, `DOC_CONTENT_TYPE`

### Mobile Apps
- `IOS_APP_ID`, `ANDROID_PACKAGE`

## Directory Structure Summary

```
app/
├── layout.tsx                 # Root parallel layout
├── error.tsx                  # Root error boundary
├── global-not-found.tsx       # Global 404 handler
├── manifest.ts                # PWA manifest
├── robots.ts                  # Dynamic robots.txt
├── sitemap.ts                 # Dynamic sitemap.xml
├── @left/                     # Left slot (chat/auth)
│   ├── default.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── (_AUTH)/              # Auth pages
│   └── (_CHAT)/              # Chat interface
├── @rightStatic/              # Static content
│   ├── default.tsx
│   ├── error.tsx
│   ├── layout.tsx
│   ├── page.tsx              # Home page
│   ├── (_PUBLIC)/            # Public pages
│   ├── (_INTERCEPTION_MODAL)/ # Interception routes
│   └── @modal/               # Modal overlays
└── @rightDynamic/             # Dynamic overlay
    └── default.tsx

config/
├── app-config.ts              # Global app configuration
├── content-data.ts            # Navigation/content metadata
├── translations.config.ts     # i18n configuration
└── pages-config/              # Page-specific configs

lib/
├── construct-metadata.ts      # Metadata & SEO utilities
├── utils.ts                   # cn() utility
├── fonts.ts                   # Font definitions
├── seo-generators.ts          # SEO helpers
├── themes.ts                  # Theme utilities
└── events.ts                  # Event system

components/
├── ui/                        # Radix UI + custom components
├── seo-page-wrapper/          # SEO wrappers
├── code-block/                # Syntax highlighting
├── cookie-banner/             # GDPR compliance
├── site-header/               # Navigation header
├── aifa-footer.tsx            # Footer component
└── tailwind-indicator.tsx     # Dev indicator

providers/
├── theme-provider.tsx         # Theme context
├── active-theme.tsx           # Active theme tracker
├── layout-provider.tsx        # Layout context
└── online-status-provider.tsx # Network status

public/
└── app-config-images/         # Theme-aware illustrations
```

## Key Features Implemented

### ✅ Completed Features
1. **Static Generation** - Pre-rendered pages at build time
2. **Dynamic Generation** - On-demand SSR
3. **Parallel Routing** - Three independent UI streams
4. **SEO Optimization** - Complete metadata, JSON-LD, OpenGraph
5. **PWA Support** - Service worker, offline mode, installable
6. **No-JavaScript Fallback** - Core content works without JS
7. **Error Pages** - Custom 404, 500, global not found
8. **Loading Pages** - Suspense-based loading UI
9. **Cookie Banner** - GDPR/CPRA compliant
10. **Mobile Responsive** - Mobile-first design
11. **Loading Speed** - Turbopack, code splitting, optimization
12. **Intercepting Routes** - Modal-based interactions
13. **Theme System** - Light/dark/system with illustrations

### 🚧 In Development (isPublished: false)
- Lead magnet intercepting routes
- Authentication intercepting routes
- Chat intercepting routes
- Soft navigation
- Hard reload patterns
- Left/right slot deep dives
- Default page patterns
- Advanced error boundaries
- Breadcrumbs
- Robots.txt & Sitemap
- Offline detector
- And more...

## Deployment

**Primary deployment**: Vercel (configured for npm)
- Deploy button available in README
- Vercel Analytics integrated
- Speed Insights enabled
- Environment variables configured in Vercel dashboard

## Important Development Notes

1. **Incognito Mode Required**: Always use incognito/private mode when testing locally
2. **Turbopack**: Both dev and build use Turbopack (Next.js 15 feature)
3. **TypeScript Strict**: Project uses strict TypeScript settings
4. **SEO Priority**: @rightStatic is pure server components for maximum SEO
5. **Progressive Enhancement**: Core functionality works without JavaScript
6. **Parallel Routes**: Each slot has independent error boundaries and loading states
7. **Content-Driven**: Use content-data.ts for navigation, not hardcoded routes
8. **AI-Ready**: Architecture prepared for Vercel AI SDK integration
9. **PWA-First**: Service worker and offline capabilities built-in
10. **No Test Scripts**: No testing framework configured (Jest/Vitest not in dependencies)

## Additional Resources

- **Live Demo**: https://aifa-v2-1.vercel.app
- **Documentation**: https://aifa.dev
- **Repository**: https://github.com/aifa-agi/aifa-v2.1
- **License**: AGPL v3
