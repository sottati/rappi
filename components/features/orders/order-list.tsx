import Link from 'next/link'

import { OrderStatusBadge } from '@/components/features/orders/order-status-badge'
import { EmptyState } from '@/components/shared/query-state'
import { formatArs, formatPedidoFecha, type MockPedidoVista } from '@/lib/rappi'

interface OrderListProps {
  pedidos: MockPedidoVista[]
  getHref: (idPedido: number) => string
  emptyTitle?: string
}

export function OrderList({
  pedidos,
  getHref,
  emptyTitle = 'No hay pedidos para mostrar.',
}: OrderListProps) {
  if (pedidos.length === 0) {
    return <EmptyState title={emptyTitle} />
  }

  return (
    <div className="divide-y rounded-xl border border-border/80 bg-card">
      {pedidos.map((pedido) => (
        <Link
          key={pedido.idPedido}
          href={getHref(pedido.idPedido)}
          className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">Pedido #{pedido.idPedido}</p>
              <OrderStatusBadge estado={pedido.estado} />
            </div>
            <p className="text-sm text-muted-foreground">{pedido.establecimientoNombre}</p>
            <p className="text-xs text-muted-foreground">
              {formatPedidoFecha(pedido.fechaHora)} · {pedido.lineas.length}{' '}
              {pedido.lineas.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <p className="shrink-0 text-lg font-semibold">{formatArs(pedido.total)}</p>
        </Link>
      ))}
    </div>
  )
}
