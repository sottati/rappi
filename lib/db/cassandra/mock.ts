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

export const mockPedidosPorCliente: PedidoPorCliente[] = [
  {
    idCliente: 10,
    fechaHora: new Date('2026-05-01T12:00:00Z'),
    idPedido: 101,
    estado: 'entregado',
    idEstablecimiento: 1,
    idRepartidor: 7,
    nombreEstablecimiento: "McDonald's Palermo",
    total: 1500.5,
  },
  {
    idCliente: 11,
    fechaHora: new Date('2026-05-10T18:30:00Z'),
    idPedido: 102,
    estado: 'cancelado',
    idEstablecimiento: 1,
    idRepartidor: 7,
    nombreEstablecimiento: "McDonald's Palermo",
    total: 800,
  },
]

export const mockPedidosPorLocal: PedidoPorLocal[] = [
  {
    idEstablecimiento: 1,
    fechaHora: new Date('2026-05-20T20:00:00Z'),
    idPedido: 103,
    estado: 'entregado',
    idCliente: 12,
    nombreCliente: 'Luciana Bonfiglio',
    total: 2300.75,
  },
  {
    idEstablecimiento: 1,
    fechaHora: new Date('2026-05-10T18:30:00Z'),
    idPedido: 102,
    estado: 'cancelado',
    idCliente: 11,
    nombreCliente: 'Ignacio Ferreyra',
    total: 800,
  },
]

export const mockPedidosPorLocalEstado: PedidoPorLocalEstado[] =
  mockPedidosPorLocal.filter((pedido) => pedido.estado === 'entregado')

export const mockPedidosPorRepartidor: PedidoPorRepartidor[] = [
  {
    idRepartidor: 7,
    fechaHora: new Date('2026-05-20T20:00:00Z'),
    idPedido: 103,
    direccionEntrega: 'Av. Santa Fe 567, CABA',
    estado: 'entregado',
    idCliente: 12,
    idEstablecimiento: 1,
    nombreCliente: 'Luciana Bonfiglio',
    nombreEstablecimiento: "McDonald's Palermo",
    telefonoCliente: '1145678901',
    total: 2300.75,
  },
  {
    idRepartidor: 7,
    fechaHora: new Date('2026-05-01T12:00:00Z'),
    idPedido: 101,
    direccionEntrega: 'Av. Corrientes 1234, CABA',
    estado: 'entregado',
    idCliente: 10,
    idEstablecimiento: 1,
    nombreCliente: 'Valentina Rios',
    nombreEstablecimiento: "McDonald's Palermo",
    telefonoCliente: '1134567890',
    total: 1500.5,
  },
]

export const mockCalificacionesLocal: CalificacionLocal[] = [
  {
    idEstablecimiento: 1,
    fechaHora: new Date('2026-05-20T21:00:00Z'),
    idCalificacion: 2,
    idPedido: 103,
    puntaje: 4,
    tipo: 'comida',
  },
  {
    idEstablecimiento: 1,
    fechaHora: new Date('2026-05-01T13:00:00Z'),
    idCalificacion: 1,
    idPedido: 101,
    puntaje: 5,
    tipo: 'comida',
  },
]

export const mockCalificacionesRepartidor: CalificacionRepartidor[] = [
  {
    idRepartidor: 7,
    fechaHora: new Date('2026-05-20T21:00:00Z'),
    idCalificacion: 2,
    idPedido: 103,
    puntaje: 4,
  },
  {
    idRepartidor: 7,
    fechaHora: new Date('2026-05-01T13:00:00Z'),
    idCalificacion: 1,
    idPedido: 101,
    puntaje: 5,
  },
]

export const mockMetricasDiariasLocal: MetricaDiariaLocal[] = [
  {
    idEstablecimiento: 1,
    fecha: '2026-05-02',
    ingresosDelDia: 18750.5,
    pedidosAceptados: 10,
    pedidosCancelados: 2,
    totalPedidos: 12,
  },
  {
    idEstablecimiento: 1,
    fecha: '2026-05-01',
    ingresosDelDia: 12400,
    pedidosAceptados: 7,
    pedidosCancelados: 1,
    totalPedidos: 8,
  },
]

export const mockMetricasDiariasRepartidor: MetricaDiariaRepartidor[] = [
  {
    idRepartidor: 7,
    fecha: '2026-05-20',
    ingresosDelDia: 14500.25,
    pedidosCancelados: 1,
    pedidosEntregados: 8,
  },
  {
    idRepartidor: 7,
    fecha: '2026-05-01',
    ingresosDelDia: 9200,
    pedidosCancelados: 0,
    pedidosEntregados: 6,
  },
]

export const mockMetricasGlobalesDiarias: MetricaGlobalDiaria[] = [
  {
    bucket: '2026-05',
    fecha: '2026-05-02',
    ingresosTotales: 224800.5,
    localesActivos: 35,
    pedidosCancelados: 15,
    pedidosEntregados: 130,
    repartidoresActivos: 21,
    totalPedidos: 145,
  },
  {
    bucket: '2026-05',
    fecha: '2026-05-01',
    ingresosTotales: 185400,
    localesActivos: 32,
    pedidosCancelados: 15,
    pedidosEntregados: 105,
    repartidoresActivos: 18,
    totalPedidos: 120,
  },
]

export const mockRankingLocalesPorMes: RankingLocalMes[] = [
  {
    mes: '2026-05',
    totalPedidos: 320,
    idEstablecimiento: 1,
    ingresos: 485000,
    nombreEstablecimiento: "McDonald's Palermo",
    promedioCalificacion: 4.7,
  },
  {
    mes: '2026-05',
    totalPedidos: 280,
    idEstablecimiento: 2,
    ingresos: 392000.5,
    nombreEstablecimiento: 'Burger King Recoleta',
    promedioCalificacion: 4.4,
  },
]
