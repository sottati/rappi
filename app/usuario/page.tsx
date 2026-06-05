import Link from 'next/link'

import { ErrorState } from '@/components/shared/query-state'
import { StatCard } from '@/components/shared/stat-card'
import { requireSession } from '@/lib/auth/require-session'
import { postgres } from '@/lib/db'

export default async function UsuarioPage() {
  const session = await requireSession('usuario')
  const [establecimientos, pedidos] = await Promise.all([
    postgres.queries.getEstablecimientos(),
    postgres.queries.getPedidos(),
  ])

  if (establecimientos.error) return <ErrorState message={establecimientos.error} />
  if (pedidos.error) return <ErrorState message={pedidos.error} />

  const establecimientosData = establecimientos.data ?? []
  const pedidosData = pedidos.data ?? []
  const pedidosDelUsuario = pedidosData.filter(
    (pedido) => pedido.idCliente === session.userId,
  )

  return (
    <section className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Pedidos" value={pedidosDelUsuario.length} />
        <StatCard label="Locales disponibles" value={establecimientosData.length} />
        <StatCard label="Perfil" value="Activo" detail={session.email} />
      </div>

      <div className="rounded-md border bg-card p-5">
        <h2 className="text-xl font-semibold">Perfil de usuario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consumidor final autenticado. Mas adelante se enlaza con Supabase Auth y
          la tabla/coleccion de perfil.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{session.displayName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{session.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link className="rounded-md border bg-card p-4 hover:bg-muted" href="/usuario/establecimientos">
          Ver establecimientos
        </Link>
        <Link className="rounded-md border bg-card p-4 hover:bg-muted" href="/usuario/pedidos">
          Ver mis pedidos
        </Link>
      </div>
    </section>
  )
}
