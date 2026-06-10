import type { ReactNode } from 'react'

import { RoleShell } from '@/components/shared/role-shell'
import { requireSession } from '@/lib/auth/require-session'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSession('admin')

  return (
    <RoleShell
      title="Gestion del establecimiento"
      description="Panel para gestionar el catalogo, pedidos recibidos y metricas del local."
      userLabel={session.displayName}
      navItems={[
        { href: '/admin', label: 'Resumen' },
        { href: '/admin/local', label: 'Mi establecimiento' },
        { href: '/admin/productos', label: 'Productos' },
        { href: '/admin/pedidos', label: 'Pedidos' },
        { href: '/admin/analytics', label: 'Analytics' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
