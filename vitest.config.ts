import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'lib/utils.ts',
        'lib/themes.ts',
        'lib/construct-metadata.ts'
      ],
      exclude: [
        'lib/**/*.test.ts',
        'lib/__tests__/**',
        'node_modules',
        '.next',
        'coverage'
      ],
      thresholds: {
        statements: 80,
        branches: 70,
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
