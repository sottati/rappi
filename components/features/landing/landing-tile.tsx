'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'

interface LandingTileProps {
  label: string
  src: string
  href?: string
  variant?: 'category' | 'restaurant'
}

export function LandingTile({ label, src, href, variant = 'category' }: LandingTileProps) {
  const [imgError, setImgError] = useState(false)
  const isRestaurant = variant === 'restaurant'

  const content = (
    <div className="flex w-[88px] shrink-0 flex-col items-center gap-2 sm:w-[96px]">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden bg-muted/60',
          isRestaurant
            ? 'size-20 rounded-full border border-border/60 sm:size-[88px]'
            : 'size-20 rounded-2xl sm:size-24'
        )}
      >
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className={cn(
              'size-full',
              isRestaurant ? 'object-cover' : 'object-contain p-1.5'
            )}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="px-1 text-center text-xs font-semibold text-muted-foreground">
            {label.slice(0, 2)}
          </span>
        )}
      </div>
      <span className="line-clamp-2 w-full text-center text-xs leading-tight text-foreground">
        {label}
      </span>
    </div>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="shrink-0 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {content}
      </Link>
    )
  }

  return content
}
