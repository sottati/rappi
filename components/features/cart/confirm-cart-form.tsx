'use client'

import { useActionState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { confirmCartAction, type ConfirmCartState } from '@/lib/cart/actions'
import { useCartStore } from '@/lib/cart/store'

const initialState: ConfirmCartState = {}

interface ConfirmCartFormProps {
  canConfirm?: boolean
}

export function ConfirmCartForm({ canConfirm = true }: ConfirmCartFormProps) {
  const items = useCartStore((state) => state.items)
  const restaurantId = useCartStore((state) => state.restaurantId)
  const selectedDireccionId = useCartStore((state) => state.selectedDireccionId)
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

  const isSubmitDisabled =
    pending || !canConfirm || selectedDireccionId == null

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="cartPayload" value={cartPayload} readOnly />
      <input
        type="hidden"
        name="idDireccion"
        value={selectedDireccionId ?? ''}
        readOnly
      />
      <Button
        className="w-full"
        size="lg"
        type="submit"
        disabled={isSubmitDisabled}
      >
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
