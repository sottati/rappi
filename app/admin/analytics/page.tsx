import { AdminAnalytics } from '@/components/features/admin/admin-analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorState } from '@/components/shared/query-state'
import { requireSession } from '@/lib/auth/require-session'
import { cassandra } from '@/lib/db'

function currentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function parseMonth(value: string | string[] | undefined) {
  const month = Array.isArray(value) ? value[0] : value
  return month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth()
}

interface AdminAnalyticsPageProps {
  searchParams?: Promise<{ mes?: string | string[] }>
}

export default async function AdminAnalyticsPage({
  searchParams,
}: AdminAnalyticsPageProps) {
  const session = await requireSession('admin')
  const idEstablecimiento = session.idEstablecimiento
  const params = searchParams ? await searchParams : {}
  const month = parseMonth(params.mes)

  if (idEstablecimiento == null) {
    return <ErrorState message="La cuenta admin no tiene establecimiento asociado." />
  }

  const [globales, ranking, local, pedidosLocal] = await Promise.all([
    cassandra.queries.getMetricasGlobalesDiarias(month),
    cassandra.queries.getRankingLocalesPorMes(month),
    cassandra.queries.getMetricasDiariasLocal(idEstablecimiento),
    cassandra.queries.getPedidosPorLocal(idEstablecimiento, 8),
  ])

  const error = globales.error ?? ranking.error ?? local.error ?? pedidosLocal.error
  if (error) return <ErrorState message={error} />

  return (
    <section className="space-y-6">
      <form className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="mes" className="text-sm font-medium">
            Mes
          </label>
          <Input id="mes" name="mes" type="month" defaultValue={month} />
        </div>
        <Button type="submit">Aplicar</Button>
      </form>

      <AdminAnalytics
        month={month}
        metricasGlobales={globales.data ?? []}
        rankingLocales={ranking.data ?? []}
        metricasLocal={local.data ?? []}
        pedidosLocal={pedidosLocal.data ?? []}
      />
    </section>
  )
}
