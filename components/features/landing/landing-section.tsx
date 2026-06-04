import type { ReactNode } from 'react'

interface LandingSectionProps {
  title: string
  children: ReactNode
}

export function LandingSection({ title, children }: LandingSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold tracking-normal sm:text-xl">{title}</h2>
      {children}
    </section>
  )
}
