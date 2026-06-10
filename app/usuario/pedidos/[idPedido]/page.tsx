import type { ReactNode } from "react"

import { notFound } from "next/navigation"

import { OrderDetailView } from "@/components/features/orders/order-detail-view"
import { RateOrderForm } from "@/components/features/orders/rate-order-form"
import { ErrorState } from "@/components/shared/query-state"
import { requireSession } from "@/lib/auth/require-session"
import { postgres } from "@/lib/db"
import { toOrderDetailPedido } from "@/lib/orders/view-model"
import { EstadoPedido, TipoCalificacion } from "@/types/domain"

interface UsuarioPedidoPageProps {
  params: Promise<{ idPedido: string }>
}

export default async function UsuarioPedidoPage({
  params,
}: UsuarioPedidoPageProps) {
  const session = await requireSession("usuario")
  const { idPedido: rawId } = await params
  const idPedido = Number.parseInt(rawId, 10)

  if (Number.isNaN(idPedido)) notFound()

  const pedido = await postgres.queries.getPedidoById(idPedido)
  if (pedido.error) return <ErrorState message={pedido.error} />
  if (!pedido.data || pedido.data.idCliente !== session.userId) notFound()

  const [establecimiento, direccion, repartidor] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.data.idEstablecimiento),
    postgres.queries.getDireccionEntregaById(
      pedido.data.idDireccion,
      pedido.data.idCliente
    ),
    pedido.data.idRepartidor == null
      ? Promise.resolve({ data: null, error: null as string | null })
      : postgres.queries.getRepartidorById(pedido.data.idRepartidor),
  ])

  if (establecimiento.error)
    return <ErrorState message={establecimiento.error} />
  if (direccion.error) return <ErrorState message={direccion.error} />
  if (repartidor.error) return <ErrorState message={repartidor.error} />

  let calificacionesSection: ReactNode = null
  if (pedido.data.estado === EstadoPedido.Entregado) {
    const calificaciones = await postgres.queries.getCalificacionesByPedido(idPedido)
    if (calificaciones.error) return <ErrorState message={calificaciones.error} />

    const yaCalificado = (calificaciones.data ?? []).length > 0

    if (yaCalificado) {
      const puntajeLocal = calificaciones.data?.find(
        (item) => item.tipo === TipoCalificacion.Establecimiento
      )?.puntaje
      const puntajeRepartidor = calificaciones.data?.find(
        (item) => item.tipo === TipoCalificacion.Repartidor
      )?.puntaje

      calificacionesSection = (
        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-2 text-sm font-semibold">Tu calificación</h2>
          <p className="text-sm text-muted-foreground">
            Ya calificaste este pedido.
            {puntajeLocal != null ? ` Local: ${puntajeLocal}/5.` : ""}
            {puntajeRepartidor != null ? ` Repartidor: ${puntajeRepartidor}/5.` : ""}
          </p>
        </section>
      )
    } else {
      calificacionesSection = (
        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Calificá tu pedido</h2>
          <RateOrderForm
            idPedido={idPedido}
            hasRepartidor={pedido.data.idRepartidor != null}
          />
        </section>
      )
    }
  }

  return (
    <div className="space-y-6">
      <OrderDetailView
        pedido={toOrderDetailPedido({
          pedido: pedido.data,
          establecimiento: establecimiento.data,
          direccion: direccion.data,
          repartidor: repartidor.data,
        })}
        backHref="/usuario/pedidos"
        backLabel="Volver a mis pedidos"
      />
      {calificacionesSection}
    </div>
  )
}
