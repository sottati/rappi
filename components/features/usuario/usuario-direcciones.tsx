import { UsuarioDireccionesView } from '@/components/features/usuario/usuario-direcciones-view'
import { ErrorState } from '@/components/shared/query-state'
import { Skeleton } from '@/components/ui/skeleton'
import { postgres } from '@/lib/db'

interface UsuarioDireccionesProps {
  idCliente: number
}

export function UsuarioDireccionesSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-label="Cargando direcciones"
      aria-busy="true"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export async function UsuarioDirecciones({ idCliente }: UsuarioDireccionesProps) {
  const direcciones = await postgres.queries.getDireccionesByCliente(idCliente)

  if (direcciones.error) {
    return <ErrorState message={direcciones.error} />
  }

  return <UsuarioDireccionesView direcciones={direcciones.data ?? []} />
}
