import { AdminProductForm } from '@/components/features/admin/admin-product-form'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { postgres } from '@/lib/db'

export default async function AdminProductoNuevoPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La sesión de admin no tiene un establecimiento asociado." />
    )
  }

  const establecimiento = await postgres.queries.getEstablecimientoById(
    idEstablecimiento
  )

  if (establecimiento.error) return <ErrorState message={establecimiento.error} />

  const local = establecimiento.data
  if (!local) {
    return <ErrorState message="No se encontró el establecimiento asociado al admin." />
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Nuevo producto</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Alta de producto en el catálogo de {local.nombre}.
        </p>
      </div>

      <AdminProductForm mode="create" />
    </section>
  )
}
