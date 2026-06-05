import { OrderList } from '@/components/features/orders/order-list'
import {
  getAdminPedidoPath,
  getMockPedidosByEstablecimiento,
  mockAdminEstablecimientoId,
} from '@/lib/rappi'

export default function AdminPedidosPage() {
  const pedidos = getMockPedidosByEstablecimiento(mockAdminEstablecimientoId)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pedidos recibidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos de Burger Palermo. Vista operativa mock para el admin del local.
        </p>
      </div>

      <OrderList
        pedidos={pedidos}
        getHref={getAdminPedidoPath}
        emptyTitle="No hay pedidos para este establecimiento."
      />
    </section>
  )
}
