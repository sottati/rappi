'use client'

import {
  Add01Icon,
  Delete02Icon,
  Remove01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import type { CartItem } from '@/lib/cart/store'
import { formatArs } from '@/lib/rappi'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

interface CartLineItemRowProps {
  item: CartItem
  onQuantityChange: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

export function CartLineItemRow({
  item,
  onQuantityChange,
  onRemove,
}: CartLineItemRowProps) {
  const [imgError, setImgError] = useState(false)
  const lineTotal = item.unitPrice * item.quantity

  return (
    <li className="flex gap-3 border-b border-border/80 py-4 last:border-b-0">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/50 sm:size-20">
        {item.imageSrc && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageSrc}
            alt=""
            className="size-full object-contain p-2"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            {item.name.slice(0, 2)}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-0.5">
            <p className="truncate text-sm font-semibold">{item.name}</p>
            {item.description ? (
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
          <p className="shrink-0 text-sm font-semibold">
            {formatArs(lineTotal)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex items-center rounded-full border border-border">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label={`Quitar uno de ${item.name}`}
              onClick={() =>
                item.quantity <= 1
                  ? onRemove(item.id)
                  : onQuantityChange(item.id, item.quantity - 1)
              }
            >
              <HugeiconsIcon
                icon={Remove01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </Button>
            <span className="min-w-6 text-center text-sm font-medium tabular-nums">
              {item.quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
              aria-label={`Agregar uno de ${item.name}`}
              onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('text-muted-foreground hover:text-destructive')}
            onClick={() => onRemove(item.id)}
          >
            <HugeiconsIcon
              icon={Delete02Icon}
              className="size-4"
              strokeWidth={2}
            />
            Eliminar
          </Button>
        </div>
      </div>
    </li>
  )
}
