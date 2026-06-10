import { Suspense } from "react"

import {
  AvailableOrdersSection,
  AvailableOrdersSkeleton,
} from "@/components/features/orders/available-orders-section"
import { OrderList } from "@/components/features/orders/order-list"
import { ErrorState } from "@/components/shared/query-state"
import { DataSourcePin } from "@/components/shared/data-source-pin"
import { requireSession } from "@/lib/auth/require-session"
import { cassandra } from "@/lib/db"
import { getRepartidorPedidoPath } from "@/lib/rappi"
import { EstadoPedido } from "@/types/domain"

export default async function RepartidorPedidosPage() {
  const session = await requireSession("repartidor")
  const asignados = await cassandra.queries.getPedidosPorRepartidor(session.userId)

  if (asignados.error) return <ErrorState message={asignados.error} />

  const asignadosData = (asignados.data ?? []).map((pedido) => ({
    idPedido: pedido.idPedido,
    estado: pedido.estado as EstadoPedido,
    fechaHora: pedido.fechaHora,
    total: pedido.total,
    establecimientoNombre: pedido.nombreEstablecimiento,
  }))

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

      <section className="relative space-y-3">
        <DataSourcePin source="cassandra" detail="pedidos_por_repartidor" />
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
