import Link from 'next/link'

import type { Establecimiento } from '@/types/domain'
import { cn } from '@/lib/utils'

interface EstablecimientoCardProps {
  establecimiento: Establecimiento
  className?: string
}

export function EstablecimientoCard({ establecimiento, className }: EstablecimientoCardProps) {
  const href = `/restaurantes/${establecimiento.idEstablecimiento}`

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-colors hover:border-primary/30 hover:shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        className
      )}
      aria-label={`${establecimiento.nombre}, ${establecimiento.tipo}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-primary/10">
        <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Ver menú
        </span>
        <div className="flex size-full items-center justify-center px-4 text-center text-sm font-medium text-primary">
          {establecimiento.nombre}
        </div>
      </div>

      <div className="flex items-start gap-2.5 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/60">
          <span className="text-[10px] font-semibold text-muted-foreground">
            {establecimiento.nombre.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-sm font-semibold leading-tight">{establecimiento.nombre}</h3>
          <p className="truncate text-xs text-muted-foreground capitalize">
            {establecimiento.tipo}
            <span className="mx-1.5 text-border">·</span>
            {establecimiento.direccion}
          </p>
        </div>
      </div>
    </Link>
  )
}
