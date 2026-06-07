import { EmptyState } from '@/components/shared/query-state'
import type { RestaurantCatalog } from '@/lib/db/mongodb'

import { ProductCard } from './product-card'

interface EstablishmentCatalogProps {
  catalog: RestaurantCatalog | null
  idEstablecimiento: number
  restaurantName: string
  restaurantLogoSrc?: string
  deliveryMinutes?: number
  deliveryFee?: number
}

export function EstablishmentCatalog({
  catalog,
  idEstablecimiento,
  restaurantName,
  restaurantLogoSrc,
  deliveryMinutes,
  deliveryFee,
}: EstablishmentCatalogProps) {
  const categorias = [...(catalog?.categorias ?? [])]
    .sort((a, b) => a.orden - b.orden)
    .filter((categoria) => categoria.productos.length > 0)
  const totalProductos = categorias.reduce(
    (total, categoria) => total + categoria.productos.length,
    0
  )

  if (totalProductos === 0) {
    return <EmptyState title="Este local todavía no publicó su menú." />
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
      <div>
        <h2 className="text-lg font-semibold sm:text-xl">Menú</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalProductos} {totalProductos === 1 ? 'producto' : 'productos'}{' '}
          disponibles en el catálogo
        </p>
      </div>

      {categorias.map((categoria) => (
        <div key={categoria.nombre} className="space-y-3">
          <h3 className="text-base font-semibold">{categoria.nombre}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {categoria.productos.map((producto) => (
              <ProductCard
                key={producto.idProducto}
                idEstablecimiento={idEstablecimiento}
                restaurantName={restaurantName}
                restaurantLogoSrc={restaurantLogoSrc}
                deliveryMinutes={deliveryMinutes}
                deliveryFee={deliveryFee}
                producto={{ ...producto, idEstablecimiento }}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
