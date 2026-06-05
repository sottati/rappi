import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getRoleHomePath } from '@/lib/auth/session-types'
import type { AppRole } from '@/types/domain'

export async function requireSession(role: AppRole) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== role) redirect(getRoleHomePath(session.role))
  return session
}
