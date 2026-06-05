import { OrderList } from '@/components/features/orders/order-list'
import {
  getMockPedidosByCliente,
  getUsuarioPedidoPath,
  mockUsuarioClienteId,
} from '@/lib/rappi'

export default function UsuarioPedidosPage() {
  const pedidos = getMockPedidosByCliente(mockUsuarioClienteId)

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Mis pedidos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Historial de pedidos del usuario mock (Ana Pérez).
        </p>
      </div>

      <OrderList
        pedidos={pedidos}
        getHref={getUsuarioPedidoPath}
        emptyTitle="Todavía no tenés pedidos."
      />
    </section>
  )
}
