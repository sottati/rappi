import { DataAPIClient, type Db, type SomeRow, type Table } from '@datastax/astra-db-ts'

let db: Db | null = null

export function getDb(): Db {
  if (db) return db

  const endpoint = process.env.ASTRA_DB_API_ENDPOINT
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN
  const keyspace = process.env.ASTRA_DB_KEYSPACE

  if (!endpoint || !token || !keyspace) {
    throw new Error(
      'ASTRA_DB_API_ENDPOINT, ASTRA_DB_APPLICATION_TOKEN, and ASTRA_DB_KEYSPACE must be set',
    )
  }

  db = new DataAPIClient().db(endpoint, { token, keyspace })
  return db
}

export function getTable<Schema extends SomeRow>(
  tableName: string,
): Table<Schema> {
  return getDb().table<Schema>(tableName)
}

export async function disconnect(): Promise<void> {
  db = null
}
