import { EstadoPedido } from '@/types/domain'

export interface MockPedidoLinea {
  idDetalle: number
  idProducto: number
  nombreProducto: string
  cantidad: number
  precioUnitario: number
}

export interface MockDireccionEntrega {
  label: string
  calle: string
  numero: string
  ciudad: string
  codigoPostal: string
}

export interface MockPedidoVista {
  idPedido: number
  idCliente: number
  idEstablecimiento: number
  idRepartidor: number | null
  fechaHora: Date
  estado: EstadoPedido
  total: number
  establecimientoNombre: string
  repartidorNombre: string | null
  direccion: MockDireccionEntrega
  lineas: MockPedidoLinea[]
}

/** Pedidos mock enriquecidos para UI (sin Postgres). */
export const mockPedidosVista: MockPedidoVista[] = [
  {
    idPedido: 1,
    idCliente: 1,
    idEstablecimiento: 1,
    idRepartidor: 1,
    fechaHora: new Date('2026-06-03T14:30:00Z'),
    estado: EstadoPedido.EnCamino,
    total: 12000,
    establecimientoNombre: 'Burger Palermo',
    repartidorNombre: 'Lucia Gomez',
    direccion: {
      label: 'Casa',
      calle: 'Av. Corrientes',
      numero: '1234',
      ciudad: 'CABA',
      codigoPostal: 'C1043',
    },
    lineas: [
      {
        idDetalle: 1,
        idProducto: 1,
        nombreProducto: 'Doble Smash Palermo',
        cantidad: 1,
        precioUnitario: 9200,
      },
      {
        idDetalle: 2,
        idProducto: 2,
        nombreProducto: 'Papas cheddar',
        cantidad: 1,
        precioUnitario: 2800,
      },
    ],
  },
  {
    idPedido: 2,
    idCliente: 2,
    idEstablecimiento: 2,
    idRepartidor: null,
    fechaHora: new Date('2026-06-03T15:10:00Z'),
    estado: EstadoPedido.Preparando,
    total: 18500,
    establecimientoNombre: 'Sushi Centro',
    repartidorNombre: null,
    direccion: {
      label: 'Oficina',
      calle: 'Florida',
      numero: '650',
      ciudad: 'CABA',
      codigoPostal: 'C1005',
    },
    lineas: [
      {
        idDetalle: 3,
        idProducto: 10,
        nombreProducto: 'Combo sashimi 24 piezas',
        cantidad: 1,
        precioUnitario: 18500,
      },
    ],
  },
  {
    idPedido: 3,
    idCliente: 1,
    idEstablecimiento: 1,
    idRepartidor: 1,
    fechaHora: new Date('2026-05-28T20:15:00Z'),
    estado: EstadoPedido.Entregado,
    total: 9200,
    establecimientoNombre: 'Burger Palermo',
    repartidorNombre: 'Lucia Gomez',
    direccion: {
      label: 'Casa',
      calle: 'Av. Corrientes',
      numero: '1234',
      ciudad: 'CABA',
      codigoPostal: 'C1043',
    },
    lineas: [
      {
        idDetalle: 4,
        idProducto: 1,
        nombreProducto: 'Doble Smash Palermo',
        cantidad: 1,
        precioUnitario: 9200,
      },
    ],
  },
]

/** Admin mock: dueño de Burger Palermo (establecimiento 1). */
export const mockAdminEstablecimientoId = 1

export const mockUsuarioClienteId = 1
export const mockRepartidorId = 1

export function getMockPedidoById(idPedido: number): MockPedidoVista | null {
  return mockPedidosVista.find((pedido) => pedido.idPedido === idPedido) ?? null
}

export function getMockPedidosByCliente(idCliente: number): MockPedidoVista[] {
  return mockPedidosVista
    .filter((pedido) => pedido.idCliente === idCliente)
    .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
}

export function getMockPedidosByEstablecimiento(idEstablecimiento: number): MockPedidoVista[] {
  return mockPedidosVista
    .filter((pedido) => pedido.idEstablecimiento === idEstablecimiento)
    .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
}

export function getMockPedidosByRepartidor(idRepartidor: number): MockPedidoVista[] {
  return mockPedidosVista
    .filter((pedido) => pedido.idRepartidor === idRepartidor)
    .sort((a, b) => b.fechaHora.getTime() - a.fechaHora.getTime())
}

export function getUsuarioPedidoPath(idPedido: number) {
  return `/usuario/pedidos/${idPedido}`
}

export function getAdminPedidoPath(idPedido: number) {
  return `/admin/pedidos/${idPedido}`
}

export function getRepartidorPedidoPath(idPedido: number) {
  return `/repartidor/pedidos/${idPedido}`
}

export const estadoPedidoLabels: Record<EstadoPedido, string> = {
  [EstadoPedido.Pendiente]: 'Pendiente',
  [EstadoPedido.Confirmado]: 'Confirmado',
  [EstadoPedido.Preparando]: 'Preparando',
  [EstadoPedido.EnCamino]: 'En camino',
  [EstadoPedido.Entregado]: 'Entregado',
  [EstadoPedido.Cancelado]: 'Cancelado',
}

export const formatPedidoFecha = (fecha: Date) =>
  new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fecha)

export interface AdminDashboardKpi {
  label: string
  value: string
  detail?: string
  trend?: string
}

export interface AdminDashboardChartPoint {
  label: string
  value: number
}

export interface AdminDashboardMock {
  kpis: AdminDashboardKpi[]
  pedidosPorDia: AdminDashboardChartPoint[]
  facturacionPorDia: AdminDashboardChartPoint[]
}

/** KPIs y gráficos mock para /admin. */
export const mockAdminDashboard: AdminDashboardMock = {
  kpis: [
    { label: 'Pedidos hoy', value: '12', detail: 'Burger Palermo', trend: '+8% vs ayer' },
    { label: 'Facturación hoy', value: '$156.800', trend: '+12% vs ayer' },
    { label: 'Ticket promedio', value: '$13.067', detail: 'Últimas 24 h' },
    { label: 'Tiempo entrega', value: '28 min', detail: 'Promedio del local' },
    { label: 'Calificación', value: '4.7', detail: 'Últimos 30 días' },
    { label: 'Cancelaciones', value: '2%', trend: '-0.5% vs semana' },
  ],
  pedidosPorDia: [
    { label: 'Lun', value: 8 },
    { label: 'Mar', value: 11 },
    { label: 'Mié', value: 9 },
    { label: 'Jue', value: 14 },
    { label: 'Vie', value: 18 },
    { label: 'Sáb', value: 22 },
    { label: 'Dom', value: 12 },
  ],
  facturacionPorDia: [
    { label: 'Lun', value: 98000 },
    { label: 'Mar', value: 124000 },
    { label: 'Mié', value: 102000 },
    { label: 'Jue', value: 148000 },
    { label: 'Vie', value: 192000 },
    { label: 'Sáb', value: 210000 },
    { label: 'Dom', value: 156800 },
  ],
}
