import Link from 'next/link'

import {
  AdminProductAvailabilityToggle,
} from '@/components/features/admin/admin-product-form'
import { formatArs } from '@/lib/rappi'
import { cn } from '@/lib/utils'
import type { RestaurantCatalogProduct } from '@/lib/db/mongodb/types'

function getPrecioFinal(producto: RestaurantCatalogProduct) {
  if (producto.promocionPorcentaje <= 0) return producto.precio
  return Math.round(producto.precio * (1 - producto.promocionPorcentaje / 100))
}

export interface AdminCatalogListItem {
  producto: RestaurantCatalogProduct
  categoriaNombre: string
}

interface AdminProductListProps {
  items: AdminCatalogListItem[]
}

export function AdminProductList({ items }: AdminProductListProps) {
  return (
    <div className="divide-y rounded-xl border border-border/80 bg-card">
      {items.map(({ producto, categoriaNombre }) => {
        const precioFinal = getPrecioFinal(producto)
        const tienePromo = producto.promocionPorcentaje > 0

        return (
          <article
            key={producto.idProducto}
            className={cn(
              'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between',
              !producto.disponible && 'opacity-70',
            )}
          >
            <div className="flex min-w-0 flex-1 gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/50">
                {producto.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={producto.foto}
                    alt=""
                    className="size-full object-contain p-1.5"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {producto.nombre.slice(0, 2)}
                  </span>
                )}
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{producto.nombre}</h3>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      producto.disponible
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                  {tienePromo ? (
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      -{producto.promocionPorcentaje}%
                    </span>
                  ) : null}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {producto.descripcion}
                </p>
                <p className="text-xs text-muted-foreground">
                  {categoriaNombre} · ID #{producto.idProducto}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
              <div className="flex flex-col items-start gap-0.5 sm:items-end">
                <p className="text-lg font-semibold">{formatArs(precioFinal)}</p>
                {tienePromo ? (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatArs(producto.precio)}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/productos/${producto.idProducto}`}
                  className="inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors hover:bg-muted"
                >
                  Editar
                </Link>
                <AdminProductAvailabilityToggle
                  idProducto={producto.idProducto}
                  disponible={producto.disponible}
                />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
