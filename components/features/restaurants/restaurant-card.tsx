'use client'

import { StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useState } from 'react'

import type { RestaurantListing } from '@/lib/rappi'
import { cn } from '@/lib/utils'

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

interface RestaurantCardProps {
  restaurant: RestaurantListing
  className?: string
}

export function RestaurantCard({ restaurant, className }: RestaurantCardProps) {
  const [coverError, setCoverError] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const href = restaurant.idEstablecimiento
    ? `/restaurantes/${restaurant.idEstablecimiento}`
    : undefined

  const card = (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-colors hover:border-primary/30 hover:shadow-sm',
        href && 'cursor-pointer',
        className
      )}
      aria-label={`${restaurant.name}, ${restaurant.deliveryMinutes} minutos, calificación ${restaurant.rating}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {href ? (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            Ver menú
          </span>
        ) : null}
        {!coverError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={restaurant.coverSrc}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setCoverError(true)}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/10 text-sm font-medium text-primary">
            {restaurant.name}
          </div>
        )}
      </div>

      <div className="flex items-start gap-2.5 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-muted/60">
          {!logoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={restaurant.logoSrc}
              alt=""
              className="size-full object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground">
              {restaurant.name.slice(0, 2)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-sm font-semibold leading-tight">{restaurant.name}</h3>
          <p className="text-xs text-muted-foreground">
            <span>{restaurant.deliveryMinutes} min</span>
            <span className="mx-1.5 text-border">·</span>
            <span>{currency.format(restaurant.deliveryFee)}</span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-md bg-muted/80 px-1.5 py-0.5 text-xs font-semibold">
          <HugeiconsIcon
            icon={StarIcon}
            className="size-3 text-amber-500"
            strokeWidth={2}
          />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>
      </div>
    </article>
  )

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl">
        {card}
      </Link>
    )
  }

  return card
}
