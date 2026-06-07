import { OrderConfirmationView } from '@/components/features/cart/order-confirmation-view'
import Navbar from '@/components/navbar'

export default function CarritoConfirmacionPage() {
  return (
    <main className="min-h-svh bg-background pb-36 text-foreground">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 pb-8 sm:px-6 lg:px-8">
        <OrderConfirmationView />
      </div>
    </main>
  )
}
