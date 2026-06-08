import { getSession } from '@/lib/auth/session'
import type { AppSession } from '@/lib/auth/session-types'

export type AdminScope =
  | { ok: true; session: AppSession; idEstablecimiento: number }
  | { ok: false; error: string }

export async function getAdminScope(): Promise<AdminScope> {
  const session = await getSession()

  if (!session) {
    return { ok: false, error: 'Tenés que iniciar sesión como admin.' }
  }

  if (session.role !== 'admin') {
    return { ok: false, error: 'Solo cuentas admin pueden realizar esta acción.' }
  }

  if (session.idEstablecimiento == null) {
    return {
      ok: false,
      error: 'La cuenta admin no tiene un establecimiento asociado.',
    }
  }

  return {
    ok: true,
    session,
    idEstablecimiento: session.idEstablecimiento,
  }
}
