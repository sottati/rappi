const ORDER_STEPS = [
  { label: 'Confirmado', shortLabel: 'Confirmado' },
  { label: 'Preparando', shortLabel: 'Preparando' },
  { label: 'En camino', shortLabel: 'En camino' },
  { label: 'Entregado', shortLabel: 'Entregado' },
] as const

/** Paso inicial del checkout antes de recibir tracking real. */
const CURRENT_STEP_INDEX = 0

function StepConnector({ active }: { active: boolean }) {
  return (
    <div
      className={`h-0.5 min-w-2 flex-1 ${active ? 'bg-primary' : 'bg-border'}`}
      aria-hidden
    />
  )
}

export function OrderStatusBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur supports-[backdrop-filter]:bg-background/90">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-left">
          Estado del pedido
        </p>
        <ol className="flex w-full items-start">
          {ORDER_STEPS.map((step, index) => {
            const isDone = index < CURRENT_STEP_INDEX
            const isCurrent = index === CURRENT_STEP_INDEX
            const isActive = isDone || isCurrent
            const lineAfterActive = index < CURRENT_STEP_INDEX

            return (
              <li key={step.label} className="flex min-w-0 flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {index > 0 ? <StepConnector active={index <= CURRENT_STEP_INDEX} /> : (
                    <span className="min-w-0 flex-1" aria-hidden />
                  )}
                  <span
                    className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:size-9 ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                        : isDone
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-muted text-muted-foreground'
                    }`}
                  >
                    {isDone ? '✓' : index + 1}
                  </span>
                  {index < ORDER_STEPS.length - 1 ? (
                    <StepConnector active={lineAfterActive} />
                  ) : (
                    <span className="min-w-0 flex-1" aria-hidden />
                  )}
                </div>
                <span
                  className={`mt-2 hidden max-w-[5.5rem] truncate text-center text-[10px] leading-tight sm:block sm:max-w-none sm:text-xs ${
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`mt-2 max-w-[4.5rem] truncate text-center text-[10px] leading-tight sm:hidden ${
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.shortLabel}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
