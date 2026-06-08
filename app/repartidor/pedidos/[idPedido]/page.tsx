import { notFound } from "next/navigation"

import { OrderDetailView } from "@/components/features/orders/order-detail-view"
import { RepartidorPedidoStatusAction } from "@/components/features/orders/repartidor-order-actions"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderDetailPedido } from "@/lib/orders/view-model"

interface RepartidorPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function RepartidorPedidoPage({
  params,
}: RepartidorPedidoPageProps) {
  const session = await requireSession("repartidor")
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return <ErrorState message={pedido.error} />
  if (!pedido.data || pedido.data.idRepartidor !== session.userId) notFound()

  const [establecimiento, direccion, repartidor] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.data.idEstablecimiento),
    postgres.queries.getDireccionEntregaById(
      pedido.data.idDireccion,
      pedido.data.idCliente
    ),
    postgres.queries.getRepartidorById(session.userId),
  ])

  if (establecimiento.error)
    return <ErrorState message={establecimiento.error} />
  if (direccion.error) return <ErrorState message={direccion.error} />
  if (repartidor.error) return <ErrorState message={repartidor.error} />

  return (
    <div className="space-y-6">
      <OrderDetailView
        pedido={toOrderDetailPedido({
          pedido: pedido.data,
          establecimiento: establecimiento.data,
          direccion: direccion.data,
          repartidor: repartidor.data,
        })}
        backHref="/repartidor/pedidos"
        backLabel="Volver a pedidos asignados"
      />

      <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="mb-1 text-sm font-semibold">Acciones de entrega</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Actualizá el avance del pedido asignado a tu cuenta.
        </p>
        <RepartidorPedidoStatusAction
          idPedido={pedido.data.idPedido}
          estado={pedido.data.estado}
        />
      </section>
    </div>
  )
}
