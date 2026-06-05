import { notFound } from 'next/navigation'

import { AdminOrderDetailView } from '@/components/features/orders/admin-order-detail-view'
import { getMockPedidoById, mockAdminEstablecimientoId } from '@/lib/rappi'

interface AdminPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function AdminPedidoPage({ params }: AdminPedidoPageProps) {
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = getMockPedidoById(idPedido)
  if (!pedido || pedido.idEstablecimiento !== mockAdminEstablecimientoId) notFound()

  return <AdminOrderDetailView pedido={pedido} />
}
