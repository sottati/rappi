import { notFound } from "next/navigation"

import { AdminOrderDetailView } from "@/components/features/orders/admin-order-detail-view"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderDetailPedido } from "@/lib/orders/view-model"

interface AdminPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function AdminPedidoPage({
  params,
}: AdminPedidoPageProps) {
  const session = await requireSession("admin")
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La cuenta admin no tiene un establecimiento asociado." />
    )
  }

  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return <ErrorState message={pedido.error} />
  if (!pedido.data || pedido.data.idEstablecimiento !== idEstablecimiento) {
    notFound()
  }

  const [establecimiento, direccion, repartidor] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.data.idEstablecimiento),
    postgres.queries.getDireccionEntregaById(
      pedido.data.idDireccion,
      pedido.data.idCliente
    ),
    pedido.data.idRepartidor == null
      ? Promise.resolve({ data: null, error: null as string | null })
      : postgres.queries.getRepartidorById(pedido.data.idRepartidor),
  ])

  if (establecimiento.error)
    return <ErrorState message={establecimiento.error} />
  if (direccion.error) return <ErrorState message={direccion.error} />
  if (repartidor.error) return <ErrorState message={repartidor.error} />

  return (
    <AdminOrderDetailView
      pedido={toOrderDetailPedido({
        pedido: pedido.data,
        establecimiento: establecimiento.data,
        direccion: direccion.data,
        repartidor: repartidor.data,
      })}
    />
  )
}
