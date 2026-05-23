import { Client } from 'cassandra-driver'

let client: Client | null = null

export function getClient(): Client {
  if (client) return client

  const cloudSecureConnectBundle = process.env.ASTRA_DB_SECURE_CONNECT_BUNDLE
  const username = process.env.ASTRA_DB_CLIENT_ID
  const password = process.env.ASTRA_DB_CLIENT_SECRET
  const keyspace = process.env.ASTRA_DB_KEYSPACE

  if (!cloudSecureConnectBundle || !username || !password || !keyspace) {
    throw new Error(
      'ASTRA_DB_SECURE_CONNECT_BUNDLE, ASTRA_DB_CLIENT_ID, ASTRA_DB_CLIENT_SECRET, and ASTRA_DB_KEYSPACE must be set',
    )
  }

  client = new Client({
    cloud: { secureConnectBundle: cloudSecureConnectBundle },
    credentials: { username, password },
    keyspace,
  })

  return client
}

export async function disconnect(): Promise<void> {
  if (client) {
    await client.shutdown()
    client = null
  }
}
