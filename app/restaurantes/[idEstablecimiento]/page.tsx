import { notFound } from 'next/navigation'

import { EstablishmentCatalog } from '@/components/features/restaurants/establishment-catalog'
import { EstablishmentHero } from '@/components/features/restaurants/establishment-hero'
import Navbar from '@/components/navbar'
import { catalogRestaurants, getMockEstablishmentCatalog } from '@/lib/rappi'

interface EstablecimientoPageProps {
  params: Promise<{ idEstablecimiento: string }>
}

export default async function EstablecimientoPage({ params }: EstablecimientoPageProps) {
  const { idEstablecimiento: rawId } = await params
  const idEstablecimiento = Number.parseInt(rawId, 10)

  if (Number.isNaN(idEstablecimiento)) notFound()

  const catalog = getMockEstablishmentCatalog(idEstablecimiento)
  if (!catalog) notFound()

  const presentation = catalogRestaurants.find(
    (restaurant) => restaurant.idEstablecimiento === idEstablecimiento,
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <EstablishmentHero
        establecimiento={catalog.establecimiento}
        presentation={{
          coverSrc: presentation?.coverSrc ?? '',
          logoSrc: presentation?.logoSrc ?? '',
          deliveryMinutes: presentation?.deliveryMinutes ?? 35,
          deliveryFee: presentation?.deliveryFee ?? 1490,
          rating: presentation?.rating ?? 4.5,
        }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <EstablishmentCatalog
          idEstablecimiento={idEstablecimiento}
          productos={catalog.productos}
        />
      </div>
    </main>
  )
}
