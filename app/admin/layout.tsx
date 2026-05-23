import type { ReactNode } from 'react'

import { RoleShell } from '@/components/shared/role-shell'
import { getMockSession } from '@/lib/auth/mock-session'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getMockSession('admin')

  return (
    <RoleShell
      eyebrow="Admin"
      title="Gestion del establecimiento"
      description="Panel para revisar locales, productos, pedidos recibidos y metricas operativas."
      userLabel={session.displayName}
      navItems={[
        { href: '/admin', label: 'Resumen' },
        { href: '/admin/establecimientos', label: 'Establecimientos' },
        { href: '/admin/productos', label: 'Productos' },
        { href: '/admin/pedidos', label: 'Pedidos' },
        { href: '/admin/analytics', label: 'Analytics' },
      ]}
    >
      {children}
    </RoleShell>
  )
}
