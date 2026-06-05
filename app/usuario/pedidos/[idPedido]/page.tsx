import { notFound } from 'next/navigation'

import { OrderDetailView } from '@/components/features/orders/order-detail-view'
import { getMockPedidoById, mockUsuarioClienteId } from '@/lib/rappi'

interface UsuarioPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function UsuarioPedidoPage({ params }: UsuarioPedidoPageProps) {
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = getMockPedidoById(idPedido)
  if (!pedido || pedido.idCliente !== mockUsuarioClienteId) notFound()

  return (
    <OrderDetailView
      pedido={pedido}
      backHref="/usuario/pedidos"
      backLabel="Volver a mis pedidos"
    />
  )
}
