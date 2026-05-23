import type { ReactNode } from 'react'

import { RoleShell } from '@/components/shared/role-shell'
import { getMockSession } from '@/lib/auth/mock-session'

export default async function UsuarioLayout({ children }: { children: ReactNode }) {
  const session = await getMockSession('usuario')

  return (
    <RoleShell
      eyebrow="Usuario"
      title="Cuenta y pedidos"
      description="Vista del consumidor final para explorar establecimientos, revisar pedidos y administrar direcciones."
      userLabel={session.displayName}
      navItems={[
        { href: '/usuario', label: 'Perfil' },
        { href: '/usuario/establecimientos', label: 'Establecimientos' },
        { href: '/usuario/pedidos', label: 'Mis pedidos' },
        { href: '/usuario/direcciones', label: 'Direcciones' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
