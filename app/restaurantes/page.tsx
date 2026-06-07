import { EstablecimientoCard } from '@/components/features/restaurants/establecimiento-card'
import { RestaurantsHero } from '@/components/features/restaurants/restaurants-hero'
import Navbar from '@/components/navbar'
import { postgres } from '@/lib/db'
import { Suspense } from 'react'

async function RestaurantesList() {
  const establecimientos = await postgres.queries.getEstablecimientos()
  if (establecimientos.error) {
    return <div>Error al obtener los establecimientos</div>
  }

  if (establecimientos.data?.length === 0) {
    return <div>No hay establecimientos</div>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {establecimientos.data?.map((establecimiento) => (
          <EstablecimientoCard
            key={establecimiento.idEstablecimiento}
            establecimiento={establecimiento}
          />
        ))}
    </div>
  )
}

export default async function RestaurantesPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <RestaurantsHero />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-normal sm:text-xl">Locales con menú</h2>
          {/* Suspense para que se cargue el listado de establecimientos de manera asíncrona */}
          <Suspense fallback={<div>Cargando locales...</div>}>
            <RestaurantesList />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
