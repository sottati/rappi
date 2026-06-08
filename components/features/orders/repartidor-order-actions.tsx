"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  claimPedidoAction,
  updateRepartidorPedidoEstadoAction,
  type OrderActionState,
} from "@/lib/orders/actions"
import { EstadoPedido } from "@/types/domain"

const initialState: OrderActionState = {}

export function ClaimPedidoButton({ idPedido }: { idPedido: number }) {
  const [state, formAction, pending] = useActionState(
    claimPedidoAction,
    initialState
  )

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="idPedido" value={idPedido} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Tomando..." : "Tomar pedido"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="text-sm text-emerald-600 dark:text-emerald-400"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  )
}

function nextEstado(estado: EstadoPedido): EstadoPedido | null {
  if (
    estado === EstadoPedido.Confirmado ||
    estado === EstadoPedido.Preparando
  ) {
    return EstadoPedido.EnCamino
  }

  if (estado === EstadoPedido.EnCamino) return EstadoPedido.Entregado

  return null
}

function labelForEstado(estado: EstadoPedido) {
  return estado === EstadoPedido.EnCamino
    ? "Marcar en camino"
    : "Marcar entregado"
}

export function RepartidorPedidoStatusAction({
  idPedido,
  estado,
}: {
  idPedido: number
  estado: EstadoPedido
}) {
  const [state, formAction, pending] = useActionState(
    updateRepartidorPedidoEstadoAction,
    initialState
  )
  const target = nextEstado(estado)

  if (!target) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay acciones disponibles para el estado actual.
      </p>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="idPedido" value={idPedido} />
      <input type="hidden" name="estado" value={target} />
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : labelForEstado(target)}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          className="text-sm text-emerald-600 dark:text-emerald-400"
          role="status"
        >
          {state.success}
        </p>
      ) : null}
    </form>
  )
}
