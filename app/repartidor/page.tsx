import { ErrorState } from '@/components/shared/query-state'
import { StatCard } from '@/components/shared/stat-card'
import { getMockSession } from '@/lib/auth/mock-session'
import { postgres, redis } from '@/lib/db'

export default async function RepartidorPage() {
  const session = await getMockSession('repartidor')
  const [repartidores, pedidos, location] = await Promise.all([
    postgres.queries.getRepartidoresDisponibles(),
    postgres.queries.getPedidosByRepartidor(session.userId),
    redis.queries.getDeliveryLocation(`del_00${session.userId}`),
  ])

  if (repartidores.error) return <ErrorState message={repartidores.error} />
  if (pedidos.error) return <ErrorState message={pedidos.error} />
  if (location.error) return <ErrorState message={location.error} />

  const repartidoresData = repartidores.data ?? []
  const pedidosData = pedidos.data ?? []
  const repartidor = repartidoresData.find(
    (item) => item.idRepartidor === session.userId,
  )

  return (
    <section className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Disponibilidad"
          value={repartidor?.disponible ? 'Activo' : 'Inactivo'}
          detail="Estado mock desde Postgres"
        />
        <StatCard label="Pedidos asignados" value={pedidosData.length} />
        <StatCard
          label="Ubicacion Redis"
          value={location.data ? 'Sincronizada' : 'Sin datos'}
          detail={
            location.data
              ? `${location.data.latitude}, ${location.data.longitude}`
              : undefined
          }
        />
      </div>

      <div className="rounded-md border bg-card p-4">
        <h2 className="font-semibold">Perfil operativo</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Nombre</dt>
            <dd className="font-medium">{session.displayName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{session.email}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
