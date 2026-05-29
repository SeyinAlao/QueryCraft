import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate a browser environment for React components
    environment: 'jsdom',
    // Auto-import expect, describe, it etc. — no need to import in every test file
    globals: true,
    // Run this setup file before every test — loads jest-dom matchers
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.next/', 'src/__tests__/setup.ts'],
    },
  },
  resolve: {
    // Mirror the @/* path alias from tsconfig so tests can import the same way
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
