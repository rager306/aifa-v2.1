# E2E Tests

This directory contains Playwright end-to-end tests for the AIFA v2.1 application.

## Structure

- `*.spec.ts` - Test files
- `fixtures/` - Page Object Model and test utilities

## Running Tests

See `../doc/PLAYWRIGHT.md` for detailed documentation on running and debugging tests.

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run specific test file
npx playwright test parallel-routes.spec.ts
```

## Test Coverage

### ✅ Covered Features
- Parallel routes architecture (@left, @rightStatic, @rightDynamic)
- Intercepting modals (lead-form, chat)
- No-JS progressive enhancement
- Authentication flow
- Responsive layouts
- SEO metadata validation

### 📋 Test Files
- `parallel-routes.spec.ts` - Tests for parallel routes architecture
- `intercepting-modals.spec.ts` - Tests for modal interceptions
- `no-js.spec.ts` - Tests for no-JavaScript scenarios
- `authentication.spec.ts` - Tests for auth flow

## Best Practices

1. Use Page Object Model from `fixtures/pages.ts`
2. Wait for elements with proper assertions
3. Test across multiple browsers (Chromium, Firefox, WebKit)
4. Test mobile and desktop viewports
5. Test no-JS scenarios for SEO pages
