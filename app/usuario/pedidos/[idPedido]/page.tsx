import { notFound } from "next/navigation"

import { OrderDetailView } from "@/components/features/orders/order-detail-view"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderDetailPedido } from "@/lib/orders/view-model"

interface UsuarioPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function UsuarioPedidoPage({
  params,
}: UsuarioPedidoPageProps) {
  const session = await requireSession("usuario")
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return <ErrorState message={pedido.error} />
  if (!pedido.data || pedido.data.idCliente !== session.userId) notFound()

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
    <OrderDetailView
      pedido={toOrderDetailPedido({
        pedido: pedido.data,
        establecimiento: establecimiento.data,
        direccion: direccion.data,
        repartidor: repartidor.data,
      })}
      backHref="/usuario/pedidos"
      backLabel="Volver a mis pedidos"
    />
  )
}
