import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { postgres, redis } from '@/lib/db'

export default async function RepartidorDisponibilidadPage() {
  const session = await requireSession('repartidor')
  const [repartidor, location] = await Promise.all([
    postgres.queries.getRepartidorById(session.userId),
    redis.queries.getDeliveryLocation(`del_00${session.userId}`),
  ])

  if (repartidor.error) return <ErrorState message={repartidor.error} />
  if (location.error) return <ErrorState message={location.error} />

  return (
    <section className="rounded-md border bg-card p-5">
      <h2 className="text-xl font-semibold">Disponibilidad</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Esta pantalla queda preparada para una Server Action que actualice Redis
        y persista estado si hace falta.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Estado actual</p>
          <p className="mt-2 text-2xl font-semibold">
            {repartidor.data?.disponible ? 'Disponible' : 'No disponible'}
          </p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Coordenada actual</p>
          <p className="mt-2 text-2xl font-semibold">
            {location.data
              ? `${location.data.latitude}, ${location.data.longitude}`
              : 'Sin ubicacion'}
          </p>
        </div>
      </div>
    </section>
  )
}
