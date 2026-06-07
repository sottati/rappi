import { notFound } from 'next/navigation'

import { ProductDetailView } from '@/components/features/restaurants/product-detail-view'
import Navbar from '@/components/navbar'
import { ErrorState } from '@/components/shared/query-state'
import { mongodb, postgres } from '@/lib/db'

interface ProductoPageProps {
  params: Promise<{ idEstablecimiento: string; idProducto: string }>
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { idEstablecimiento: rawEstablecimiento, idProducto: rawProducto } = await params
  const idEstablecimiento = Number.parseInt(rawEstablecimiento, 10)
  const idProducto = Number.parseInt(rawProducto, 10)

  if (Number.isNaN(idEstablecimiento) || Number.isNaN(idProducto)) notFound()

  // Las consultas son independientes: Postgres valida el local y Mongo trae el producto del catalogo.
  const [establecimientoResult, productoResult] = await Promise.all([
    postgres.queries.getEstablecimientoById(idEstablecimiento),
    mongodb.queries.getRestaurantCatalogProduct(idEstablecimiento, idProducto),
  ])

  if (establecimientoResult.error) {
    return <ErrorState message={establecimientoResult.error} />
  }

  if (productoResult.error) {
    return <ErrorState message={productoResult.error} />
  }

  if (!establecimientoResult.data || !productoResult.data) notFound()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <ProductDetailView
          establecimiento={establecimientoResult.data}
          producto={{
            ...productoResult.data.producto,
            idEstablecimiento,
          }}
          categoriaNombre={productoResult.data.categoria.nombre}
        />
      </div>
    </main>
  )
}
