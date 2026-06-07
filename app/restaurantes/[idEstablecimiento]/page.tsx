import { notFound } from 'next/navigation'

import { EstablishmentCatalog } from '@/components/features/restaurants/establishment-catalog'
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

  const productosResult = await postgres.queries.getProductosByEstablecimiento(idEstablecimiento)
  if (productosResult.error) {
    return <div>Error al obtener los productos</div>
  }

  if (!establecimiento.data) notFound()

  const productos = productosResult.data

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
        // presentation={{
        //   coverSrc: establecimiento.data.coverSrc ?? '',
        //   logoSrc: establecimiento.data.logoSrc ?? '',
        //   deliveryMinutes: establecimiento.data.deliveryMinutes ?? 35,
        //   deliveryFee: establecimiento.data.deliveryFee ?? 1490,
        //   rating: establecimiento.data.rating ?? 4.5,
        // }}
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <EstablishmentCatalog
          idEstablecimiento={idEstablecimiento}
          restaurantName={establecimiento.data.nombre}
          // restaurantLogoSrc={presentation?.logoSrc}
          // deliveryMinutes={presentation?.deliveryMinutes ?? 35}
          // deliveryFee={presentation?.deliveryFee ?? 1490}
          productos={productos ?? []}
        />
      </div>
    </main>
  )
}
