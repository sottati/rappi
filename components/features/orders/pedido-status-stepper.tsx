import { EstadoPedido } from '@/types/domain'
import { cn } from '@/lib/utils'

const STEPS = [
  { label: 'Confirmado' },
  { label: 'Preparando' },
  { label: 'En camino' },
  { label: 'Entregado' },
] as const

function getStepIndex(estado: EstadoPedido) {
  switch (estado) {
    case EstadoPedido.Pendiente:
    case EstadoPedido.Confirmado:
      return 0
    case EstadoPedido.Preparando:
      return 1
    case EstadoPedido.EnCamino:
      return 2
    case EstadoPedido.Entregado:
      return 3
    default:
      return -1
  }
}

function StepConnector({ active }: { active: boolean }) {
  return (
    <div className={cn('h-0.5 min-w-2 flex-1', active ? 'bg-primary' : 'bg-border')} aria-hidden />
  )
}

interface PedidoStatusStepperProps {
  estado: EstadoPedido
  className?: string
}

export function PedidoStatusStepper({ estado, className }: PedidoStatusStepperProps) {
  const currentIndex = getStepIndex(estado)
  const isCancelled = estado === EstadoPedido.Cancelado

  if (isCancelled) {
    return (
      <div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 p-4', className)}>
        <p className="text-sm font-medium text-destructive">Pedido cancelado</p>
      </div>
    )
  }

  return (
    <ol className={cn('flex w-full items-start', className)}>
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex
        const isCurrent = index === currentIndex
        const isActive = isDone || isCurrent

        return (
          <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {index > 0 ? (
                <StepConnector active={index <= currentIndex} />
              ) : (
                <span className="min-w-0 flex-1" aria-hidden />
              )}
              <span
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-9',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isDone && !isCurrent && 'bg-primary text-primary-foreground',
                  !isActive && 'border border-border bg-muted text-muted-foreground',
                )}
              >
                {isDone ? '✓' : index + 1}
              </span>
              {index < STEPS.length - 1 ? (
                <StepConnector active={index < currentIndex} />
              ) : (
                <span className="min-w-0 flex-1" aria-hidden />
              )}
            </div>
            <span
              className={cn(
                'mt-2 text-center text-[10px] leading-tight sm:text-xs',
                isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
