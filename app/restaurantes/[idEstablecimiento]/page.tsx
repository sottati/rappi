import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EstablishmentCatalog } from '@/components/features/restaurants/establishment-catalog'
import { EstablishmentCatalogSkeleton } from '@/components/features/restaurants/establishment-catalog-skeleton'
import { EstablishmentHero } from '@/components/features/restaurants/establishment-hero'
import Navbar from '@/components/navbar'
import { ErrorState } from '@/components/shared/query-state'
import { mongodb, postgres } from '@/lib/db'

interface EstablecimientoPageProps {
  params: Promise<{ idEstablecimiento: string }>
}

interface EstablishmentCatalogSectionProps {
  idEstablecimiento: number
  restaurantName: string
}

async function EstablishmentCatalogSection({
  idEstablecimiento,
  restaurantName,
}: EstablishmentCatalogSectionProps) {
  const catalogResult =
    await mongodb.queries.getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorState message={catalogResult.error} />
      </div>
    )
  }

  return (
    <EstablishmentCatalog
      catalog={catalogResult.data}
      idEstablecimiento={idEstablecimiento}
      restaurantName={restaurantName}
    />
  )
}

export default async function EstablecimientoPage({
  params,
}: EstablecimientoPageProps) {
  const { idEstablecimiento: rawId } = await params
  const idEstablecimiento = Number.parseInt(rawId, 10)

  if (Number.isNaN(idEstablecimiento)) notFound()

  const establecimientoResult =
    await postgres.queries.getEstablecimientoById(idEstablecimiento)

  if (establecimientoResult.error) {
    return <ErrorState message={establecimientoResult.error} />
  }

  if (!establecimientoResult.data) notFound()

  const establecimiento = establecimientoResult.data

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <EstablishmentHero
        establecimiento={establecimiento}
        presentation={{
          coverSrc: '',
          logoSrc: '',
          deliveryMinutes: 35,
          deliveryFee: 1490,
          rating: 4.5,
        }}
      />
      <Suspense fallback={<EstablishmentCatalogSkeleton />}>
        <EstablishmentCatalogSection
          idEstablecimiento={idEstablecimiento}
          restaurantName={establecimiento.nombre}
        />
      </Suspense>
    </main>
  )
}
