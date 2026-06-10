export type CqlDate = string | { year: number; month: number; date: number }
export type DateLike = Date | string

export interface PedidoPorClienteRow {
  id_cliente: number
  fecha_hora: DateLike
  id_pedido: number
  estado: string
  id_establecimiento: number
  id_repartidor: number
  nombre_establecimiento: string
  total: number
}

export interface PedidoPorLocalRow {
  id_establecimiento: number
  fecha_hora: DateLike
  id_pedido: number
  estado: string
  id_cliente: number
  nombre_cliente: string
  total: number
}

export interface PedidoPorRepartidorRow {
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

export interface CalificacionLocalRow {
  id_establecimiento: number
  fecha_hora: DateLike
  id_calificacion: number
  id_pedido: number
  puntaje: number
  tipo: string
}

export interface CalificacionRepartidorRow {
  id_repartidor: number
  fecha_hora: DateLike
  id_calificacion: number
  id_pedido: number
  puntaje: number
}

export interface MetricaDiariaLocalRow {
  id_establecimiento: number
  fecha: CqlDate
  ingresos_del_dia: number
  pedidos_aceptados: number
  pedidos_cancelados: number
  total_pedidos: number
}

export interface MetricaDiariaRepartidorRow {
  id_repartidor: number
  fecha: CqlDate
  ingresos_del_dia: number
  pedidos_cancelados: number
  pedidos_entregados: number
}

export interface MetricaGlobalDiariaRow {
  bucket: string
  fecha: CqlDate
  ingresos_totales: number
  locales_activos: number
  pedidos_cancelados: number
  pedidos_entregados: number
  repartidores_activos: number
  total_pedidos: number
}

export interface RankingLocalMesRow {
  mes: string
  total_pedidos: number
  id_establecimiento: number
  ingresos: number
  nombre_establecimiento: string
  promedio_calificacion: number
}
