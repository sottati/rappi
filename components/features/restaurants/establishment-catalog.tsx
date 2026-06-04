'use client'

import { EmptyState } from '@/components/shared/query-state'
import type { Producto } from '@/types/domain'

import { ProductCard } from './product-card'

interface EstablishmentCatalogProps {
  idEstablecimiento: number
  productos: Producto[]
}

export function EstablishmentCatalog({ idEstablecimiento, productos }: EstablishmentCatalogProps) {
  if (productos.length === 0) {
    return (
      <EmptyState title="Este local todavía no publicó su menú." />
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold sm:text-xl">Menú</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {productos.length} {productos.length === 1 ? 'producto' : 'productos'} disponibles
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {productos.map((producto) => (
          <ProductCard
            key={producto.idProducto}
            idEstablecimiento={idEstablecimiento}
            producto={producto}
          />
        ))}
      </div>
    </section>
  )
}
