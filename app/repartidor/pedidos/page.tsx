import { Suspense } from "react"

import {
  AvailableOrdersSection,
  AvailableOrdersSkeleton,
} from "@/components/features/orders/available-orders-section"
import { OrderList } from "@/components/features/orders/order-list"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderListItem } from "@/lib/orders/view-model"
import { getRepartidorPedidoPath } from "@/lib/rappi"

export default async function RepartidorPedidosPage() {
  const session = await requireSession("repartidor")
  const [asignados, establecimientos] = await Promise.all([
    postgres.queries.getPedidosByRepartidor(session.userId),
    postgres.queries.getEstablecimientos(),
  ])

  if (asignados.error) return <ErrorState message={asignados.error} />
  if (establecimientos.error)
    return <ErrorState message={establecimientos.error} />

  const establecimientosData = establecimientos.data ?? []
  const asignadosData = (asignados.data ?? []).map((pedido) =>
    toOrderListItem(pedido, establecimientosData)
  )

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Pedidos asignados</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Pedidos disponibles para tomar y entregas asignadas a tu cuenta.
        </p>
      </div>

      <Suspense fallback={<AvailableOrdersSkeleton />}>
        <AvailableOrdersSection />
      </Suspense>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Mis entregas</h3>
        <OrderList
          pedidos={asignadosData}
          getHref={getRepartidorPedidoPath}
          emptyTitle="No tenés pedidos asignados."
        />
      </section>
    </section>
  )
}
