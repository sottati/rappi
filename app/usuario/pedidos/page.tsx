import { OrderList } from "@/components/features/orders/order-list"
import { ErrorState } from "@/components/shared/query-state"
import { DataSourcePin } from "@/components/shared/data-source-pin"
import { requireSession } from "@/lib/auth/require-session"
import { cassandra } from "@/lib/db"
import { getUsuarioPedidoPath } from "@/lib/rappi"
import { EstadoPedido } from "@/types/domain"

export default async function UsuarioPedidosPage() {
  const session = await requireSession("usuario")
  const pedidos = await cassandra.queries.getPedidosPorCliente(session.userId)

  if (pedidos.error) return <ErrorState message={pedidos.error} />

  const pedidosData = (pedidos.data ?? []).map((pedido) => ({
    idPedido: pedido.idPedido,
    estado: pedido.estado as EstadoPedido,
    fechaHora: pedido.fechaHora,
    total: pedido.total,
    establecimientoNombre: pedido.nombreEstablecimiento,
  }))

  return (
    <section className="relative space-y-4">
      <DataSourcePin source="cassandra" detail="pedidos_por_cliente" />
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
