import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { AppSession } from '@/lib/auth/session-types'

export type { AppSession } from '@/lib/auth/session-types'
export { cuentaToSession, getRoleHomePath } from '@/lib/auth/session-types'

const SESSION_COOKIE = 'rappi_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? 'dev-secret-cambiar-en-produccion'
}

function signPayload(payload: string): string {
  return createHmac('sha256', getAuthSecret()).update(payload).digest('base64url')
}

function encodeSession(session: AppSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return `${payload}.${signPayload(payload)}`
}

function decodeSession(value: string): AppSession | null {
  const [payload, signature] = value.split('.')
  if (!payload || !signature) return null

  const expected = signPayload(payload)
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AppSession
  } catch {
    return null
  }
}

export async function getSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(SESSION_COOKIE)?.value
  if (!value) return null
  return decodeSession(value)
}

export async function setSession(session: AppSession): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
