import { defineConfig } from 'drizzle-kit'
import { loadDotEnv } from './lib/env'

loadDotEnv()

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set')
}

export default defineConfig({
  schema: './lib/db/postgres/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: 'require',
  },
  strict: true,
  verbose: true,
})
