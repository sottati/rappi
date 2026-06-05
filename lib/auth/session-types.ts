import type { AppRole, CuentaApp } from '@/types/domain'

export interface AppSession {
  cuentaId: number
  role: AppRole
  email: string
  displayName: string
  /** Id de dominio segun rol: establecimiento, repartidor o cliente. */
  userId: number
  idEstablecimiento?: number
}

export function cuentaToSession(cuenta: CuentaApp): AppSession {
  const userId =
    cuenta.rol === 'admin'
      ? (cuenta.idEstablecimiento ?? cuenta.idCuenta)
      : cuenta.rol === 'repartidor'
        ? (cuenta.idRepartidor ?? cuenta.idCuenta)
        : (cuenta.idCliente ?? cuenta.idCuenta)

  return {
    cuentaId: cuenta.idCuenta,
    role: cuenta.rol,
    email: cuenta.email,
    displayName: cuenta.nombreVisible,
    userId,
    idEstablecimiento: cuenta.idEstablecimiento ?? undefined,
  }
}

export function getRoleHomePath(role: AppRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'repartidor':
      return '/repartidor'
    case 'usuario':
      return '/usuario'
  }
}
