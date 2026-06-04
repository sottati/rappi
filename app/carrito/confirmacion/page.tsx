import { OrderConfirmationView } from '@/components/features/cart/order-confirmation-view'
import Navbar from '@/components/navbar'
import { mockCart } from '@/lib/rappi'

export default function CarritoConfirmacionPage() {
  return (
    <main className="min-h-svh bg-background pb-36 text-foreground">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
        <OrderConfirmationView cart={mockCart} />
      </div>
    </main>
  )
}
