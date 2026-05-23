import { MongoClient, Db } from 'mongodb'

let client: MongoClient | null = null
let db: Db | null = null

export async function getDb(): Promise<Db> {
  if (db) return db

  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI must be set')

  client = new MongoClient(uri)
  await client.connect()
  db = client.db(process.env.MONGODB_DATABASE ?? 'rappi')
  return db
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}
