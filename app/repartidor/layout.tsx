import type { ReactNode } from 'react'

import { RoleShell } from '@/components/shared/role-shell'
import { requireSession } from '@/lib/auth/require-session'

export default async function RepartidorLayout({ children }: { children: ReactNode }) {
  const session = await requireSession('repartidor')

  return (
    <RoleShell
      title="Turno y entregas"
      description="Vista operativa para disponibilidad, pedidos asignados y estado de entrega."
      userLabel={session.displayName}
      navItems={[
        { href: '/repartidor', label: 'Inicio' },
        { href: '/repartidor/pedidos', label: 'Pedidos' },
        { href: '/repartidor/disponibilidad', label: 'Disponibilidad' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
