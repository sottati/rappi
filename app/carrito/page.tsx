import { CartHero } from '@/components/features/cart/cart-hero'
import { CartView } from '@/components/features/cart/cart-view'
import Navbar from '@/components/navbar'
import { getSession } from '@/lib/auth/session'
import { postgres } from '@/lib/db'

export default async function CarritoPage() {
  const session = await getSession()
  const direcciones =
    session?.role === 'usuario'
      ? await postgres.queries.getDireccionesByCliente(session.userId)
      : null

  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <CartHero />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <CartView
          session={session}
          direcciones={
            direcciones && !direcciones.error ? (direcciones.data ?? []) : []
          }
        />
      </div>
    </main>
  )
}
