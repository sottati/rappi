import { Clock01Icon, StarIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { formatArs, type EstablishmentPresentation } from '@/lib/rappi'
import type { RestaurantProfile } from '@/lib/db/mongodb/types'
import type { Establecimiento } from '@/types/domain'
import { cn } from '@/lib/utils'

export type EstablishmentHeroProfile = Pick<
  RestaurantProfile,
  'descripcionComercial' | 'horarios' | 'zonasEntrega' | 'mediosPago'
>

interface EstablishmentHeroProps {
  establecimiento: Establecimiento
  profile: EstablishmentHeroProfile | null
  presentation: EstablishmentPresentation
}

function formatBadgeList(values: string[]) {
  return values
    .map((value) => value.charAt(0).toUpperCase() + value.slice(1))
    .join(' / ')
}

function HeroBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-primary-foreground/20 bg-black/20 px-3 py-1.5 text-sm text-primary-foreground/90',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function EstablishmentHero({
  establecimiento,
  profile,
  presentation,
}: EstablishmentHeroProps) {
  const horario = profile?.horarios?.[0]
  const zonasEntrega = profile?.zonasEntrega?.filter(Boolean) ?? []
  const mediosPago = profile?.mediosPago?.filter(Boolean) ?? []

  const hasMetaBadges =
    horario != null || zonasEntrega.length > 0 || mediosPago.length > 0

  return (
    <section className="w-full bg-card px-4 pb-10 pt-28 text-primary-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
            {establecimiento.tipo}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {establecimiento.nombre}
          </h1>
          <p className="text-sm text-primary-foreground/80">{establecimiento.direccion}</p>
          {profile?.descripcionComercial ? (
            <p className="max-w-xl pt-0.5 text-sm leading-6 text-primary-foreground/90">
              {profile.descripcionComercial}
            </p>
          ) : null}
        </div>

        {hasMetaBadges || presentation.rating != null || presentation.deliveryMinutes != null || presentation.deliveryFee != null ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-2 text-sm sm:max-w-md">
            {presentation.rating != null ? (
              <HeroBadge className="gap-1 font-medium">
                <HugeiconsIcon icon={StarIcon} className="size-4 text-amber-400" strokeWidth={2} />
                {presentation.rating.toFixed(1)}
              </HeroBadge>
            ) : null}
            {presentation.deliveryMinutes != null ? (
              <HeroBadge className="gap-1">
                <HugeiconsIcon icon={Clock01Icon} className="size-4 text-primary-foreground/70" strokeWidth={2} />
                {presentation.deliveryMinutes} min
              </HeroBadge>
            ) : null}
            {presentation.deliveryFee != null ? (
              <HeroBadge>Envío {formatArs(presentation.deliveryFee)}</HeroBadge>
            ) : null}
            {horario ? (
              <HeroBadge>
                {horario.dia}: {horario.abre} a {horario.cierra}
              </HeroBadge>
            ) : null}
            {zonasEntrega.length > 0 ? (
              <HeroBadge>{formatBadgeList(zonasEntrega)}</HeroBadge>
            ) : null}
            {mediosPago.length > 0 ? (
              <HeroBadge>{formatBadgeList(mediosPago)}</HeroBadge>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}
