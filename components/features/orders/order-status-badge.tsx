import { EstadoPedido } from '@/types/domain'
import { cn } from '@/lib/utils'

import { estadoPedidoLabels } from '@/lib/rappi'

const estadoStyles: Record<EstadoPedido, string> = {
  [EstadoPedido.Pendiente]: 'bg-muted text-muted-foreground',
  [EstadoPedido.Confirmado]: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  [EstadoPedido.Preparando]: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  [EstadoPedido.EnCamino]: 'bg-primary/10 text-primary',
  [EstadoPedido.Entregado]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  [EstadoPedido.Cancelado]: 'bg-destructive/10 text-destructive',
}

interface OrderStatusBadgeProps {
  estado: EstadoPedido
  className?: string
}

export function OrderStatusBadge({ estado, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        estadoStyles[estado],
        className,
      )}
    >
      {estadoPedidoLabels[estado]}
    </span>
  )
}
