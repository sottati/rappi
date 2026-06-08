import Link from "next/link"

import { OrderStatusBadge } from "@/components/features/orders/order-status-badge"
import { PedidoStatusStepper } from "@/components/features/orders/pedido-status-stepper"
import { Separator } from "@/components/ui/separator"
import { formatArs, formatPedidoFecha } from "@/lib/rappi"
import type { EstadoPedido } from "@/types/domain"

export interface OrderDetailPedido {
  idPedido: number
  fechaHora: Date
  estado: EstadoPedido
  total: number
  establecimientoNombre: string
  repartidorNombre: string | null
  direccion: {
    label: string
    calle: string
    numero: string
    ciudad: string
    codigoPostal: string
  }
  lineas: Array<{
    idDetalle: number
    nombreProducto: string
    cantidad: number
    precioUnitario: number
  }>
}

interface OrderDetailViewProps {
  pedido: OrderDetailPedido
  backHref: string
  backLabel?: string
}

export function OrderDetailView({
  pedido,
  backHref,
  backLabel = "Volver al listado",
}: OrderDetailViewProps) {
  const direccionCompleta = `${pedido.direccion.calle} ${pedido.direccion.numero}, ${pedido.direccion.ciudad} (${pedido.direccion.codigoPostal})`

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← {backLabel}
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">
              Pedido #{pedido.idPedido}
            </h1>
            <OrderStatusBadge estado={pedido.estado} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatPedidoFecha(pedido.fechaHora)}
          </p>
        </div>
        <p className="text-2xl font-semibold">{formatArs(pedido.total)}</p>
      </div>

      <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">Estado del pedido</h2>
        <PedidoStatusStepper estado={pedido.estado} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Local</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Establecimiento</dt>
              <dd className="font-medium">{pedido.establecimientoNombre}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Repartidor</dt>
              <dd className="font-medium">
                {pedido.repartidorNombre ?? "Sin asignar"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-sm font-semibold">Entrega</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Dirección</dt>
              <dd className="font-medium">{pedido.direccion.label}</dd>
              <dd className="text-muted-foreground">{direccionCompleta}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold">Detalle del pedido</h2>
        <ul className="divide-y">
          {pedido.lineas.map((linea) => (
            <li
              key={linea.idDetalle}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="font-medium">{linea.nombreProducto}</p>
                <p className="text-sm text-muted-foreground">
                  {linea.cantidad} × {formatArs(linea.precioUnitario)}
                </p>
              </div>
              <p className="shrink-0 font-semibold">
                {formatArs(linea.cantidad * linea.precioUnitario)}
              </p>
            </li>
          ))}
        </ul>
        <Separator className="my-4" />
        <div className="flex items-center justify-between font-semibold">
          <span>Total</span>
          <span>{formatArs(pedido.total)}</span>
        </div>
      </section>
    </div>
  )
}
