'use client'

import { Clock01Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'

import { formatArs, type EstablishmentPresentation } from '@/lib/rappi'
import type { Establecimiento } from '@/types/domain'

interface EstablishmentHeroProps {
  establecimiento: Establecimiento
  presentation: EstablishmentPresentation
}

export function EstablishmentHero({ establecimiento, presentation }: EstablishmentHeroProps) {
  const [coverError, setCoverError] = useState(false)
  const [logoError, setLogoError] = useState(false)

  return (
    <section className="w-full bg-primary/8 px-4 pb-8 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div className="relative aspect-3/1 min-h-40 overflow-hidden rounded-2xl border border-border/80 bg-muted">
          {!coverError && presentation.coverSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={presentation.coverSrc}
              alt=""
              className="size-full object-cover"
              onError={() => setCoverError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-primary/10 text-lg font-semibold text-primary">
              {establecimiento.nombre}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {!logoError && presentation.logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={presentation.logoSrc}
                  alt=""
                  className="size-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  {establecimiento.nombre.slice(0, 2)}
                </span>
              )}
            </div>

            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">
                {establecimiento.nombre}
              </h1>
              <p className="text-sm text-muted-foreground">{establecimiento.direccion}</p>
              <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                {establecimiento.tipo}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 font-medium">
              <HugeiconsIcon icon={StarIcon} className="size-4 text-amber-500" strokeWidth={2} />
              {presentation.rating.toFixed(1)}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} className="size-4" strokeWidth={2} />
              {presentation.deliveryMinutes} min
            </div>
            <div className="rounded-full border border-border bg-background px-3 py-1.5 text-muted-foreground">
              Envío {formatArs(presentation.deliveryFee)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
