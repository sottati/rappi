import { ClaimPedidoButton } from "@/components/features/orders/repartidor-order-actions"
import { OrderStatusBadge } from "@/components/features/orders/order-status-badge"
import { EmptyState, ErrorState } from "@/components/shared/query-state"
import { Skeleton } from "@/components/ui/skeleton"
import { redis } from "@/lib/db"
import type { AvailableOrderSnapshot } from "@/lib/db/redis/types"
import { formatArs, formatPedidoFecha } from "@/lib/rappi"
import { EstadoPedido } from "@/types/domain"

type AvailablePedidoSnapshot = AvailableOrderSnapshot & { estado: EstadoPedido }

function isAvailablePedidoSnapshot(
  pedido: AvailableOrderSnapshot
): pedido is AvailablePedidoSnapshot {
  return (
    pedido.estado === EstadoPedido.Confirmado ||
    pedido.estado === EstadoPedido.Preparando
  )
}

export function AvailableOrdersSkeleton() {
  return (
    <section className="space-y-3" aria-label="Cargando pedidos disponibles" aria-busy="true">
      <Skeleton className="h-5 w-44" />
      <div className="divide-y rounded-xl border border-border/80 bg-card">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56 max-w-full" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  )
}

export async function AvailableOrdersSection() {
  const disponibles = await redis.queries.getAvailableOrders()

  if (disponibles.error) return <ErrorState message={disponibles.error} />

  const disponiblesData = (disponibles.data ?? []).filter(isAvailablePedidoSnapshot)

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Disponibles para tomar</h3>
      {disponiblesData.length === 0 ? (
        <EmptyState title="No hay pedidos disponibles para reparto." />
      ) : (
        <div className="divide-y rounded-xl border border-border/80 bg-card">
          {disponiblesData.map((pedido) => (
            <article
              key={pedido.idPedido}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">Pedido #{pedido.idPedido}</p>
                  <OrderStatusBadge estado={pedido.estado} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {pedido.establecimientoNombre}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPedidoFecha(pedido.fechaHora)} · {pedido.itemCount}{" "}
                  {pedido.itemCount === 1 ? "producto" : "productos"} ·{" "}
                  {formatArs(pedido.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {pedido.direccionResumen}
                </p>
              </div>
              <ClaimPedidoButton idPedido={pedido.idPedido} />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
