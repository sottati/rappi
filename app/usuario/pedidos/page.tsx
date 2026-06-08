import { OrderList } from "@/components/features/orders/order-list"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderListItem } from "@/lib/orders/view-model"
import { getUsuarioPedidoPath } from "@/lib/rappi"

export default async function UsuarioPedidosPage() {
  const session = await requireSession("usuario")
  const [pedidos, establecimientos] = await Promise.all([
    postgres.queries.getPedidosByCliente(session.userId),
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
        <h2 className="text-xl font-semibold">Mis pedidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de pedidos asociado a tu cuenta.
        </p>
      </div>

      <OrderList
        pedidos={pedidosData}
        getHref={getUsuarioPedidoPath}
        emptyTitle="Todavía no tenés pedidos."
      />
    </section>
  )
}
