# Vitest Testing Framework

This document provides guidance on using Vitest for unit testing in the AIFA v2.1 project.

## Overview

Vitest is a modern, fast testing framework built on top of Vite. It provides excellent developer experience with instant feedback, native TypeScript support, and seamless integration with the Next.js ecosystem.

## Installation and Configuration

The following dependencies have been installed:

- **vitest** - Core testing framework
- **@vitest/ui** - Interactive web UI for test debugging
- **@vitest/coverage-v8** - Coverage provider using V8 engine

Configuration is provided in `vitest.config.ts` with:
- Node.js environment for library tests
- Path alias resolution for `@/*` imports
- Coverage threshold set to 80%
- Multiple reporters (text, JSON, HTML, LCOV)

**Note on Coverage Provider**: The project uses `@vitest/coverage-v8` instead of `c8`. This is the modern, native coverage provider for Vitest that provides better integration and performance compared to the standalone `c8` package. It is the recommended approach in the official Vitest documentation.

## Running Tests

### Development Mode (Watch Mode)
```bash
npm test
```
Automatically reruns tests when files change. Best for TDD workflow.

### One-Time Run
```bash
npm run test:run
```
Executes all tests once. Ideal for CI/CD pipelines.

### Interactive UI
```bash
npm run test:ui
```
Opens a browser-based interface at http://localhost:51204 for visual test debugging.

### Coverage Report
```bash
npm run test:coverage
```
Generates comprehensive coverage report in `coverage/index.html`.

### Explicit Watch Mode
```bash
npm run test:watch
```
Alternative to `npm test` for explicit watch mode control.

## Test Structure

### Location
Tests are located in `lib/__tests__/` directory:
- `lib/__tests__/utils.test.ts` - Tests for `lib/utils.ts`
- `lib/__tests__/themes.test.ts` - Tests for `lib/themes.ts`
- `lib/__tests__/construct-metadata.test.ts` - Tests for `lib/construct-metadata.ts`
- `lib/__tests__/__mocks__/` - Mock implementations

### Test Patterns

#### Basic Test Structure
```typescript
import { describe, it, expect } from 'vitest'
import { functionName } from '../file'

describe('functionName', () => {
  it('should do something specific', () => {
    const result = functionName(input)
    expect(result).toBe(expected)
  })
})
```

#### Testing Async Functions
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})
```

#### Testing Error Cases
```typescript
it('should throw error for invalid input', () => {
  expect(() => functionName(invalidInput)).toThrow()
})
```

## Mocking

### Environment Variables
Use `vi.stubEnv()` and `vi.unstubAllEnvs()`:

```typescript
beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_GOOGLE_VERIFICATION', 'test-token')
})

afterEach(() => {
  vi.unstubAllEnvs()
})
```

### Module Mocking
Mock entire modules with `vi.mock()`. For maintainability, use dedicated mock files:

```typescript
// Good: Use a dedicated mock file
vi.mock('@/config/app-config', async () => {
  const mock = await vi.importActual('./__mocks__/app-config.mock')
  return {
    ...mock,
  }
})

// Or for inline mocks (use sparingly for simple cases)
vi.mock('@/config/app-config', () => ({
  appConfig: { /* mock data */ },
  getOgImagePath: () => '/mock-image.jpg',
}))
```

See `lib/__tests__/__mocks__/app-config.mock.ts` for a complete example. The dedicated mock file provides a single source of truth for test data, avoiding duplication across test files.

### Partial Mocking
Mock specific exports:

```typescript
vi.mocked(functionName).mockImplementation(() => 'mocked')
```

### Next.js Module Mocks
Common Next.js modules are mocked in `lib/__tests__/__mocks__/next.mocks.ts`. Import these mocks in your test files as needed.

Available mocks:
- **next/navigation**: `useRouter`, `useSearchParams`, `usePathname`, `useParams`, `redirect`, `notFound`
- **next/headers**: `headers`, `cookies`
- **next/cookies**: `cookies`
- **next/image**: Mocked component
- **next/link**: Mocked component
- **next/script**: Mocked component
- **next/server**: `NextResponse`, `NextRequest`

#### Usage Example
```typescript
import { mockPush, mockUseRouter } from '@/lib/__tests__/__mocks__/next.mocks'

it('should navigate on click', () => {
  // Import and use the mocked functions
  render(<Component />)

  fireEvent.click(screen.getByText('Click me'))

  expect(mockPush).toHaveBeenCalledWith('/expected-path')
})
```

#### Resetting Mocks
To reset all Next.js mocks before each test:

```typescript
import { setupNextMocks } from '@/lib/__tests__/__mocks__/next.mocks'

beforeEach(() => {
  setupNextMocks()
})
```

**Note**: These mocks return simple objects and can be imported on-demand in test files that require Next.js functionality.

## Coverage

### Thresholds
The project maintains 80% coverage for:
- Statements
- Branches
- Functions
- Lines

### Viewing Coverage
- **Terminal**: Run `npm run test:coverage` for console output
- **HTML Report**: Open `coverage/index.html` in browser
- **LCOV**: Available in `coverage/lcov.info` for CI integration

### Coverage by File
- `lib/utils.ts`: ~100% (simple utility function)
- `lib/themes.ts`: ~100% (constants array)
- `lib/construct-metadata.ts`: ~85-90% (complex logic with edge cases)

## Best Practices

### 1. Test Naming
Use descriptive test names that explain the expected behavior:
```typescript
// Good
it('should merge Tailwind classes and resolve conflicts correctly', () => { })

// Bad
it('should work', () => { })
```

### 2. Arrange-Act-Assert
Structure tests clearly:
```typescript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(30)
})
```

### 3. Single Responsibility
Each test should verify one behavior:
```typescript
// Good - separate tests
it('should return empty array for null input', () => { })
it('should filter items correctly', () => { })

// Bad - multiple assertions
it('should handle various cases', () => {
  expect(handle(null)).toBe(...)
  expect(handle([1, 2, 3])).toBe(...)
})
```

### 4. Use Descriptive Matchers
```typescript
// Good
expect(result).toHaveProperty('name', 'Test')
expect(array).toHaveLength(3)
expect(value).toBeTruthy()

// Less descriptive
expect(result).toBe(...)
```

### 5. Avoid Testing Implementation Details
Test behavior, not implementation:
```typescript
// Good - test the outcome
expect(metadata.title).toEqual({ default: 'Title', template: '%s | Test' })

// Bad - test internal function calls
expect(mockedFunction).toHaveBeenCalled()
```

## Troubleshooting

### Common Issues

#### "Cannot find module '@/config/app-config'"
**Solution**: Ensure path aliases are configured in `vitest.config.ts`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './')
  }
}
```

#### "Coverage threshold not met"
**Solution**: Add tests for uncovered branches or adjust thresholds in `vitest.config.ts`

#### "vi.mock is not a function"
**Solution**: Ensure `vi` is imported from `vitest`:
```typescript
import { describe, it, expect, vi } from 'vitest'
```

#### "Environment variable not mocked"
**Solution**: Use `vi.stubEnv()` in `beforeEach`:
```typescript
beforeEach(() => {
  vi.stubEnv('VAR_NAME', 'value')
})
```

#### Test timeout errors
**Solution**: Increase timeout in config:
```typescript
test: {
  testTimeout: 10000
}
```

### Debugging Tips

1. **Use `console.log` in tests** - Output is captured and displayed
2. **Run single test** - Use `it.only()` to run specific test
3. **Skip tests** - Use `it.skip()` for temporary exclusions
4. **Inspect objects** - Use `console.dir(object, { depth: null })`
5. **Use Vitest UI** - `npm run test:ui` for visual debugging

## Integration with CI/CD

### GitHub Actions Example
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npm run test:coverage
    - uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
```

### Local Pre-commit Hooks
Consider using Lefthook to run tests before commits:
```yaml
pre-commit:
  commands:
    test:
      glob: "*.{ts,tsx}"
      run: npm run test:run
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/testing.html)
- [Coverage Guide](https://vitest.dev/guide/coverage.html)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)

## Maintenance

### Regular Tasks
- Review and update coverage thresholds as needed
- Add new tests when adding features
- Clean up unused mocks
- Update dependencies with `npm update`
- Monitor test performance and optimize slow tests

### Test File Organization
```
lib/__tests__/
├── utils.test.ts              # Simple utilities
├── themes.test.ts             # Constants and types
├── construct-metadata.test.ts # Complex business logic
└── __mocks__/
    └── app-config.mock.ts     # Shared mocks
```
