'use client'

import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { EmptyState } from '@/components/shared/query-state'
import { StatCard } from '@/components/shared/stat-card'
import { formatArs, formatPedidoFecha } from '@/lib/rappi'
import type {
  MetricaDiariaLocal,
  MetricaGlobalDiaria,
  PedidoPorLocal,
  RankingLocalMes,
} from '@/lib/db/cassandra'

interface AdminAnalyticsProps {
  month: string
  metricasGlobales: MetricaGlobalDiaria[]
  rankingLocales: RankingLocalMes[]
  metricasLocal: MetricaDiariaLocal[]
  pedidosLocal: PedidoPorLocal[]
}

const globalChartConfig = {
  totalPedidos: {
    label: 'Pedidos totales',
    color: 'oklch(0.68 0.18 48)',
  },
  pedidosEntregados: {
    label: 'Entregados',
    color: 'oklch(0.58 0.19 38)',
  },
} satisfies ChartConfig

const ingresosChartConfig = {
  ingresosTotales: {
    label: 'Ingresos globales',
    color: 'oklch(0.55 0.14 250)',
  },
} satisfies ChartConfig

const localChartConfig = {
  totalPedidos: {
    label: 'Pedidos',
    color: 'oklch(0.68 0.18 48)',
  },
  pedidosCancelados: {
    label: 'Cancelados',
    color: 'oklch(0.58 0.2 25)',
  },
} satisfies ChartConfig

const panelClass = 'rounded-md border bg-card p-4'
const chartMargin = { top: 8, right: 8, bottom: 4, left: 0 }

function AnalyticsPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className={panelClass}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function formatDay(fecha: string) {
  const [, month, day] = fecha.split('-')
  return `${day}/${month}`
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0)
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es-AR').format(value)
}

function monthLabel(month: string) {
  const [year, rawMonth] = month.split('-')
  return `${rawMonth}/${year}`
}

function toDate(date: Date | string) {
  return date instanceof Date ? date : new Date(date)
}

function dateKey(date: Date | string) {
  return toDate(date).toISOString().slice(0, 10)
}

function dateMonth(date: Date | string) {
  return dateKey(date).slice(0, 7)
}

function daysInMonth(month: string) {
  const [year, monthNum] = month.split('-').map(Number)
  const totalDays = new Date(year, monthNum, 0).getDate()

  return Array.from({ length: totalDays }, (_, index) => {
    const day = String(index + 1).padStart(2, '0')
    return `${month}-${day}`
  })
}

function hasPositiveValue<T>(items: T[], getValues: (item: T) => number[]) {
  return items.some((item) => getValues(item).some((value) => value > 0))
}

function fillGlobalChartData(month: string, metricas: MetricaGlobalDiaria[]) {
  const byDate = new Map(metricas.map((metrica) => [metrica.fecha, metrica]))

  return daysInMonth(month).map((fecha) => {
    const metrica = byDate.get(fecha)
    return {
      fecha: formatDay(fecha),
      totalPedidos: metrica?.totalPedidos ?? 0,
      pedidosEntregados: metrica?.pedidosEntregados ?? 0,
      ingresosTotales: metrica?.ingresosTotales ?? 0,
    }
  })
}

function buildLocalChartData(
  month: string,
  metricas: MetricaDiariaLocal[],
  pedidos: PedidoPorLocal[],
) {
  const byDate = new Map<
    string,
    {
      totalPedidos: number
      pedidosCancelados: number
      ingresosDelDia: number
    }
  >()

  for (const metrica of metricas) {
    byDate.set(metrica.fecha, {
      totalPedidos: metrica.totalPedidos,
      pedidosCancelados: metrica.pedidosCancelados,
      ingresosDelDia: metrica.ingresosDelDia,
    })
  }

  for (const pedido of pedidos) {
    const fecha = dateKey(pedido.fechaHora)
    const current =
      byDate.get(fecha) ??
      ({
        totalPedidos: 0,
        pedidosCancelados: 0,
        ingresosDelDia: 0,
      } satisfies {
        totalPedidos: number
        pedidosCancelados: number
        ingresosDelDia: number
      })

    current.totalPedidos += 1
    if (pedido.estado === 'cancelado') current.pedidosCancelados += 1
    current.ingresosDelDia += pedido.total
    byDate.set(fecha, current)
  }

  return daysInMonth(month).map((fecha) => {
    const metrica = byDate.get(fecha)
    return {
      fecha: formatDay(fecha),
      totalPedidos: metrica?.totalPedidos ?? 0,
      pedidosCancelados: metrica?.pedidosCancelados ?? 0,
      ingresosDelDia: metrica?.ingresosDelDia ?? 0,
    }
  })
}

export function AdminAnalytics({
  month,
  metricasGlobales,
  rankingLocales,
  metricasLocal,
  pedidosLocal,
}: AdminAnalyticsProps) {
  const metricasLocalDelMes = metricasLocal.filter((metrica) =>
    metrica.fecha.startsWith(month),
  )
  const pedidosLocalDelMes = pedidosLocal.filter(
    (pedido) => dateMonth(pedido.fechaHora) === month,
  )

  const globalData = fillGlobalChartData(month, metricasGlobales)
  const localData = buildLocalChartData(month, metricasLocalDelMes, pedidosLocalDelMes)

  const ingresosGlobales = sumBy(metricasGlobales, (metrica) => metrica.ingresosTotales)
  const pedidosGlobales = sumBy(metricasGlobales, (metrica) => metrica.totalPedidos)
  const ingresosLocal = sumBy(localData, (metrica) => metrica.ingresosDelDia)
  const pedidosLocalTotal = sumBy(localData, (metrica) => metrica.totalPedidos)
  const cancelacionesLocal = sumBy(localData, (metrica) => metrica.pedidosCancelados)
  const calificacionPromedio = average(
    rankingLocales.map((local) => local.promedioCalificacion),
  )
  const hasGlobalPedidos = hasPositiveValue(metricasGlobales, (item) => [
    item.totalPedidos,
    item.pedidosEntregados,
  ])
  const hasGlobalIngresos = hasPositiveValue(metricasGlobales, (item) => [
    item.ingresosTotales,
  ])
  const hasLocalMetricas =
    hasPositiveValue(metricasLocalDelMes, (item) => [
      item.totalPedidos,
      item.pedidosCancelados,
      item.ingresosDelDia,
    ]) || pedidosLocalDelMes.length > 0

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Analytics Cassandra</h2>
        <p className="text-sm text-muted-foreground">
          Métricas históricas diarias del read model Cassandra para el mes seleccionado.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ingresos globales"
          value={formatArs(ingresosGlobales)}
          detail={`Mes ${monthLabel(month)}`}
        />
        <StatCard
          label="Pedidos globales"
          value={formatNumber(pedidosGlobales)}
          detail="Total del bucket mensual"
        />
        <StatCard
          label="Ingresos del local"
          value={formatArs(ingresosLocal)}
          detail={`${formatNumber(pedidosLocalTotal)} pedidos`}
        />
        <StatCard
          label="Cancelaciones local"
          value={formatNumber(cancelacionesLocal)}
          detail={`Rating promedio ${calificacionPromedio.toFixed(1)}`}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <AnalyticsPanel
          title="Pedidos globales"
          description="Volumen diario de pedidos en toda la plataforma: total vs. entregados."
        >
          {hasGlobalPedidos ? (
            <ChartContainer
              config={globalChartConfig}
              className="aspect-auto! h-[240px] min-h-[240px] w-full"
              initialDimension={{ width: 640, height: 240 }}
              style={{ height: 240 }}
            >
              <BarChart accessibilityLayer data={globalData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={32}
                  interval="preserveStartEnd"
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} width={36} />
                <ChartTooltip
                  cursor={{ fill: 'oklch(0.68 0.18 48 / 0.14)' }}
                  content={
                    <ChartTooltipContent className="border-primary/40 bg-popover text-popover-foreground shadow-xl" />
                  }
                />
                <Bar
                  dataKey="totalPedidos"
                  fill="var(--color-totalPedidos)"
                  radius={4}
                  minPointSize={6}
                  activeBar={{
                    fill: 'oklch(0.74 0.2 52)',
                    stroke: 'oklch(0.86 0.16 70)',
                    strokeWidth: 1,
                  }}
                />
                <Bar
                  dataKey="pedidosEntregados"
                  fill="var(--color-pedidosEntregados)"
                  radius={4}
                  minPointSize={6}
                  activeBar={{
                    fill: 'oklch(0.64 0.2 38)',
                    stroke: 'oklch(0.76 0.16 50)',
                    strokeWidth: 1,
                  }}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <EmptyState title="Sin métricas globales para este mes." />
          )}
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Ingresos globales"
          description="Suma diaria de facturación de todos los locales de la plataforma."
        >
          {hasGlobalIngresos ? (
            <ChartContainer
              config={ingresosChartConfig}
              className="aspect-auto! h-[240px] min-h-[240px] w-full"
              initialDimension={{ width: 640, height: 240 }}
              style={{ height: 240 }}
            >
              <LineChart accessibilityLayer data={globalData} margin={chartMargin}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="fecha"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={32}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  width={64}
                  tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="border-primary/40 bg-popover text-popover-foreground shadow-xl"
                      formatter={(value) => formatArs(Number(value))}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="ingresosTotales"
                  stroke="var(--color-ingresosTotales)"
                  strokeWidth={2}
                  dot={false}
                  activeDot
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <EmptyState title="Sin ingresos globales para este mes." />
          )}
        </AnalyticsPanel>
      </div>

      <AnalyticsPanel
        title="Métricas del local"
        description="Pedidos totales y cancelados por día del mes."
      >
        {hasLocalMetricas ? (
          <ChartContainer
            config={localChartConfig}
            className="aspect-auto! h-[240px] min-h-[240px] w-full"
            initialDimension={{ width: 640, height: 240 }}
            style={{ height: 240 }}
          >
            <BarChart accessibilityLayer data={localData} margin={chartMargin}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="fecha"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={32}
                interval="preserveStartEnd"
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={10} width={36} />
              <ChartTooltip
                cursor={{ fill: 'oklch(0.68 0.18 48 / 0.14)' }}
                content={
                  <ChartTooltipContent className="border-primary/40 bg-popover text-popover-foreground shadow-xl" />
                }
              />
              <Bar
                dataKey="totalPedidos"
                fill="var(--color-totalPedidos)"
                radius={4}
                minPointSize={6}
                activeBar={{
                  fill: 'oklch(0.74 0.2 52)',
                  stroke: 'oklch(0.86 0.16 70)',
                  strokeWidth: 1,
                }}
              />
              <Bar
                dataKey="pedidosCancelados"
                fill="var(--color-pedidosCancelados)"
                radius={4}
                minPointSize={6}
                activeBar={{
                  fill: 'oklch(0.64 0.2 25)',
                  stroke: 'oklch(0.76 0.16 35)',
                  strokeWidth: 1,
                }}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState title="Sin métricas históricas para este local." />
        )}
      </AnalyticsPanel>

      <AnalyticsPanel
        title="Pedidos históricos del local"
        description="Últimas lecturas desde pedidos_por_local."
      >
        {pedidosLocalDelMes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="text-left text-xs uppercase tracking-normal text-muted-foreground">
                <tr className="border-b border-border/80">
                  <th className="py-3 pr-4 font-medium">Pedido</th>
                  <th className="py-3 pr-4 font-medium">Cliente</th>
                  <th className="py-3 pr-4 font-medium">Fecha</th>
                  <th className="py-3 pr-4 font-medium">Estado</th>
                  <th className="py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosLocalDelMes.map((pedido) => (
                  <tr key={pedido.idPedido} className="border-b border-border/60 last:border-b-0">
                    <td className="py-3.5 pr-4 font-medium">#{pedido.idPedido}</td>
                    <td className="py-3.5 pr-4">{pedido.nombreCliente}</td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {formatPedidoFecha(pedido.fechaHora)}
                    </td>
                    <td className="py-3.5 pr-4">{pedido.estado}</td>
                    <td className="py-3.5 text-right font-medium">
                      {formatArs(pedido.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin pedidos históricos para este local." />
        )}
      </AnalyticsPanel>
    </section>
  )
}
