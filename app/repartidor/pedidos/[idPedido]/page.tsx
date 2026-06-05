import { notFound } from 'next/navigation'

import { OrderDetailView } from '@/components/features/orders/order-detail-view'
import { getMockPedidoById, mockRepartidorId } from '@/lib/rappi'

interface RepartidorPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function RepartidorPedidoPage({ params }: RepartidorPedidoPageProps) {
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = getMockPedidoById(idPedido)
  if (!pedido || pedido.idRepartidor !== mockRepartidorId) notFound()

  return (
    <OrderDetailView
      pedido={pedido}
      backHref="/repartidor/pedidos"
      backLabel="Volver a pedidos asignados"
    />
  )
}
