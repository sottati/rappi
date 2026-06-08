import { getSession } from '@/lib/auth/session'
import type { AppSession } from '@/lib/auth/session-types'

export type UsuarioScope =
  | { ok: true; session: AppSession; idCliente: number }
  | { ok: false; error: string }

export async function getUsuarioScope(): Promise<UsuarioScope> {
  const session = await getSession()

  if (!session) {
    return { ok: false, error: 'Tenés que iniciar sesión como usuario.' }
  }

  if (session.role !== 'usuario') {
    return { ok: false, error: 'Solo cuentas de usuario pueden realizar esta acción.' }
  }

  return {
    ok: true,
    session,
    idCliente: session.userId,
  }
}
