import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  compatibilityDate: '2025-01-01',
  srcDir: 'server',
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3002',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  }
})
