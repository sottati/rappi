'use client'

import {
  CheckmarkCircle02Icon,
  Home01Icon,
  Location01Icon,
  Restaurant01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  type CartItem,
  getCartItemCount,
  getCartSubtotal,
  getCartTotal,
  useCartStore,
} from '@/lib/cart/store'
import { formatArs, mockOrderConfirmation } from '@/lib/rappi'

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

interface ConfirmedCartSnapshot {
  restaurantName: string
  restaurantLogoSrc: string
  deliveryMinutes: number
  deliveryFee: number
  serviceFee: number
  addressLabel: string
  addressDetail: string
  items: CartItem[]
}

function ConfirmationLineItem({ item }: { item: CartItem }) {
  const lineTotal = item.unitPrice * item.quantity

  return (
    <tr className="border-b border-border/60 last:border-b-0">
      <td className="py-2.5 pr-4 align-top">
        <p className="font-medium">{item.name}</p>
        {item.description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </td>
      <td className="py-2.5 pr-4 text-right align-top text-muted-foreground tabular-nums">
        {item.quantity}
      </td>
      <td className="py-2.5 text-right align-top font-medium tabular-nums">
        {formatArs(lineTotal)}
      </td>
    </tr>
  )
}

export function OrderConfirmationView() {
  const clearCart = useCartStore((state) => state.clearCart)
  const [cart] = useState<ConfirmedCartSnapshot>(() => ({
    restaurantName: useCartStore.getState().restaurantName,
    restaurantLogoSrc: useCartStore.getState().restaurantLogoSrc,
    deliveryMinutes: useCartStore.getState().deliveryMinutes,
    deliveryFee: useCartStore.getState().deliveryFee,
    serviceFee: useCartStore.getState().serviceFee,
    addressLabel: useCartStore.getState().addressLabel,
    addressDetail: useCartStore.getState().addressDetail,
    items: useCartStore.getState().items,
  }))
  const clearedRef = useRef(false)

  useEffect(() => {
    if (cart.items.length > 0 && !clearedRef.current) {
      clearCart()
      clearedRef.current = true
    }
  }, [cart.items.length, clearCart])

  const subtotal = getCartSubtotal(cart.items)
  const total = getCartTotal(cart)
  const itemCount = getCartItemCount(cart.items)

  if (cart.items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <h1 className="text-xl font-semibold">
          No hay un pedido para confirmar
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Agregá productos al carrito antes de confirmar la compra.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurantes">Ver restaurantes</Link>
        </Button>
      </div>
    )
  }

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
                value={mockOrderConfirmation.orderId}
              />
              <SummaryRow
                label="Fecha de confirmación"
                value={mockOrderConfirmation.confirmedAtLabel}
              />
              <SummaryRow
                label="Llegada estimada"
                value={`${cart.deliveryMinutes} min`}
              />
            </dl>
          </div>
        </div>

        <div className="border-b border-border/60 pb-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/60">
              {cart.restaurantLogoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cart.restaurantLogoSrc}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">
                  {cart.restaurantName.slice(0, 2)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Local
              </p>
              <p className="truncate font-semibold">{cart.restaurantName}</p>
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
                {cart.items.map((item) => (
                  <ConfirmationLineItem key={item.id} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-3 border-b border-border/60 pb-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-5"
              strokeWidth={2}
            />
          </div>
          <dl className="grid min-w-0 flex-1 grid-cols-[1fr_auto] gap-x-6 text-sm">
            <SummaryRow label="Entregar en" value={cart.addressLabel} />
            <SummaryRow label="Dirección" value={cart.addressDetail} />
          </dl>
        </div>

        <div className="pb-8">
          <h2 className="mb-2 text-sm font-semibold">Resumen del pago</h2>
          <dl className="grid grid-cols-[1fr_auto] gap-x-6">
            <SummaryRow label="Subtotal" value={formatArs(subtotal)} />
            <SummaryRow
              label="Costo de envío"
              value={formatArs(cart.deliveryFee)}
            />
            <SummaryRow
              label="Tarifa de servicio"
              value={formatArs(cart.serviceFee)}
            />
            <SummaryRow
              label="Total pagado"
              value={formatArs(total)}
              emphasis
            />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            {itemCount} productos · Pago simulado
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" size="lg" asChild>
            <Link href="/">
              <HugeiconsIcon
                icon={Home01Icon}
                className="size-4"
                strokeWidth={2}
              />
              Volver al inicio
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
