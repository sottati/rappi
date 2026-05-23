import Link from 'next/link'

import { EmptyState, ErrorState } from '@/components/shared/query-state'
import { postgres } from '@/lib/db'

export default async function AdminEstablecimientosPage() {
  const result = await postgres.queries.getEstablecimientos()

  if (result.error) return <ErrorState message={result.error} />
  const establecimientos = result.data ?? []
  if (establecimientos.length === 0) return <EmptyState title="No hay establecimientos." />

  return (
    <section className="grid gap-4">
      <div>
        <h2 className="text-xl font-semibold">Establecimientos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Locales asociados al admin actual. Luego se filtraran por Supabase Auth.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {establecimientos.map((establecimiento) => (
          <Link
            key={establecimiento.idEstablecimiento}
            href={`/admin/establecimientos/${establecimiento.idEstablecimiento}`}
            className="rounded-md border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{establecimiento.nombre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {establecimiento.direccion}
                </p>
              </div>
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {establecimiento.tipo}
              </span>
            </div>
            <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
              <span>{establecimiento.email}</span>
              <span>{establecimiento.telefono}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
