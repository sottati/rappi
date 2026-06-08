import { notFound, redirect } from 'next/navigation'

import { ClearCartOnMount } from '@/components/features/cart/clear-cart-on-mount'
import { OrderConfirmationView } from '@/components/features/cart/order-confirmation-view'
import Navbar from '@/components/navbar'
import { ErrorState } from '@/components/shared/query-state'
import { sanitizeNextPath } from '@/lib/auth/next-path'
import { getSession } from '@/lib/auth/session'
import { getRoleHomePath } from '@/lib/auth/session-types'
import { postgres } from '@/lib/db'

interface CarritoConfirmacionPageProps {
  searchParams: Promise<{ idPedido?: string }>
}

function formatDireccion(direccion: {
  calle: string
  numero: string
  ciudad: string
  codigoPostal: string
}) {
  return `${direccion.calle} ${direccion.numero}, ${direccion.ciudad} (${direccion.codigoPostal})`
}

export default async function CarritoConfirmacionPage({
  searchParams,
}: CarritoConfirmacionPageProps) {
  const session = await getSession()
  const { idPedido: rawId } = await searchParams
  const idPedido = Number.parseInt(rawId ?? '', 10)

  if (!session) {
    const next = sanitizeNextPath(
      Number.isNaN(idPedido)
        ? '/carrito'
        : `/carrito/confirmacion?idPedido=${idPedido}`
    )
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login')
  }

  if (session.role !== 'usuario') {
    redirect(getRoleHomePath(session.role))
  }

  if (Number.isNaN(idPedido)) notFound()

  const pedidoResult = await postgres.queries.getPedidoById(idPedido)
  if (pedidoResult.error) return <ErrorState message={pedidoResult.error} />

  const pedido = pedidoResult.data
  if (!pedido || pedido.idCliente !== session.userId) notFound()

  const [establecimientoResult, direccionesResult] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.idEstablecimiento),
    postgres.queries.getDireccionesByCliente(session.userId),
  ])

  if (establecimientoResult.error)
    return <ErrorState message={establecimientoResult.error} />
  if (direccionesResult.error)
    return <ErrorState message={direccionesResult.error} />

  const direccion =
    direccionesResult.data?.find(
      (item) => item.idDireccion === pedido.idDireccion
    ) ?? direccionesResult.data?.[0]

  return (
    <main className="min-h-svh bg-background pb-36 text-foreground">
      <ClearCartOnMount />
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-8 sm:px-6 lg:px-8">
        <OrderConfirmationView
          pedido={pedido}
          restaurantName={
            establecimientoResult.data?.nombre ??
            `Local #${pedido.idEstablecimiento}`
          }
          addressDetail={
            direccion ? formatDireccion(direccion) : 'Dirección no disponible'
          }
        />
      </div>
    </main>
  )
}
