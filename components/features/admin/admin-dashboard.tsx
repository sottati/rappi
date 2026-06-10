"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { EmptyState } from '@/components/shared/query-state'
import { StatCard } from '@/components/shared/stat-card'
import { formatArs } from '@/lib/rappi'

export interface AdminDashboardChartPoint {
  label: string
  value: number
}

export interface AdminDashboardData {
  kpis: {
    label: string
    value: string
    detail?: string
    trend?: string
  }[]
  pedidosPorDia: AdminDashboardChartPoint[]
  facturacionPorDia: AdminDashboardChartPoint[]
}

const pedidosChartConfig = {
  value: {
    label: 'Pedidos',
    color: 'oklch(0.68 0.18 48)',
  },
} satisfies ChartConfig

const facturacionChartConfig = {
  value: {
    label: 'Facturación',
    color: 'oklch(0.58 0.19 38)',
  },
} satisfies ChartConfig

function DashboardChart({
  title,
  data,
  config,
  formatValue,
}: {
  title: string
  data: AdminDashboardChartPoint[]
  config: ChartConfig
  formatValue?: (value: number) => string
}) {
  const hasData = data.some((point) => point.value > 0)

  return (
    <section className="rounded-lg border border-border/80 bg-card p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {hasData ? (
        <ChartContainer
          config={config}
          className="!aspect-auto h-[220px] min-h-[220px] w-full"
          initialDimension={{ width: 640, height: 220 }}
          style={{ height: 220 }}
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={formatValue ? 64 : 36}
              tickFormatter={(value) =>
                formatValue ? formatValue(Number(value)).replace(/\s/g, '') : String(value)
              }
            />
            <ChartTooltip
              cursor={{ fill: 'oklch(0.68 0.18 48 / 0.14)' }}
              content={
                <ChartTooltipContent
                  className="border-primary/40 bg-popover text-popover-foreground shadow-xl"
                  formatter={(value) =>
                    formatValue ? formatValue(Number(value)) : String(value)
                  }
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={4}
              minPointSize={6}
              activeBar={{
                fill: 'oklch(0.74 0.2 52)',
                stroke: 'oklch(0.86 0.16 70)',
                strokeWidth: 1,
              }}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <EmptyState title="Sin datos para graficar." />
      )}
    </section>
  )
}

interface AdminDashboardProps {
  dashboard: AdminDashboardData
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
        <DashboardChart
          title="Pedidos por día (última semana)"
          data={dashboard.pedidosPorDia}
          config={pedidosChartConfig}
        />
        <DashboardChart
          title="Facturación por día"
          data={dashboard.facturacionPorDia}
          config={facturacionChartConfig}
          formatValue={(value) => formatArs(value)}
        />
      </div>
    </section>
  )
}
