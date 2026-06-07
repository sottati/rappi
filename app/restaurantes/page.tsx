import { EstablecimientoCard } from '@/components/features/restaurants/establecimiento-card'
import { RestaurantsHero } from '@/components/features/restaurants/restaurants-hero'
import Navbar from '@/components/navbar'
import { getEstablecimientos } from '@/lib/db/postgres/queries'

export default async function RestaurantesPage() {
  const establecimientos = await getEstablecimientos()
  if (establecimientos.error) {
    return <div>Error al obtener los establecimientos</div>
  }

  if (establecimientos.data?.length === 0) {
    return <div>No hay establecimientos</div>
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <RestaurantsHero />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-normal sm:text-xl">Locales con menú</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {establecimientos.data?.map((establecimiento) => (
              <EstablecimientoCard
                key={establecimiento.idEstablecimiento}
                establecimiento={establecimiento}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
