import {
  AdminDashboard,
  type AdminDashboardData,
} from '@/components/features/admin/admin-dashboard'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { cassandra } from '@/lib/db'
import type { MetricaDiariaLocal, PedidoPorLocal } from '@/lib/db/cassandra'
import { formatArs } from '@/lib/rappi'

function currentMonth() {
  const date = new Date()
  return date.toISOString().slice(0, 7)
}

function todayUtcDateKey() {
  return new Date().toISOString().slice(0, 10)
}

function dayLabel(fecha: string) {
  const date = toDate(`${fecha}T00:00:00.000Z`)
  const weekday = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    timeZone: 'UTC',
  })
    .format(date)
    .replace('.', '')
  const dayMonth = `${String(date.getUTCDate()).padStart(2, '0')}/${String(
    date.getUTCMonth() + 1,
  ).padStart(2, '0')}`

  return `${weekday} ${dayMonth}`
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((sum, item) => sum + getValue(item), 0)
}

function toDate(date: Date | string) {
  return date instanceof Date ? date : new Date(date)
}

function dateKey(date: Date | string) {
  return toDate(date).toISOString().slice(0, 10)
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function buildWeekWindow(
  metricas: MetricaDiariaLocal[],
  endDateKey: string,
  idEstablecimiento: number,
): MetricaDiariaLocal[] {
  const byDate = new Map(metricas.map((metrica) => [metrica.fecha, metrica]))
  const end = toDate(`${endDateKey}T00:00:00.000Z`)
  const start = addUtcDays(end, -6)

  return Array.from({ length: 7 }, (_, index) => {
    const fecha = dateKey(addUtcDays(start, index))
    return (
      byDate.get(fecha) ??
      ({
        idEstablecimiento,
        fecha,
        ingresosDelDia: 0,
        pedidosAceptados: 0,
        pedidosCancelados: 0,
        totalPedidos: 0,
      } satisfies MetricaDiariaLocal)
    )
  })
}

function buildChartMetrics(
  metricas: MetricaDiariaLocal[],
  pedidos: PedidoPorLocal[],
  endDateKey: string,
  idEstablecimiento: number,
): MetricaDiariaLocal[] {
  const grouped = new Map<string, MetricaDiariaLocal>()

  for (const metrica of metricas) {
    grouped.set(metrica.fecha, { ...metrica })
  }

  const pedidosPorDia = new Map<
    string,
    {
      ingresosDelDia: number
      pedidosAceptados: number
      pedidosCancelados: number
      totalPedidos: number
    }
  >()

  for (const pedido of pedidos) {
    const fecha = dateKey(pedido.fechaHora)
    const current =
      pedidosPorDia.get(fecha) ??
      ({
        ingresosDelDia: 0,
        pedidosAceptados: 0,
        pedidosCancelados: 0,
        totalPedidos: 0,
      } satisfies {
        ingresosDelDia: number
        pedidosAceptados: number
        pedidosCancelados: number
        totalPedidos: number
      })

    current.totalPedidos += 1
    current.ingresosDelDia += pedido.total
    if (pedido.estado === 'cancelado') current.pedidosCancelados += 1
    else current.pedidosAceptados += 1

    pedidosPorDia.set(fecha, current)
  }

  for (const [fecha, pedidosDelDia] of pedidosPorDia) {
    const current =
      grouped.get(fecha) ??
      ({
        idEstablecimiento,
        fecha,
        ingresosDelDia: 0,
        pedidosAceptados: 0,
        pedidosCancelados: 0,
        totalPedidos: 0,
      } satisfies MetricaDiariaLocal)

    current.totalPedidos = Math.max(current.totalPedidos, pedidosDelDia.totalPedidos)
    current.ingresosDelDia = Math.max(
      current.ingresosDelDia,
      pedidosDelDia.ingresosDelDia,
    )
    current.pedidosCancelados = Math.max(
      current.pedidosCancelados,
      pedidosDelDia.pedidosCancelados,
    )
    current.pedidosAceptados = Math.max(
      current.pedidosAceptados,
      pedidosDelDia.pedidosAceptados,
    )

    grouped.set(fecha, current)
  }

  return buildWeekWindow([...grouped.values()], endDateKey, idEstablecimiento)
}

export default async function AdminPage() {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento

  if (idEstablecimiento == null) {
    return <ErrorState message="La cuenta admin no tiene establecimiento asociado." />
  }

  const month = currentMonth()
  const today = todayUtcDateKey()
  const [metricasLocal, pedidosLocal, ranking] = await Promise.all([
    cassandra.queries.getMetricasDiariasLocal(idEstablecimiento, 30),
    cassandra.queries.getPedidosPorLocal(idEstablecimiento, 30),
    cassandra.queries.getRankingLocalesPorMes(month),
  ])

  const error = metricasLocal.error ?? pedidosLocal.error ?? ranking.error
  if (error) return <ErrorState message={error} />

  const metricas = metricasLocal.data ?? []
  const pedidos = pedidosLocal.data ?? []
  const metricasParaDashboard = buildChartMetrics(
    metricas,
    pedidos,
    today,
    idEstablecimiento,
  )
  const localRanking = (ranking.data ?? []).find(
    (item) => item.idEstablecimiento === idEstablecimiento,
  )
  const ingresos = sumBy(metricasParaDashboard, (metrica) => metrica.ingresosDelDia)
  const totalPedidos = sumBy(metricasParaDashboard, (metrica) => metrica.totalPedidos)
  const cancelados = sumBy(metricasParaDashboard, (metrica) => metrica.pedidosCancelados)
  const ticketPromedio = totalPedidos > 0 ? ingresos / totalPedidos : 0
  const hasDashboardData = metricasParaDashboard.some(
    (metrica) => metrica.totalPedidos > 0 || metrica.ingresosDelDia > 0,
  )
  const metricasWindow =
    !hasDashboardData
      ? 'Sin datos en los últimos 7 días'
      : metricas.length === 0
        ? 'Derivado de pedidos_por_local'
        : 'Últimos 7 días Cassandra'

  const chartMetricas = [...metricasParaDashboard].sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  )
  const dashboard: AdminDashboardData = {
    kpis: [
      {
        label: 'Pedidos históricos',
        value: String(totalPedidos),
        detail: metricasWindow,
      },
      {
        label: 'Facturación',
        value: formatArs(ingresos),
        detail: metricasWindow,
      },
      {
        label: 'Ticket promedio',
        value: formatArs(ticketPromedio),
        detail: 'Sobre métricas del local',
      },
      {
        label: 'Pedidos recientes',
        value: String(pedidos.length),
        detail: 'pedidos_por_local',
      },
      {
        label: 'Calificación',
        value: (localRanking?.promedioCalificacion ?? 0).toFixed(1),
        detail: `ranking_locales_por_mes · ${month}`,
      },
      {
        label: 'Cancelaciones',
        value: String(cancelados),
        detail: 'Últimos días del local',
      },
    ],
    pedidosPorDia: chartMetricas.map((metrica) => ({
      label: dayLabel(metrica.fecha),
      value: metrica.totalPedidos,
    })),
    facturacionPorDia: chartMetricas.map((metrica) => ({
      label: dayLabel(metrica.fecha),
      value: metrica.ingresosDelDia,
    })),
  }

  return <AdminDashboard dashboard={dashboard} />
}
