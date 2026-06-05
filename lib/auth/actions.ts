'use server'

import { redirect } from 'next/navigation'
import { cuentaToSession, getRoleHomePath, setSession, clearSession } from '@/lib/auth/session'
import { postgres } from '@/lib/db'

export interface LoginFormState {
  error?: string
}

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { error: 'Completá email y contraseña.' }
  }

  const result = await postgres.queries.authenticateCuenta(email, password)
  if (result.error || !result.data) {
    return { error: result.error ?? 'Email o contraseña incorrectos.' }
  }

  await setSession(cuentaToSession(result.data))
  redirect(getRoleHomePath(result.data.rol))
}

export async function logoutAction(): Promise<void> {
  await clearSession()
  redirect('/login')
}
