import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { EstablishmentCatalog } from '@/components/features/restaurants/establishment-catalog'
import { EstablishmentCatalogSkeleton } from '@/components/features/restaurants/establishment-catalog-skeleton'
import { EstablishmentHero } from '@/components/features/restaurants/establishment-hero'
import Navbar from '@/components/navbar'
import { postgres } from '@/lib/db'

interface EstablecimientoPageProps {
  params: Promise<{ idEstablecimiento: string }>
}

export default async function EstablecimientoPage({
  params,
}: EstablecimientoPageProps) {
  const { idEstablecimiento: rawId } = await params
  const idEstablecimiento = Number.parseInt(rawId, 10)

  if (Number.isNaN(idEstablecimiento)) notFound()

  const establecimiento = await postgres.queries.getEstablecimientoById(idEstablecimiento)
  if (establecimiento.error) {
    return <div>Error al obtener el establecimiento</div>
  }

  if (!establecimiento.data) notFound()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <EstablishmentHero
        establecimiento={establecimiento.data}
        presentation={{
          coverSrc: '',
          logoSrc: '',
          deliveryMinutes: 35,
          deliveryFee: 1490,
          rating: 4.5,
        }}
      />
      <Suspense fallback={<EstablishmentCatalogSkeleton />}>
        <EstablishmentCatalog
          idEstablecimiento={idEstablecimiento}
          restaurantName={establecimiento.data.nombre}
        />
      </Suspense>
    </main>
  )
}
