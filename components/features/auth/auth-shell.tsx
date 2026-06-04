import { RappiLogo, RappiWordmark } from '@/components/rappi-logo'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

function AuthPatternPanel() {
  return (
    <div
      className="relative flex min-h-[200px] flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:min-h-svh lg:p-12"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(0,0,0,0.12)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-size-[22px_22px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-12 size-80 rounded-full bg-black/10 blur-3xl"
        aria-hidden
      />

      <Link
        href="/"
        className="relative z-10 flex w-fit items-center gap-2 transition-opacity hover:opacity-90"
      >
        <RappiLogo className="h-[22px] w-16 shrink-0 brightness-0 invert" />
        <RappiWordmark className="h-[22px] w-auto shrink-0 brightness-0 invert" />
      </Link>

      <div className="relative z-10 mt-8 max-w-sm space-y-3 lg:mt-0">
        <p className="text-2xl font-semibold leading-snug tracking-normal lg:text-3xl">
          Pedí lo que quieras, cuando quieras.
        </p>
        <p className="text-sm leading-6 text-primary-foreground/90">
          Restaurantes, mercados, farmacia y mucho más. Rápido, fácil y a donde estés.
        </p>
      </div>
    </div>
  )
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-svh bg-muted/40 lg:grid lg:grid-cols-2">
      <AuthPatternPanel />

      <div className="relative flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 lg:py-16">
        <div className="relative z-10 mx-auto w-full max-w-md -mt-14 space-y-6 sm:-mt-20 lg:mt-0">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-xl shadow-black/5 ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-8 dark:shadow-black/20 dark:ring-white/[0.04]">
            <div className="mb-6 space-y-2 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
              >
                <RappiLogo className="h-[18px] w-14 shrink-0" />
                <RappiWordmark className="h-[18px] w-auto shrink-0" />
              </Link>
            </div>

            <div className="mb-6 space-y-2">
              <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            {children}
          </div>

          {footer ? (
            <p className="text-center text-sm text-muted-foreground">{footer}</p>
          ) : null}
        </div>
      </div>
    </main>
  )
}
