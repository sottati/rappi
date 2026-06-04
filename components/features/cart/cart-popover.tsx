'use client'

import { ShoppingBag01Icon } from '@hugeicons/core-free-icons'
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
import {
  formatArs,
  getCartItemCount,
  getCartTotal,
  mockCart,
} from '@/lib/rappi'

export function CartPopover() {
  const itemCount = getCartItemCount(mockCart)
  const total = getCartTotal(mockCart)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="relative" aria-label={`Carrito, ${itemCount} productos`}>
          <HugeiconsIcon icon={ShoppingBag01Icon} data-icon="inline-start" strokeWidth={2} />
          Carrito
          {itemCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex flex-col gap-3 p-4">
          <PopoverHeader className="gap-0.5">
            <PopoverTitle>Tu carrito</PopoverTitle>
            <PopoverDescription>{mockCart.restaurantName}</PopoverDescription>
          </PopoverHeader>

          {mockCart.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay productos todavía.</p>
          ) : (
            <ul className="flex max-h-52 flex-col gap-2 overflow-y-auto pr-1">
              {mockCart.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Cant. {item.quantity}</p>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatArs(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Separator />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total estimado</span>
            <span className="font-semibold text-primary">{formatArs(total)}</span>
          </div>

          <Button asChild className="w-full" size="sm">
            <Link href="/carrito">Ir al carrito</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
