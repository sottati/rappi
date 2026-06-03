export interface PedidoPorCliente {
  idCliente: number
  fechaHora: Date
  idPedido: number
  estado: string
  idEstablecimiento: number
  idRepartidor: number
  nombreEstablecimiento: string
  total: number
}

export interface PedidoPorLocal {
  idEstablecimiento: number
  fechaHora: Date
  idPedido: number
  estado: string
  idCliente: number
  nombreCliente: string
  total: number
}

export type PedidoPorLocalEstado = PedidoPorLocal

export interface PedidoPorRepartidor {
  idRepartidor: number
  fechaHora: Date
  idPedido: number
  direccionEntrega: string
  estado: string
  idCliente: number
  idEstablecimiento: number
  nombreCliente: string
  nombreEstablecimiento: string
  telefonoCliente: string
  total: number
}

export interface CalificacionLocal {
  idEstablecimiento: number
  fechaHora: Date
  idCalificacion: number
  idPedido: number
  puntaje: number
  tipo: string
}

export interface CalificacionRepartidor {
  idRepartidor: number
  fechaHora: Date
  idCalificacion: number
  idPedido: number
  puntaje: number
}

export interface MetricaDiariaLocal {
  idEstablecimiento: number
  fecha: string
  ingresosDelDia: number
  pedidosAceptados: number
  pedidosCancelados: number
  totalPedidos: number
}

export interface MetricaDiariaRepartidor {
  idRepartidor: number
  fecha: string
  ingresosDelDia: number
  pedidosCancelados: number
  pedidosEntregados: number
}

export interface MetricaGlobalDiaria {
  bucket: string
  fecha: string
  ingresosTotales: number
  localesActivos: number
  pedidosCancelados: number
  pedidosEntregados: number
  repartidoresActivos: number
  totalPedidos: number
}

export interface RankingLocalMes {
  mes: string
  totalPedidos: number
  idEstablecimiento: number
  ingresos: number
  nombreEstablecimiento: string
  promedioCalificacion: number
}
