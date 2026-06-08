import Link from 'next/link'

import { StatCard } from '@/components/shared/stat-card'
import { formatArs, type AdminDashboardChartPoint, type AdminDashboardMock } from '@/lib/rappi'

function BarChart({
  title,
  data,
  formatValue,
}: {
  title: string
  data: AdminDashboardChartPoint[]
  formatValue?: (value: number) => string
}) {
  const max = Math.max(...data.map((point) => point.value), 1)

  return (
    <section className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      <div className="flex h-44 items-end gap-2 sm:gap-3">
        {data.map((point) => {
          const height = `${Math.round((point.value / max) * 100)}%`
          return (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-full w-full items-end">
                <div
                  className="w-full rounded-t-md bg-primary/80 transition-all"
                  style={{ height }}
                  title={formatValue ? formatValue(point.value) : String(point.value)}
                />
              </div>
              <span className="text-[10px] text-muted-foreground sm:text-xs">{point.label}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

interface AdminDashboardProps {
  dashboard: AdminDashboardMock
}

export function AdminDashboard({ dashboard }: AdminDashboardProps) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.kpis.map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            detail={kpi.detail ?? kpi.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart title="Pedidos por día (última semana)" data={dashboard.pedidosPorDia} />
        <BarChart
          title="Facturación por día"
          data={dashboard.facturacionPorDia}
          formatValue={(value) => formatArs(value)}
        />
      </div>

      <div className="rounded-xl border border-border/80 bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Accesos rápidos</h2>
        </div>
        <div className="grid gap-0 divide-y">
          <Link className="p-4 text-sm transition-colors hover:bg-muted" href="/admin/local">
            Gestionar mi establecimiento
          </Link>
          <Link className="p-4 text-sm transition-colors hover:bg-muted" href="/admin/pedidos">
            Ver pedidos recibidos
          </Link>
          <Link className="p-4 text-sm transition-colors hover:bg-muted" href="/admin/productos">
            Gestionar productos
          </Link>
        </div>
      </div>
    </section>
  )
}
