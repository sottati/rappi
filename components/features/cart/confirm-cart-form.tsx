'use client'

import { useActionState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { confirmCartAction, type ConfirmCartState } from '@/lib/cart/actions'
import { useCartStore } from '@/lib/cart/store'

const initialState: ConfirmCartState = {}

export function ConfirmCartForm() {
  const items = useCartStore((state) => state.items)
  const restaurantId = useCartStore((state) => state.restaurantId)
  const [state, formAction, pending] = useActionState(
    confirmCartAction,
    initialState
  )

  const cartPayload = useMemo(
    () =>
      JSON.stringify({
        restaurantId,
        items: items.map((item) => ({
          idProducto: item.idProducto,
          idEstablecimiento: item.idEstablecimiento,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      }),
    [items, restaurantId]
  )

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="cartPayload" value={cartPayload} readOnly />
      <Button className="w-full" size="lg" type="submit" disabled={pending}>
        {pending ? 'Confirmando…' : 'Confirmar pedido'}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
