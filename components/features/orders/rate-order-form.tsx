"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { calificarPedidoAction } from "@/lib/ratings/actions"
import type { OrderActionState } from "@/lib/orders/actions"

const initialState: OrderActionState = {}

const PUNTAJES = [1, 2, 3, 4, 5]

interface RateOrderFormProps {
  idPedido: number
  hasRepartidor: boolean
}

export function RateOrderForm({ idPedido, hasRepartidor }: RateOrderFormProps) {
  const [state, formAction, pending] = useActionState(
    calificarPedidoAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="idPedido" value={idPedido} readOnly />

      <div className="space-y-2">
        <label htmlFor="puntajeLocal" className="text-sm font-medium">
          Calificá el local
        </label>
        <select
          id="puntajeLocal"
          name="puntajeLocal"
          defaultValue="5"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {PUNTAJES.map((valor) => (
            <option key={valor} value={valor}>
              {valor} {valor === 1 ? "estrella" : "estrellas"}
            </option>
          ))}
        </select>
      </div>

      {hasRepartidor ? (
        <div className="space-y-2">
          <label htmlFor="puntajeRepartidor" className="text-sm font-medium">
            Calificá al repartidor
          </label>
          <select
            id="puntajeRepartidor"
            name="puntajeRepartidor"
            defaultValue="5"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {PUNTAJES.map((valor) => (
              <option key={valor} value={valor}>
                {valor} {valor === 1 ? "estrella" : "estrellas"}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="puntajeRepartidor" value="5" readOnly />
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviar calificación"}
      </Button>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  )
}
