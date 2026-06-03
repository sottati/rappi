import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { loadDotEnv } from '@/lib/env'
import * as schema from './schema'

let client: postgres.Sql | null = null
let db: PostgresJsDatabase<typeof schema> | null = null

export function getDrizzleDb(): PostgresJsDatabase<typeof schema> {
  if (db) return db

  loadDotEnv()

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL must be set')
  }

  client = postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: 'require',
  })
  db = drizzle(client, { schema })

  return db
}

export async function disconnectDrizzle(): Promise<void> {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}
