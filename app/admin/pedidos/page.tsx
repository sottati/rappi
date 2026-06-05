import {
  OrderList,
  type OrderListItem,
} from '@/components/features/orders/order-list'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { postgres } from '@/lib/db'
import { getAdminPedidoPath } from '@/lib/rappi'
import type { Establecimiento, PedidoConDetalle } from '@/types/domain'

function toOrderListItem(
  pedido: PedidoConDetalle,
  establecimientos: Establecimiento[]
): OrderListItem {
  const establecimiento = establecimientos.find(
    (item) => item.idEstablecimiento === pedido.idEstablecimiento
  )

  return {
    idPedido: pedido.idPedido,
    estado: pedido.estado,
    fechaHora: pedido.fechaHora,
    total: pedido.total,
    establecimientoNombre:
      establecimiento?.nombre ?? `Local #${pedido.idEstablecimiento}`,
    lineas: pedido.detalles,
  }
}

export default async function AdminPedidosPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La cuenta admin no tiene un establecimiento asociado." />
    )
  }

  const [pedidos, establecimientos] = await Promise.all([
    postgres.queries.getPedidosByEstablecimiento(idEstablecimiento),
    postgres.queries.getEstablecimientos(),
  ])

  if (pedidos.error) return <ErrorState message={pedidos.error} />
  if (establecimientos.error)
    return <ErrorState message={establecimientos.error} />

  const pedidosData = (pedidos.data ?? []).map((pedido) =>
    toOrderListItem(pedido, establecimientos.data ?? [])
  )

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pedidos recibidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos asociados al establecimiento de la cuenta admin.
        </p>
      </div>

      <OrderList
        pedidos={pedidosData}
        getHref={getAdminPedidoPath}
        emptyTitle="No hay pedidos para este establecimiento."
      />
    </section>
  )
}
