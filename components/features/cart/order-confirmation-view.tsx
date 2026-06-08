'use client'

import {
  CheckmarkCircle02Icon,
  Home01Icon,
  Restaurant01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { formatArs, formatPedidoFecha } from '@/lib/rappi'
import type { PedidoConDetalle } from '@/types/domain'

import { OrderStatusBar } from './order-status-bar'

function SummaryRow({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <>
      <dt
        className={`border-b border-border/60 py-2.5 text-sm ${
          emphasis
            ? 'border-border pt-3 font-semibold text-foreground'
            : 'text-muted-foreground'
        }`}
      >
        {label}
      </dt>
      <dd
        className={`border-b border-border/60 py-2.5 text-right text-sm tabular-nums ${
          emphasis
            ? 'border-border pt-3 text-lg font-semibold text-primary'
            : 'font-medium'
        }`}
      >
        {value}
      </dd>
    </>
  )
}

interface OrderConfirmationViewProps {
  pedido: PedidoConDetalle
  restaurantName: string
  addressDetail: string
}

export function OrderConfirmationView({
  pedido,
  restaurantName,
  addressDetail,
}: OrderConfirmationViewProps) {
  const itemCount = pedido.detalles.reduce(
    (sum, item) => sum + item.cantidad,
    0
  )

  return (
    <>
      <div className="space-y-8">
        <div className="flex gap-4 border-b border-border/60 pb-8">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="size-7"
              strokeWidth={2}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                ¡Gracias por tu pedido!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Recibimos tu pedido y ya lo estamos procesando.
              </p>
            </div>
            <dl className="grid grid-cols-[1fr_auto] gap-x-6">
              <SummaryRow
                label="Número de pedido"
                value={`#${pedido.idPedido}`}
              />
              <SummaryRow
                label="Fecha de confirmación"
                value={formatPedidoFecha(pedido.fechaHora)}
              />
              <SummaryRow label="Estado" value={pedido.estado} />
            </dl>
          </div>
        </div>

        <div className="border-b border-border/60 pb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/60">
              <span className="text-xs font-semibold text-muted-foreground">
                {restaurantName.slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Local
              </p>
              <p className="truncate font-semibold">{restaurantName}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pr-4 pb-2 font-medium">Producto</th>
                  <th className="pr-4 pb-2 text-right font-medium">Cant.</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {pedido.detalles.map((item) => (
                  <tr
                    key={item.idDetalle}
                    className="border-b border-border/60 last:border-b-0"
                  >
                    <td className="py-2.5 pr-4 align-top">
                      <p className="font-medium">{item.nombreProducto}</p>
                    </td>
                    <td className="py-2.5 pr-4 text-right align-top text-muted-foreground tabular-nums">
                      {item.cantidad}
                    </td>
                    <td className="py-2.5 text-right align-top font-medium tabular-nums">
                      {formatArs(item.precioUnitario * item.cantidad)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-b border-border/60 pb-8">
          <dl className="grid grid-cols-[1fr_auto] gap-x-6 text-sm">
            <SummaryRow label="Entregar en" value={addressDetail} />
          </dl>
        </div>

        <div className="pb-8">
          <h2 className="mb-2 text-sm font-semibold">Resumen del pedido</h2>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6">
            <SummaryRow
              label="Total productos"
              value={formatArs(pedido.total)}
              emphasis
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            {itemCount} productos · El total refleja solo los ítems del pedido.
            Costos de envío y tarifa de servicio del carrito no se persisten en
            esta demo.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" size="lg" asChild>
            <Link href="/usuario/pedidos">
              <HugeiconsIcon
                icon={Home01Icon}
                className="size-4"
                strokeWidth={2}
              />
              Ver mis pedidos
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" size="lg" asChild>
            <Link href="/restaurantes">
              <HugeiconsIcon
                icon={Restaurant01Icon}
                className="size-4"
                strokeWidth={2}
              />
              Seguir comprando
            </Link>
          </Button>
        </div>
      </div>

      <OrderStatusBar />
    </>
  )
}
