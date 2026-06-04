'use client'

import {
  DeliveryTruck01Icon,
  Location01Icon,
  Restaurant01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatArs, type CartLineItem, type MockCart } from '@/lib/rappi'

import { CartLineItemRow } from './cart-line-item'

interface CartViewProps {
  cart: MockCart
}

export function CartView({ cart }: CartViewProps) {
  const [items, setItems] = useState<CartLineItem[]>(() => [...cart.items])

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )
  const total = subtotal + cart.deliveryFee + cart.serviceFee

  const updateQuantity = (id: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
        <p className="text-base font-semibold">Tu carrito está vacío</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Explorá restaurantes y agregá productos para continuar.
        </p>
        <Button asChild className="mt-6">
          <Link href="/restaurantes">Ver restaurantes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cart.restaurantLogoSrc}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Pedido de
              </p>
              <p className="truncate text-lg font-semibold">{cart.restaurantName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <HugeiconsIcon icon={DeliveryTruck01Icon} className="size-3.5" strokeWidth={2} />
                {cart.deliveryMinutes} min aprox.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/restaurantes">Agregar más</Link>
            </Button>
          </div>

          <Separator className="my-4" />

          <ul>
            {items.map((item) => (
              <CartLineItemRow
                key={item.id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={Location01Icon} className="size-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Entregar en {cart.addressLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{cart.addressDetail}</p>
            </div>
            <Button variant="ghost" size="sm" type="button" disabled>
              Cambiar
            </Button>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <section className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
          <h2 className="text-lg font-semibold">Resumen del pedido</h2>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatArs(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Costo de envío</dt>
              <dd className="font-medium">{formatArs(cart.deliveryFee)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tarifa de servicio</dt>
              <dd className="font-medium">{formatArs(cart.serviceFee)}</dd>
            </div>
          </dl>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <span className="text-base font-semibold">Total</span>
            <span className="text-xl font-semibold text-primary">{formatArs(total)}</span>
          </div>

          <p className="text-xs text-muted-foreground">
            {items.reduce((sum, item) => sum + item.quantity, 0)} productos · Pago al confirmar
            (mock)
          </p>

          <Button className="w-full" size="lg" asChild>
            <Link href="/carrito/confirmacion">Confirmar pedido</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/restaurantes">
              <HugeiconsIcon icon={Restaurant01Icon} className="size-4" strokeWidth={2} />
              Seguir comprando
            </Link>
          </Button>
        </section>
      </aside>
    </div>
  )
}
