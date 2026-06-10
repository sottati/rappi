import * as postgres from '../postgres'
import { shouldUseMockData } from '../helpers'
import { getTable } from './client'
import type {
  CalificacionLocalRow,
  CalificacionRepartidorRow,
  MetricaDiariaLocalRow,
  MetricaDiariaRepartidorRow,
  MetricaGlobalDiariaRow,
  PedidoPorClienteRow,
  PedidoPorLocalRow,
  PedidoPorRepartidorRow,
  RankingLocalMesRow,
} from './rows'
import {
  EstadoPedido,
  TipoCalificacion,
  type Calificacion,
  type PedidoConDetalle,
} from '@/types/domain'

const TARIFA_ENVIO_REPARTIDOR = 2500

function toFechaDia(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toMes(d: Date): string {
  return d.toISOString().slice(0, 7)
}

function parseDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

async function denormalizarNombres(pedido: PedidoConDetalle) {
  const [establecimiento, cliente] = await Promise.all([
    postgres.queries.getEstablecimientoById(pedido.idEstablecimiento),
    postgres.queries.getClienteById(pedido.idCliente),
  ])

  const nombreEstablecimiento =
    establecimiento.data?.nombre ?? `Local #${pedido.idEstablecimiento}`
  const nombreCliente = cliente.data
    ? `${cliente.data.nombre} ${cliente.data.apellido}`
    : `Cliente #${pedido.idCliente}`

  return { nombreEstablecimiento, nombreCliente, cliente: cliente.data }
}

async function buildPedidoPorRepartidorRow(
  pedido: PedidoConDetalle,
  nombreEstablecimiento: string,
  nombreCliente: string,
): Promise<PedidoPorRepartidorRow | null> {
  if (pedido.idRepartidor == null) return null

  const [direccion, cliente] = await Promise.all([
    postgres.queries.getDireccionEntregaById(pedido.idDireccion, pedido.idCliente),
    postgres.queries.getClienteById(pedido.idCliente),
  ])

  const direccionData = direccion.data
  const direccionEntrega = direccionData
    ? `${direccionData.calle} ${direccionData.numero}, ${direccionData.ciudad}`
    : 'Sin direccion'

  return {
    id_repartidor: pedido.idRepartidor,
    fecha_hora: pedido.fechaHora,
    id_pedido: pedido.idPedido,
    direccion_entrega: direccionEntrega,
    estado: pedido.estado,
    id_cliente: pedido.idCliente,
    id_establecimiento: pedido.idEstablecimiento,
    nombre_cliente: nombreCliente,
    nombre_establecimiento: nombreEstablecimiento,
    telefono_cliente: cliente.data?.telefono ?? '',
    total: pedido.total,
  }
}

export async function projectPedidoCreado(pedido: PedidoConDetalle): Promise<void> {
  if (shouldUseMockData()) return

  try {
    const { nombreEstablecimiento, nombreCliente } = await denormalizarNombres(pedido)

    const pedidoPorClienteRow: PedidoPorClienteRow = {
      id_cliente: pedido.idCliente,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
      estado: pedido.estado,
      id_establecimiento: pedido.idEstablecimiento,
      id_repartidor: pedido.idRepartidor ?? 0,
      nombre_establecimiento: nombreEstablecimiento,
      total: pedido.total,
    }

    const pedidoPorLocalRow: PedidoPorLocalRow = {
      id_establecimiento: pedido.idEstablecimiento,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
      estado: pedido.estado,
      id_cliente: pedido.idCliente,
      nombre_cliente: nombreCliente,
      total: pedido.total,
    }

    await Promise.all([
      getTable<PedidoPorClienteRow>('pedidos_por_cliente').insertOne(pedidoPorClienteRow),
      getTable<PedidoPorLocalRow>('pedidos_por_local').insertOne(pedidoPorLocalRow),
      getTable<PedidoPorLocalRow>('pedidos_por_local_estado').insertOne(pedidoPorLocalRow),
    ])

    const fecha = toFechaDia(pedido.fechaHora)
    const metricasLocalTable = getTable<MetricaDiariaLocalRow>('metricas_diarias_local')
    const existingLocal = await metricasLocalTable.findOne({
      id_establecimiento: pedido.idEstablecimiento,
      fecha,
    })

    if (existingLocal) {
      await metricasLocalTable.insertOne({
        id_establecimiento: pedido.idEstablecimiento,
        fecha,
        ingresos_del_dia: existingLocal.ingresos_del_dia,
        pedidos_aceptados: existingLocal.pedidos_aceptados,
        pedidos_cancelados: existingLocal.pedidos_cancelados,
        total_pedidos: existingLocal.total_pedidos + 1,
      })
    } else {
      await metricasLocalTable.insertOne({
        id_establecimiento: pedido.idEstablecimiento,
        fecha,
        ingresos_del_dia: 0,
        pedidos_aceptados: 0,
        pedidos_cancelados: 0,
        total_pedidos: 1,
      })
    }

    const bucket = toMes(pedido.fechaHora)
    const metricasGlobalesTable = getTable<MetricaGlobalDiariaRow>('metricas_globales_diarias')
    const existingGlobal = await metricasGlobalesTable.findOne({ bucket, fecha })

    if (existingGlobal) {
      await metricasGlobalesTable.insertOne({
        bucket,
        fecha,
        ingresos_totales: existingGlobal.ingresos_totales,
        locales_activos: existingGlobal.locales_activos,
        pedidos_cancelados: existingGlobal.pedidos_cancelados,
        pedidos_entregados: existingGlobal.pedidos_entregados,
        repartidores_activos: existingGlobal.repartidores_activos,
        total_pedidos: existingGlobal.total_pedidos + 1,
      })
    } else {
      await metricasGlobalesTable.insertOne({
        bucket,
        fecha,
        ingresos_totales: 0,
        locales_activos: 1,
        pedidos_cancelados: 0,
        pedidos_entregados: 0,
        repartidores_activos: 1,
        total_pedidos: 1,
      })
    }
  } catch (error) {
    console.error('[cassandra] proyección falló:', error)
    return
  }
}

export async function projectPedidoEstadoChanged(
  pedido: PedidoConDetalle,
  estadoAnterior: EstadoPedido,
): Promise<void> {
  if (shouldUseMockData()) return

  try {
    const { nombreEstablecimiento, nombreCliente } = await denormalizarNombres(pedido)

    const pedidoPorClienteRow: PedidoPorClienteRow = {
      id_cliente: pedido.idCliente,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
      estado: pedido.estado,
      id_establecimiento: pedido.idEstablecimiento,
      id_repartidor: pedido.idRepartidor ?? 0,
      nombre_establecimiento: nombreEstablecimiento,
      total: pedido.total,
    }

    const pedidoPorLocalRow: PedidoPorLocalRow = {
      id_establecimiento: pedido.idEstablecimiento,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
      estado: pedido.estado,
      id_cliente: pedido.idCliente,
      nombre_cliente: nombreCliente,
      total: pedido.total,
    }

    await Promise.all([
      getTable<PedidoPorClienteRow>('pedidos_por_cliente').insertOne(pedidoPorClienteRow),
      getTable<PedidoPorLocalRow>('pedidos_por_local').insertOne(pedidoPorLocalRow),
    ])

    const pedidosPorLocalEstadoTable = getTable<PedidoPorLocalRow>('pedidos_por_local_estado')
    await pedidosPorLocalEstadoTable.deleteOne({
      id_establecimiento: pedido.idEstablecimiento,
      estado: estadoAnterior,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
    })
    await pedidosPorLocalEstadoTable.insertOne(pedidoPorLocalRow)

    if (pedido.idRepartidor != null) {
      const pedidoPorRepartidorRow = await buildPedidoPorRepartidorRow(
        pedido,
        nombreEstablecimiento,
        nombreCliente,
      )
      if (pedidoPorRepartidorRow) {
        await getTable<PedidoPorRepartidorRow>('pedidos_por_repartidor').insertOne(
          pedidoPorRepartidorRow,
        )
      }
    }

    const fecha = toFechaDia(pedido.fechaHora)
    const metricasLocalTable = getTable<MetricaDiariaLocalRow>('metricas_diarias_local')
    const metricasGlobalesTable = getTable<MetricaGlobalDiariaRow>('metricas_globales_diarias')
    const metricasRepartidorTable = getTable<MetricaDiariaRepartidorRow>(
      'metricas_diarias_repartidor',
    )
    const bucket = toMes(pedido.fechaHora)

    if (pedido.estado === EstadoPedido.Confirmado) {
      const existingLocal = await metricasLocalTable.findOne({
        id_establecimiento: pedido.idEstablecimiento,
        fecha,
      })

      if (existingLocal) {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: existingLocal.ingresos_del_dia,
          pedidos_aceptados: existingLocal.pedidos_aceptados + 1,
          pedidos_cancelados: existingLocal.pedidos_cancelados,
          total_pedidos: existingLocal.total_pedidos,
        })
      } else {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: 0,
          pedidos_aceptados: 1,
          pedidos_cancelados: 0,
          total_pedidos: 0,
        })
      }
    }

    if (pedido.estado === EstadoPedido.Cancelado) {
      const existingLocal = await metricasLocalTable.findOne({
        id_establecimiento: pedido.idEstablecimiento,
        fecha,
      })

      if (existingLocal) {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: existingLocal.ingresos_del_dia,
          pedidos_aceptados: existingLocal.pedidos_aceptados,
          pedidos_cancelados: existingLocal.pedidos_cancelados + 1,
          total_pedidos: existingLocal.total_pedidos,
        })
      } else {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: 0,
          pedidos_aceptados: 0,
          pedidos_cancelados: 1,
          total_pedidos: 0,
        })
      }

      const existingGlobal = await metricasGlobalesTable.findOne({ bucket, fecha })
      if (existingGlobal) {
        await metricasGlobalesTable.insertOne({
          bucket,
          fecha,
          ingresos_totales: existingGlobal.ingresos_totales,
          locales_activos: existingGlobal.locales_activos,
          pedidos_cancelados: existingGlobal.pedidos_cancelados + 1,
          pedidos_entregados: existingGlobal.pedidos_entregados,
          repartidores_activos: existingGlobal.repartidores_activos,
          total_pedidos: existingGlobal.total_pedidos,
        })
      } else {
        await metricasGlobalesTable.insertOne({
          bucket,
          fecha,
          ingresos_totales: 0,
          locales_activos: 1,
          pedidos_cancelados: 1,
          pedidos_entregados: 0,
          repartidores_activos: 1,
          total_pedidos: 0,
        })
      }

      if (pedido.idRepartidor != null) {
        const existingRepartidor = await metricasRepartidorTable.findOne({
          id_repartidor: pedido.idRepartidor,
          fecha,
        })

        if (existingRepartidor) {
          await metricasRepartidorTable.insertOne({
            id_repartidor: pedido.idRepartidor,
            fecha,
            ingresos_del_dia: existingRepartidor.ingresos_del_dia,
            pedidos_cancelados: existingRepartidor.pedidos_cancelados + 1,
            pedidos_entregados: existingRepartidor.pedidos_entregados,
          })
        } else {
          await metricasRepartidorTable.insertOne({
            id_repartidor: pedido.idRepartidor,
            fecha,
            ingresos_del_dia: 0,
            pedidos_cancelados: 1,
            pedidos_entregados: 0,
          })
        }
      }
    }

    if (pedido.estado === EstadoPedido.Entregado) {
      const existingLocal = await metricasLocalTable.findOne({
        id_establecimiento: pedido.idEstablecimiento,
        fecha,
      })

      if (existingLocal) {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: existingLocal.ingresos_del_dia + pedido.total,
          pedidos_aceptados: existingLocal.pedidos_aceptados,
          pedidos_cancelados: existingLocal.pedidos_cancelados,
          total_pedidos: existingLocal.total_pedidos,
        })
      } else {
        await metricasLocalTable.insertOne({
          id_establecimiento: pedido.idEstablecimiento,
          fecha,
          ingresos_del_dia: pedido.total,
          pedidos_aceptados: 0,
          pedidos_cancelados: 0,
          total_pedidos: 0,
        })
      }

      if (pedido.idRepartidor != null) {
        const existingRepartidor = await metricasRepartidorTable.findOne({
          id_repartidor: pedido.idRepartidor,
          fecha,
        })

        if (existingRepartidor) {
          await metricasRepartidorTable.insertOne({
            id_repartidor: pedido.idRepartidor,
            fecha,
            ingresos_del_dia: existingRepartidor.ingresos_del_dia + TARIFA_ENVIO_REPARTIDOR,
            pedidos_cancelados: existingRepartidor.pedidos_cancelados,
            pedidos_entregados: existingRepartidor.pedidos_entregados + 1,
          })
        } else {
          await metricasRepartidorTable.insertOne({
            id_repartidor: pedido.idRepartidor,
            fecha,
            ingresos_del_dia: TARIFA_ENVIO_REPARTIDOR,
            pedidos_cancelados: 0,
            pedidos_entregados: 1,
          })
        }
      }

      const existingGlobal = await metricasGlobalesTable.findOne({ bucket, fecha })
      if (existingGlobal) {
        await metricasGlobalesTable.insertOne({
          bucket,
          fecha,
          ingresos_totales: existingGlobal.ingresos_totales + pedido.total,
          locales_activos: existingGlobal.locales_activos,
          pedidos_cancelados: existingGlobal.pedidos_cancelados,
          pedidos_entregados: existingGlobal.pedidos_entregados + 1,
          repartidores_activos: existingGlobal.repartidores_activos,
          total_pedidos: existingGlobal.total_pedidos,
        })
      } else {
        await metricasGlobalesTable.insertOne({
          bucket,
          fecha,
          ingresos_totales: pedido.total,
          locales_activos: 1,
          pedidos_cancelados: 0,
          pedidos_entregados: 1,
          repartidores_activos: 1,
          total_pedidos: 0,
        })
      }

      const mes = toMes(pedido.fechaHora)
      const rankingTable = getTable<RankingLocalMesRow>('ranking_locales_por_mes')
      const rankingRows = await rankingTable.find({ mes }).toArray()
      const filaVieja = rankingRows.find(
        (row) => row.id_establecimiento === pedido.idEstablecimiento,
      )

      if (filaVieja) {
        await rankingTable.deleteOne({
          mes,
          total_pedidos: filaVieja.total_pedidos,
          id_establecimiento: pedido.idEstablecimiento,
        })
        await rankingTable.insertOne({
          mes,
          total_pedidos: filaVieja.total_pedidos + 1,
          id_establecimiento: pedido.idEstablecimiento,
          ingresos: filaVieja.ingresos + pedido.total,
          nombre_establecimiento: filaVieja.nombre_establecimiento,
          promedio_calificacion: filaVieja.promedio_calificacion,
        })
      } else {
        await rankingTable.insertOne({
          mes,
          total_pedidos: 1,
          id_establecimiento: pedido.idEstablecimiento,
          ingresos: pedido.total,
          nombre_establecimiento: nombreEstablecimiento,
          promedio_calificacion: 0,
        })
      }
    }
  } catch (error) {
    console.error('[cassandra] proyección falló:', error)
    return
  }
}

export async function projectPedidoClaimed(pedido: PedidoConDetalle): Promise<void> {
  if (shouldUseMockData()) return
  if (pedido.idRepartidor == null) return

  try {
    const { nombreEstablecimiento, nombreCliente } = await denormalizarNombres(pedido)

    const pedidoPorRepartidorRow = await buildPedidoPorRepartidorRow(
      pedido,
      nombreEstablecimiento,
      nombreCliente,
    )
    if (pedidoPorRepartidorRow) {
      await getTable<PedidoPorRepartidorRow>('pedidos_por_repartidor').insertOne(
        pedidoPorRepartidorRow,
      )
    }

    const pedidoPorClienteRow: PedidoPorClienteRow = {
      id_cliente: pedido.idCliente,
      fecha_hora: pedido.fechaHora,
      id_pedido: pedido.idPedido,
      estado: pedido.estado,
      id_establecimiento: pedido.idEstablecimiento,
      id_repartidor: pedido.idRepartidor,
      nombre_establecimiento: nombreEstablecimiento,
      total: pedido.total,
    }

    await getTable<PedidoPorClienteRow>('pedidos_por_cliente').insertOne(pedidoPorClienteRow)
  } catch (error) {
    console.error('[cassandra] proyección falló:', error)
    return
  }
}

export async function projectCalificaciones(
  pedido: PedidoConDetalle,
  calificaciones: Calificacion[],
): Promise<void> {
  if (shouldUseMockData()) return

  try {
    const fechaHora = pedido.fechaHora

    const calificacionesLocalTable = getTable<CalificacionLocalRow>('calificaciones_local')

    for (const calificacion of calificaciones) {
      if (calificacion.tipo === TipoCalificacion.Establecimiento) {
        const row: CalificacionLocalRow = {
          id_establecimiento: pedido.idEstablecimiento,
          fecha_hora: fechaHora,
          id_calificacion: calificacion.idCalificacion,
          id_pedido: pedido.idPedido,
          puntaje: calificacion.puntaje,
          tipo: calificacion.tipo,
        }
        await calificacionesLocalTable.insertOne(row)
      }

      if (calificacion.tipo === TipoCalificacion.Repartidor) {
        if (pedido.idRepartidor == null) continue

        const row: CalificacionRepartidorRow = {
          id_repartidor: pedido.idRepartidor,
          fecha_hora: fechaHora,
          id_calificacion: calificacion.idCalificacion,
          id_pedido: pedido.idPedido,
          puntaje: calificacion.puntaje,
        }
        await getTable<CalificacionRepartidorRow>('calificaciones_repartidor').insertOne(row)
      }
    }

    const mes = toMes(fechaHora)
    const calificacionesDelMes = (
      await calificacionesLocalTable
        .find({ id_establecimiento: pedido.idEstablecimiento })
        .toArray()
    ).filter((row) => toMes(parseDate(row.fecha_hora)) === mes)

    const promedioCalificacion =
      calificacionesDelMes.length > 0
        ? calificacionesDelMes.reduce((sum, row) => sum + row.puntaje, 0) /
          calificacionesDelMes.length
        : 0

    const rankingTable = getTable<RankingLocalMesRow>('ranking_locales_por_mes')
    const rankingRows = await rankingTable.find({ mes }).toArray()
    const filaVieja = rankingRows.find(
      (row) => row.id_establecimiento === pedido.idEstablecimiento,
    )

    if (filaVieja) {
      await rankingTable.deleteOne({
        mes,
        total_pedidos: filaVieja.total_pedidos,
        id_establecimiento: pedido.idEstablecimiento,
      })
      await rankingTable.insertOne({
        ...filaVieja,
        promedio_calificacion: promedioCalificacion,
      })
    } else {
      const { nombreEstablecimiento } = await denormalizarNombres(pedido)
      await rankingTable.insertOne({
        mes,
        total_pedidos: 1,
        id_establecimiento: pedido.idEstablecimiento,
        ingresos: pedido.total,
        nombre_establecimiento: nombreEstablecimiento,
        promedio_calificacion: promedioCalificacion,
      })
    }
  } catch (error) {
    console.error('[cassandra] proyección falló:', error)
    return
  }
}
