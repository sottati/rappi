import { EstablecimientoCard } from '@/components/features/restaurants/establecimiento-card'
import { RestaurantsHero } from '@/components/features/restaurants/restaurants-hero'
import Navbar from '@/components/navbar'
import { EmptyState, ErrorState } from '@/components/shared/query-state'
import { Skeleton } from '@/components/ui/skeleton'
import { postgres } from '@/lib/db'
import { Suspense } from 'react'

function RestaurantCardSkeleton() {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex items-start gap-2.5 p-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    </article>
  )
}

function RestaurantsListSkeleton() {
  return (
    <div
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Cargando locales"
      aria-busy="true"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <RestaurantCardSkeleton key={index} />
      ))}
    </div>
  )
}

async function RestaurantesList() {
  const establecimientosResult = await postgres.queries.getEstablecimientos()

  if (establecimientosResult.error) {
    return <ErrorState message={establecimientosResult.error} />
  }

  const establecimientos = establecimientosResult.data ?? []

  if (establecimientos.length === 0) {
    return <EmptyState title="No hay establecimientos publicados." />
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {establecimientos.map((establecimiento) => (
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
          <h2 className="text-lg font-semibold tracking-normal sm:text-xl">
            Locales con menú
          </h2>
          <Suspense fallback={<RestaurantsListSkeleton />}>
            <RestaurantesList />
          </Suspense>
        </section>
      </div>
    </main>
  )
}
