import { notFound } from 'next/navigation'

import { AdminProductForm } from '@/components/features/admin/admin-product-form'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { mongodb } from '@/lib/db'

interface AdminProductoPageProps {
  params: Promise<{ idProducto: string }>
}

export default async function AdminProductoPage({ params }: AdminProductoPageProps) {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La sesión de admin no tiene un establecimiento asociado." />
    )
  }

  const { idProducto: rawId } = await params
  const idProducto = Number.parseInt(rawId, 10)

  if (Number.isNaN(idProducto)) notFound()

  const lookup = await mongodb.queries.getRestaurantCatalogProduct(
    idEstablecimiento,
    idProducto
  )

  if (lookup.error) return <ErrorState message={lookup.error} />
  if (!lookup.data) notFound()

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Editar producto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {lookup.data.producto.nombre} · {lookup.data.categoria.nombre}
        </p>
      </div>

      <AdminProductForm
        mode="edit"
        producto={lookup.data.producto}
        categoriaNombre={lookup.data.categoria.nombre}
      />
    </section>
  )
}
