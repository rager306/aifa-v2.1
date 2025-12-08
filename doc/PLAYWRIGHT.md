# Playwright E2E Testing Guide

## Overview

This project uses Playwright for end-to-end testing of the Next.js 15 App Router architecture with parallel routes, intercepting routes, and modals.

## Architecture

### Parallel Routes
- `@left`: Chat and authentication (hidden on mobile)
- `@rightStatic`: Static SEO pages with modal slot
- `@rightDynamic`: Authenticated overlay

### Intercepting Routes
- `(...)interception_modal/lead-form`: Lead form modal
- `(...)interception_chat`: Chat drawer modal

## Running Tests

### All tests
```bash
npm run test:e2e
```

### Interactive UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Specific browser
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Mobile testing
```bash
npm run test:e2e:mobile
```

### No-JS testing (SEO pages)
```bash
npm run test:e2e:no-js
```

### Debug mode
```bash
npm run test:e2e:debug
```

## Test Structure

### `e2e/parallel-routes.spec.ts`
Tests for parallel routes architecture:
- Simultaneous rendering of all three slots
- Navigation with slot persistence
- Responsive layout (mobile vs desktop)
- Chat rendering in @left slot

### `e2e/intercepting-modals.spec.ts`
Tests for modal interceptions:
- Lead form modal: open, fill, submit, success, close
- Chat modal: open, interact, close
- Keyboard shortcuts (Escape)
- Overlay click handling

### `e2e/no-js.spec.ts`
Tests for progressive enhancement:
- Static pages render without JavaScript
- Navigation works server-side
- SEO metadata present
- No-JS banner visible

## Page Object Model

Use helper classes from `e2e/fixtures/pages.ts`:

```typescript
import { LeadFormModal, ChatModal, ParallelRoutes } from './fixtures/pages';

test('example', async ({ page }) => {
  const leadForm = new LeadFormModal(page);
  await leadForm.open();
  await leadForm.fillForm({ name: 'Test', phone: '+123', email: 'test@example.com' });
  await leadForm.submit();
  await leadForm.waitForSuccess();
});
```

## Configuration

See `playwright.config.ts` for:
- Browser projects (Chromium, Firefox, WebKit)
- Mobile emulation (Pixel 5)
- No-JS project
- Dev server auto-start
- Retry/timeout settings
- Reporters (HTML, JSON, list)

## Debugging

### Playwright Inspector
```bash
npm run test:e2e:debug
```

### Playwright UI Mode
```bash
npm run test:e2e:ui
```

### View HTML Report
```bash
npm run test:e2e:report
```

## CI/CD Integration

Tests run automatically in GitHub Actions (see Phase 10).
- Retries: 2 attempts in CI
- Workers: 1 in CI (sequential)
- Artifacts: Screenshots, videos, traces on failure

## Best Practices

1. **Use Page Object Model** for reusable logic
2. **Wait for elements** with `waitForSelector` or `expect().toBeVisible()`
3. **Test responsive layouts** with mobile projects
4. **Test no-JS scenarios** for SEO pages
5. **Use meaningful selectors** (data-testid, accessible roles)
6. **Keep tests isolated** (no shared state)
7. **Use Playwright UI mode** for debugging

## Troubleshooting

### Tests fail with "Timeout"
- Increase timeout in `playwright.config.ts`
- Check if dev server is running (`npm run dev`)
- Use `--headed` mode to see browser

### Modal not found
- Check if trigger element exists
- Verify selector in modal component
- Use Playwright Inspector to debug

### No-JS tests fail
- Ensure static pages don't require JavaScript
- Check if content is server-rendered
- Verify no client-side navigation

## Related Documentation

- `doc/VITEST.md` - Unit testing guide
- `doc/BIOME.md` - Linting and formatting
- `doc/SECURITY.md` - Security testing (Snyk, Semgrep)
