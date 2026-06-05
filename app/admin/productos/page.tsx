import { AdminProductList } from '@/components/features/admin/admin-product-list'
import { EmptyState, ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { postgres } from '@/lib/db'

export default async function AdminProductosPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento ?? session.userId

  if (idEstablecimiento == null) {
    return <ErrorState message="La sesion de admin no tiene un establecimiento asociado." />
  }

  const [establecimiento, productos] = await Promise.all([
    postgres.queries.getEstablecimientoById(idEstablecimiento),
    postgres.queries.getProductosByEstablecimiento(idEstablecimiento),
  ])

  if (establecimiento.error) return <ErrorState message={establecimiento.error} />
  if (productos.error) return <ErrorState message={productos.error} />

  const local = establecimiento.data
  const catalogo = productos.data ?? []

  if (!local) {
    return <ErrorState message="No se encontro el establecimiento asociado al admin." />
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Catalogo de productos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Productos de {local.nombre}. Luego se filtraran por Supabase Auth.
        </p>
      </div>

      {catalogo.length === 0 ? (
        <EmptyState title="No hay productos cargados para este establecimiento." />
      ) : (
        <AdminProductList productos={catalogo} />
      )}
    </section>
  )
}
