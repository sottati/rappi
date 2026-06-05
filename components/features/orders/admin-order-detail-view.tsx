'use client'

import { useState } from 'react'

import { OrderDetailView } from '@/components/features/orders/order-detail-view'
import { OrderStatusBadge } from '@/components/features/orders/order-status-badge'
import { Button } from '@/components/ui/button'
import { EstadoPedido } from '@/types/domain'
import { estadoPedidoLabels, type MockPedidoVista } from '@/lib/rappi'

const estadosOperativos = [
  EstadoPedido.Confirmado,
  EstadoPedido.Preparando,
  EstadoPedido.EnCamino,
  EstadoPedido.Entregado,
  EstadoPedido.Cancelado,
] as const

interface AdminOrderDetailViewProps {
  pedido: MockPedidoVista
}

export function AdminOrderDetailView({ pedido: initialPedido }: AdminOrderDetailViewProps) {
  const [pedido, setPedido] = useState(initialPedido)
  const [selectedEstado, setSelectedEstado] = useState(pedido.estado)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setPedido((current) => ({ ...current, estado: selectedEstado }))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

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
          Mock local: el cambio de estado no persiste al recargar.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label htmlFor="estado-pedido" className="text-sm text-muted-foreground">
              Cambiar estado
            </label>
            <select
              id="estado-pedido"
              value={selectedEstado}
              onChange={(event) => setSelectedEstado(event.target.value as EstadoPedido)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {estadosOperativos.map((estado) => (
                <option key={estado} value={estado}>
                  {estadoPedidoLabels[estado]}
                </option>
              ))}
            </select>
          </div>

          <Button type="button" onClick={handleSave}>
            Guardar estado
          </Button>
        </div>

        {saved ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <span>Estado actualizado a</span>
            <OrderStatusBadge estado={selectedEstado} />
          </div>
        ) : null}
      </section>
    </div>
  )
}
