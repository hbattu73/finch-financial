import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Each test file gets its own fresh in-memory SQLite DB — no running service,
    // and the real dev DB file is never touched.
    env: {
      DATABASE_URL: ':memory:',
      JWT_SECRET: 'test-secret',
    },
    setupFiles: ['./src/__tests__/setup.ts'],
    fileParallelism: false, // Run test files sequentially to prevent cleanup conflicts
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@shared/types': path.resolve(import.meta.dirname, '../types.ts'),
    },
  },
})
