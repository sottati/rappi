'use client'

import {
  Add01Icon,
  Delete02Icon,
  Remove01Icon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { getCartItemCount, getCartTotal, useCartStore } from '@/lib/cart/store'
import { formatArs } from '@/lib/rappi'

export function CartPopover() {
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const restaurantName = useCartStore((state) => state.restaurantName)
  const deliveryFee = useCartStore((state) => state.deliveryFee)
  const serviceFee = useCartStore((state) => state.serviceFee)
  const itemCount = getCartItemCount(items)
  const total = getCartTotal({ items, deliveryFee, serviceFee })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="relative"
          aria-label={`Carrito, ${itemCount} productos`}
        >
          <HugeiconsIcon
            icon={ShoppingBag01Icon}
            data-icon="inline-start"
            strokeWidth={2}
          />
          Carrito
          {itemCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0 sm:w-80">
        <div className="flex flex-col gap-2 p-3">
          <PopoverHeader className="gap-0">
            <PopoverTitle className="text-sm">Tu carrito</PopoverTitle>
            <PopoverDescription className="truncate text-xs">
              {restaurantName || 'Todavía no elegiste un local'}
            </PopoverDescription>
          </PopoverHeader>

          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No hay productos todavía.
            </p>
          ) : (
            <ul className="max-h-44 divide-y divide-border/50 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-1.5 py-1.5 first:pt-0 last:pb-0"
                >
                  <p className="min-w-0 flex-1 truncate text-xs font-medium">
                    {item.name}
                  </p>

                  <div className="inline-flex h-6 shrink-0 items-center rounded-full border border-border/60 bg-muted/20">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-full"
                      aria-label={`Quitar uno de ${item.name}`}
                      onClick={() =>
                        item.quantity <= 1
                          ? removeItem(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                    >
                      <HugeiconsIcon icon={Remove01Icon} strokeWidth={2} />
                    </Button>
                    <span className="w-4 text-center text-[11px] font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="rounded-full"
                      aria-label={`Agregar uno de ${item.name}`}
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                    </Button>
                  </div>

                  <span className="shrink-0 text-xs font-medium tabular-nums">
                    {formatArs(item.unitPrice * item.quantity)}
                  </span>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label={`Eliminar ${item.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Separator />

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total estimado</span>
            <span className="font-semibold text-primary tabular-nums">
              {formatArs(total)}
            </span>
          </div>

          <Button asChild className="h-8 w-full text-xs" size="sm">
            <Link href="/carrito">Ir al carrito</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
