import { getTable } from './client'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import {
  mockCalificacionesLocal,
  mockCalificacionesRepartidor,
  mockMetricasDiariasLocal,
  mockMetricasDiariasRepartidor,
  mockMetricasGlobalesDiarias,
  mockPedidosPorCliente,
  mockPedidosPorLocal,
  mockPedidosPorLocalEstado,
  mockPedidosPorRepartidor,
  mockRankingLocalesPorMes,
} from './mock'
import type {
  CalificacionLocal,
  CalificacionRepartidor,
  MetricaDiariaLocal,
  MetricaDiariaRepartidor,
  MetricaGlobalDiaria,
  PedidoPorCliente,
  PedidoPorLocal,
  PedidoPorLocalEstado,
  PedidoPorRepartidor,
  RankingLocalMes,
} from './types'

type CqlDate = string | { year: number; month: number; date: number }
type DateLike = Date | string

interface PedidoPorClienteRow {
  id_cliente: number
  fecha_hora: DateLike
  id_pedido: number
  estado: string
  id_establecimiento: number
  id_repartidor: number
  nombre_establecimiento: string
  total: number
}

interface PedidoPorLocalRow {
  id_establecimiento: number
  fecha_hora: DateLike
  id_pedido: number
  estado: string
  id_cliente: number
  nombre_cliente: string
  total: number
}

interface PedidoPorRepartidorRow {
  id_repartidor: number
  fecha_hora: DateLike
  id_pedido: number
  direccion_entrega: string
  estado: string
  id_cliente: number
  id_establecimiento: number
  nombre_cliente: string
  nombre_establecimiento: string
  telefono_cliente: string
  total: number
}

interface CalificacionLocalRow {
  id_establecimiento: number
  fecha_hora: DateLike
  id_calificacion: number
  id_pedido: number
  puntaje: number
  tipo: string
}

interface CalificacionRepartidorRow {
  id_repartidor: number
  fecha_hora: DateLike
  id_calificacion: number
  id_pedido: number
  puntaje: number
}

interface MetricaDiariaLocalRow {
  id_establecimiento: number
  fecha: CqlDate
  ingresos_del_dia: number
  pedidos_aceptados: number
  pedidos_cancelados: number
  total_pedidos: number
}

interface MetricaDiariaRepartidorRow {
  id_repartidor: number
  fecha: CqlDate
  ingresos_del_dia: number
  pedidos_cancelados: number
  pedidos_entregados: number
}

interface MetricaGlobalDiariaRow {
  bucket: string
  fecha: CqlDate
  ingresos_totales: number
  locales_activos: number
  pedidos_cancelados: number
  pedidos_entregados: number
  repartidores_activos: number
  total_pedidos: number
}

interface RankingLocalMesRow {
  mes: string
  total_pedidos: number
  id_establecimiento: number
  ingresos: number
  nombre_establecimiento: string
  promedio_calificacion: number
}

function parseDate(value: DateLike): Date {
  return value instanceof Date ? value : new Date(value)
}

function parseCqlDate(value: CqlDate): string {
  if (typeof value === 'string') return value

  const month = String(value.month).padStart(2, '0')
  const day = String(value.date).padStart(2, '0')
  return `${value.year}-${month}-${day}`
}

function toPedidoPorCliente(row: PedidoPorClienteRow): PedidoPorCliente {
  return {
    idCliente: row.id_cliente,
    fechaHora: parseDate(row.fecha_hora),
    idPedido: row.id_pedido,
    estado: row.estado,
    idEstablecimiento: row.id_establecimiento,
    idRepartidor: row.id_repartidor,
    nombreEstablecimiento: row.nombre_establecimiento,
    total: row.total,
  }
}

function toPedidoPorLocal(row: PedidoPorLocalRow): PedidoPorLocal {
  return {
    idEstablecimiento: row.id_establecimiento,
    fechaHora: parseDate(row.fecha_hora),
    idPedido: row.id_pedido,
    estado: row.estado,
    idCliente: row.id_cliente,
    nombreCliente: row.nombre_cliente,
    total: row.total,
  }
}

function toPedidoPorRepartidor(row: PedidoPorRepartidorRow): PedidoPorRepartidor {
  return {
    idRepartidor: row.id_repartidor,
    fechaHora: parseDate(row.fecha_hora),
    idPedido: row.id_pedido,
    direccionEntrega: row.direccion_entrega,
    estado: row.estado,
    idCliente: row.id_cliente,
    idEstablecimiento: row.id_establecimiento,
    nombreCliente: row.nombre_cliente,
    nombreEstablecimiento: row.nombre_establecimiento,
    telefonoCliente: row.telefono_cliente,
    total: row.total,
  }
}

function toCalificacionLocal(row: CalificacionLocalRow): CalificacionLocal {
  return {
    idEstablecimiento: row.id_establecimiento,
    fechaHora: parseDate(row.fecha_hora),
    idCalificacion: row.id_calificacion,
    idPedido: row.id_pedido,
    puntaje: row.puntaje,
    tipo: row.tipo,
  }
}

function toCalificacionRepartidor(
  row: CalificacionRepartidorRow,
): CalificacionRepartidor {
  return {
    idRepartidor: row.id_repartidor,
    fechaHora: parseDate(row.fecha_hora),
    idCalificacion: row.id_calificacion,
    idPedido: row.id_pedido,
    puntaje: row.puntaje,
  }
}

function toMetricaDiariaLocal(row: MetricaDiariaLocalRow): MetricaDiariaLocal {
  return {
    idEstablecimiento: row.id_establecimiento,
    fecha: parseCqlDate(row.fecha),
    ingresosDelDia: row.ingresos_del_dia,
    pedidosAceptados: row.pedidos_aceptados,
    pedidosCancelados: row.pedidos_cancelados,
    totalPedidos: row.total_pedidos,
  }
}

function toMetricaDiariaRepartidor(
  row: MetricaDiariaRepartidorRow,
): MetricaDiariaRepartidor {
  return {
    idRepartidor: row.id_repartidor,
    fecha: parseCqlDate(row.fecha),
    ingresosDelDia: row.ingresos_del_dia,
    pedidosCancelados: row.pedidos_cancelados,
    pedidosEntregados: row.pedidos_entregados,
  }
}

function toMetricaGlobalDiaria(row: MetricaGlobalDiariaRow): MetricaGlobalDiaria {
  return {
    bucket: row.bucket,
    fecha: parseCqlDate(row.fecha),
    ingresosTotales: row.ingresos_totales,
    localesActivos: row.locales_activos,
    pedidosCancelados: row.pedidos_cancelados,
    pedidosEntregados: row.pedidos_entregados,
    repartidoresActivos: row.repartidores_activos,
    totalPedidos: row.total_pedidos,
  }
}

function toRankingLocalMes(row: RankingLocalMesRow): RankingLocalMes {
  return {
    mes: row.mes,
    totalPedidos: row.total_pedidos,
    idEstablecimiento: row.id_establecimiento,
    ingresos: row.ingresos,
    nombreEstablecimiento: row.nombre_establecimiento,
    promedioCalificacion: row.promedio_calificacion,
  }
}

export async function getPedidosPorCliente(
  idCliente: number,
  limit = 50,
): Promise<QueryResult<PedidoPorCliente[]>> {
  if (shouldUseMockData()) {
    return ok(mockPedidosPorCliente.filter((pedido) => pedido.idCliente === idCliente))
  }

  try {
    const rows = await getTable<PedidoPorClienteRow>('pedidos_por_cliente')
      .find({ id_cliente: idCliente }, { limit })
      .toArray()

    return ok(rows.map(toPedidoPorCliente))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch customer orders')
  }
}

export async function getPedidosPorLocal(
  idEstablecimiento: number,
  limit = 50,
): Promise<QueryResult<PedidoPorLocal[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockPedidosPorLocal.filter(
        (pedido) => pedido.idEstablecimiento === idEstablecimiento,
      ),
    )
  }

  try {
    const rows = await getTable<PedidoPorLocalRow>('pedidos_por_local')
      .find({ id_establecimiento: idEstablecimiento }, { limit })
      .toArray()

    return ok(rows.map(toPedidoPorLocal))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch store orders')
  }
}

export async function getPedidosPorLocalEstado(
  idEstablecimiento: number,
  estado: string,
  limit = 50,
): Promise<QueryResult<PedidoPorLocalEstado[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockPedidosPorLocalEstado.filter(
        (pedido) =>
          pedido.idEstablecimiento === idEstablecimiento &&
          pedido.estado === estado,
      ),
    )
  }

  try {
    const rows = await getTable<PedidoPorLocalRow>('pedidos_por_local_estado')
      .find({ id_establecimiento: idEstablecimiento, estado }, { limit })
      .toArray()

    return ok(rows.map(toPedidoPorLocal))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : 'Failed to fetch store orders by status',
    )
  }
}

export async function getPedidosPorRepartidor(
  idRepartidor: number,
  limit = 50,
): Promise<QueryResult<PedidoPorRepartidor[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockPedidosPorRepartidor.filter(
        (pedido) => pedido.idRepartidor === idRepartidor,
      ),
    )
  }

  try {
    const rows = await getTable<PedidoPorRepartidorRow>('pedidos_por_repartidor')
      .find({ id_repartidor: idRepartidor }, { limit })
      .toArray()

    return ok(rows.map(toPedidoPorRepartidor))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch courier orders')
  }
}

export async function getCalificacionesLocal(
  idEstablecimiento: number,
  limit = 50,
): Promise<QueryResult<CalificacionLocal[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockCalificacionesLocal.filter(
        (calificacion) => calificacion.idEstablecimiento === idEstablecimiento,
      ),
    )
  }

  try {
    const rows = await getTable<CalificacionLocalRow>('calificaciones_local')
      .find({ id_establecimiento: idEstablecimiento }, { limit })
      .toArray()

    return ok(rows.map(toCalificacionLocal))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch store ratings')
  }
}

export async function getCalificacionesRepartidor(
  idRepartidor: number,
  limit = 50,
): Promise<QueryResult<CalificacionRepartidor[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockCalificacionesRepartidor.filter(
        (calificacion) => calificacion.idRepartidor === idRepartidor,
      ),
    )
  }

  try {
    const rows = await getTable<CalificacionRepartidorRow>(
      'calificaciones_repartidor',
    )
      .find({ id_repartidor: idRepartidor }, { limit })
      .toArray()

    return ok(rows.map(toCalificacionRepartidor))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch courier ratings')
  }
}

export async function getMetricasDiariasLocal(
  idEstablecimiento: number,
  limit = 50,
): Promise<QueryResult<MetricaDiariaLocal[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockMetricasDiariasLocal.filter(
        (metrica) => metrica.idEstablecimiento === idEstablecimiento,
      ),
    )
  }

  try {
    const rows = await getTable<MetricaDiariaLocalRow>('metricas_diarias_local')
      .find({ id_establecimiento: idEstablecimiento }, { limit })
      .toArray()

    return ok(rows.map(toMetricaDiariaLocal))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch store metrics')
  }
}

export async function getMetricasDiariasRepartidor(
  idRepartidor: number,
  limit = 50,
): Promise<QueryResult<MetricaDiariaRepartidor[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockMetricasDiariasRepartidor.filter(
        (metrica) => metrica.idRepartidor === idRepartidor,
      ),
    )
  }

  try {
    const rows = await getTable<MetricaDiariaRepartidorRow>(
      'metricas_diarias_repartidor',
    )
      .find({ id_repartidor: idRepartidor }, { limit })
      .toArray()

    return ok(rows.map(toMetricaDiariaRepartidor))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch courier metrics')
  }
}

export async function getMetricasGlobalesDiarias(
  bucket: string,
  limit = 50,
): Promise<QueryResult<MetricaGlobalDiaria[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockMetricasGlobalesDiarias.filter((metrica) => metrica.bucket === bucket),
    )
  }

  try {
    const rows = await getTable<MetricaGlobalDiariaRow>('metricas_globales_diarias')
      .find({ bucket }, { limit })
      .toArray()

    return ok(rows.map(toMetricaGlobalDiaria))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch global metrics')
  }
}

export async function getRankingLocalesPorMes(
  mes: string,
  limit = 50,
): Promise<QueryResult<RankingLocalMes[]>> {
  if (shouldUseMockData()) {
    return ok(mockRankingLocalesPorMes.filter((ranking) => ranking.mes === mes))
  }

  try {
    const rows = await getTable<RankingLocalMesRow>('ranking_locales_por_mes')
      .find({ mes }, { limit })
      .toArray()

    return ok(rows.map(toRankingLocalMes))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch store ranking')
  }
}
