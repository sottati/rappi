import Link from 'next/link'

import { flattenCatalogProducts } from '@/lib/admin/catalog-helpers'
import { AdminProductList } from '@/components/features/admin/admin-product-list'
import { EmptyState, ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { mongodb, postgres } from '@/lib/db'

export default async function AdminProductosPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La sesión de admin no tiene un establecimiento asociado." />
    )
  }

  const [establecimiento, catalog] = await Promise.all([
    postgres.queries.getEstablecimientoById(idEstablecimiento),
    mongodb.queries.getRestaurantCatalog(idEstablecimiento),
  ])

  if (establecimiento.error) return <ErrorState message={establecimiento.error} />
  if (catalog.error) return <ErrorState message={catalog.error} />

  const local = establecimiento.data
  if (!local) {
    return <ErrorState message="No se encontró el establecimiento asociado al admin." />
  }

  const items = catalog.data ? flattenCatalogProducts(catalog.data) : []

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Catálogo de productos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Productos de {local.nombre} en MongoDB (`restaurant_catalogs`). Los
            cambios se reflejan en el catálogo público.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Nuevo producto
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No hay productos cargados para este establecimiento." />
      ) : (
        <AdminProductList items={items} />
      )}
    </section>
  )
}
