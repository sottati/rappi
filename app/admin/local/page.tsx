import Link from 'next/link'

import {
  AdminEstablecimientoForm,
  AdminPerfilComercialForm,
} from '@/components/features/admin/admin-local-forms'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { mongodb, postgres } from '@/lib/db'

export default async function AdminLocalPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return (
      <ErrorState message="La cuenta admin no tiene un establecimiento asociado." />
    )
  }

  const [establecimiento, profile] = await Promise.all([
    postgres.queries.getEstablecimientoById(idEstablecimiento),
    mongodb.queries.getRestaurantProfile(idEstablecimiento),
  ])

  if (establecimiento.error) return <ErrorState message={establecimiento.error} />
  if (profile.error) return <ErrorState message={profile.error} />

  const local = establecimiento.data
  if (!local) {
    return <ErrorState message="No se encontró el establecimiento asociado al admin." />
  }

  const horario = profile.data?.horarios?.[0]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mi establecimiento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestioná los datos operativos y el perfil comercial de {local.nombre}.
          </p>
        </div>
        <Link
          href={`/restaurantes/${idEstablecimiento}`}
          className="inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors hover:bg-muted"
        >
          Ver catálogo público
        </Link>
      </div>

      <AdminEstablecimientoForm establecimiento={local} />

      <AdminPerfilComercialForm
        descripcionComercial={profile.data?.descripcionComercial ?? ''}
        horarioDia={horario?.dia ?? ''}
        horarioAbre={horario?.abre ?? ''}
        horarioCierra={horario?.cierra ?? ''}
        zonasEntrega={profile.data?.zonasEntrega ?? []}
        mediosPago={profile.data?.mediosPago ?? []}
      />
    </section>
  )
}
