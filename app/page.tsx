import Link from 'next/link'

const roleEntrypoints = [
  {
    href: '/admin',
    label: 'Admin',
    title: 'Gestionar establecimiento',
    description: 'Locales, productos, pedidos recibidos y metricas.',
  },
  {
    href: '/repartidor',
    label: 'Repartidor',
    title: 'Ver turno',
    description: 'Disponibilidad, ubicacion actual y pedidos asignados.',
  },
  {
    href: '/usuario',
    label: 'Usuario',
    title: 'Comprar y revisar pedidos',
    description: 'Establecimientos, historial de pedidos y direcciones.',
  },
]

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <section className="mx-auto grid min-h-svh w-full max-w-6xl content-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-normal text-primary">
            Rappi data console
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-5xl">
            Base operativa por rol para explorar datos multi-DB.
          </h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            Entrada temporal mientras se integra Supabase Auth. Cada rol usa Server
            Components, queries tipadas y mocks activables con `MOCK_DB=true`.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {roleEntrypoints.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {item.label}
              </span>
              <h2 className="mt-4 font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
