import { notFound } from 'next/navigation'

import { ProductDetailView } from '@/components/features/restaurants/product-detail-view'
import Navbar from '@/components/navbar'
import { getMockProductoDetalle } from '@/lib/rappi'

interface ProductoPageProps {
  params: Promise<{ idEstablecimiento: string; idProducto: string }>
}

export default async function ProductoPage({ params }: ProductoPageProps) {
  const { idEstablecimiento: rawEstablecimiento, idProducto: rawProducto } = await params
  const idEstablecimiento = Number.parseInt(rawEstablecimiento, 10)
  const idProducto = Number.parseInt(rawProducto, 10)

  if (Number.isNaN(idEstablecimiento) || Number.isNaN(idProducto)) notFound()

  const detalle = getMockProductoDetalle(idEstablecimiento, idProducto)
  if (!detalle) notFound()

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
        <ProductDetailView detalle={detalle} />
      </div>
    </main>
  )
}
