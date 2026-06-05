import { OrderList } from '@/components/features/orders/order-list'
import {
  getMockPedidosByRepartidor,
  getRepartidorPedidoPath,
  mockRepartidorId,
} from '@/lib/rappi'

export default function RepartidorPedidosPage() {
  const pedidos = getMockPedidosByRepartidor(mockRepartidorId)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Pedidos asignados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Entregas asignadas a Lucia Gomez (repartidor mock).
        </p>
      </div>

      <OrderList
        pedidos={pedidos}
        getHref={getRepartidorPedidoPath}
        emptyTitle="No tenés pedidos asignados."
      />
    </section>
  )
}
