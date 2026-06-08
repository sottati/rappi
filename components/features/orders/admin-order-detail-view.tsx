"use client"

import { useActionState } from "react"

import {
  OrderDetailView,
  type OrderDetailPedido,
} from "@/components/features/orders/order-detail-view"
import { OrderStatusBadge } from "@/components/features/orders/order-status-badge"
import { Button } from "@/components/ui/button"
import {
  updateAdminPedidoEstadoAction,
  type OrderActionState,
} from "@/lib/orders/actions"
import { EstadoPedido } from "@/types/domain"

const initialState: OrderActionState = {}

interface AdminOrderDetailViewProps {
  pedido: OrderDetailPedido
}

function getAdminActions(estado: EstadoPedido) {
  if (estado === EstadoPedido.Pendiente) {
    return [
      { estado: EstadoPedido.Confirmado, label: "Confirmar pedido" },
      { estado: EstadoPedido.Cancelado, label: "Rechazar pedido" },
    ]
  }

  if (estado === EstadoPedido.Confirmado) {
    return [{ estado: EstadoPedido.Preparando, label: "Marcar preparando" }]
  }

  return []
}

export function AdminOrderDetailView({ pedido }: AdminOrderDetailViewProps) {
  const [state, formAction, pending] = useActionState(
    updateAdminPedidoEstadoAction,
    initialState
  )
  const actions = getAdminActions(pedido.estado)

  return (
    <div className="space-y-6">
      <OrderDetailView
        pedido={pedido}
        backHref="/admin/pedidos"
        backLabel="Volver a pedidos"
      />

      <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="mb-1 text-sm font-semibold">Acciones operativas</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          El comercio confirma o rechaza pedidos pendientes. Los pedidos
          confirmados quedan disponibles para repartidores.
        </p>

        {actions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay acciones disponibles para el estado actual.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <form key={action.estado} action={formAction}>
                <input type="hidden" name="idPedido" value={pedido.idPedido} />
                <input type="hidden" name="estado" value={action.estado} />
                <Button
                  type="submit"
                  variant={
                    action.estado === EstadoPedido.Cancelado
                      ? "outline"
                      : "default"
                  }
                  disabled={pending}
                >
                  {pending ? "Guardando..." : action.label}
                </Button>
              </form>
            ))}
          </div>
        )}

        {state.error ? (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <div
            className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
            role="status"
          >
            <span>{state.success}</span>
            <OrderStatusBadge estado={pedido.estado} />
          </div>
        ) : null}
      </section>
    </div>
  )
}
