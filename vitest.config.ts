import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/utils.ts',
        'lib/themes.ts',
        'lib/construct-metadata.ts',
        'lib/rate-limiter.ts',
        'lib/schemas/chat-schema.ts',
        'components/icons.tsx'
      ],
      exclude: [
        'lib/**/*.test.ts',
        'lib/__tests__/**',
        'components/**/*.test.tsx',
        'components/__tests__/**',
        'node_modules',
        '.next',
        'coverage'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    testTimeout: 10000
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
