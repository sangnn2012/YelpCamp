import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
      exclude: [
        'node_modules',
        '.nuxt',
        'tests',
        '**/*.d.ts',
        'app/plugins/**',
        'server/db/seed.ts'
      ]
    },
    globals: true,
    testTimeout: 10000
  }
})
