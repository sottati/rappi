import Link from 'next/link'

import { ErrorState } from '@/components/shared/query-state'
import { StatCard } from '@/components/shared/stat-card'
import { postgres } from '@/lib/db'

export default async function AdminPage() {
  const [establecimientos, pedidos] = await Promise.all([
    postgres.queries.getEstablecimientos(),
    postgres.queries.getPedidos(),
  ])

  if (establecimientos.error) return <ErrorState message={establecimientos.error} />
  if (pedidos.error) return <ErrorState message={pedidos.error} />

  const establecimientosData = establecimientos.data ?? []
  const pedidosData = pedidos.data ?? []
  const totalFacturado = pedidosData.reduce((sum, pedido) => sum + pedido.total, 0)

  return (
    <section className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Establecimientos" value={establecimientosData.length} />
        <StatCard label="Pedidos mock" value={pedidosData.length} />
        <StatCard label="Facturacion" value={`$${totalFacturado.toLocaleString('es-AR')}`} />
      </div>

      <div className="rounded-md border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Accesos rapidos</h2>
        </div>
        <div className="grid gap-0 divide-y">
          <Link className="p-4 text-sm hover:bg-muted" href="/admin/establecimientos">
            Revisar establecimientos administrados
          </Link>
          <Link className="p-4 text-sm hover:bg-muted" href="/admin/pedidos">
            Ver pedidos recibidos
          </Link>
        </div>
      </div>
    </section>
  )
}
