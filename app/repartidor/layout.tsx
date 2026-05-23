import type { ReactNode } from 'react'

import { RoleShell } from '@/components/shared/role-shell'
import { getMockSession } from '@/lib/auth/mock-session'

export default async function RepartidorLayout({ children }: { children: ReactNode }) {
  const session = await getMockSession('repartidor')

  return (
    <RoleShell
      eyebrow="Repartidor"
      title="Turno y entregas"
      description="Vista operativa para disponibilidad, pedidos asignados y estado de entrega."
      userLabel={session.displayName}
      navItems={[
        { href: '/repartidor', label: 'Perfil' },
        { href: '/repartidor/pedidos', label: 'Pedidos' },
        { href: '/repartidor/disponibilidad', label: 'Disponibilidad' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
