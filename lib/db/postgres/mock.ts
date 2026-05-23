import type {
  DetallePedido,
  Establecimiento,
  PedidoConDetalle,
  Repartidor,
} from '@/types/domain'
import { EstadoPedido } from '@/types/domain'

export const mockEstablecimientos: Establecimiento[] = [
  {
    idEstablecimiento: 1,
    nombre: 'Burger Palermo',
    tipo: 'restaurante',
    direccion: 'Av. Santa Fe 3200, CABA',
    email: 'palermo@burger.example',
    telefono: '+54 11 5555-2001',
  },
  {
    idEstablecimiento: 2,
    nombre: 'Sushi Centro',
    tipo: 'restaurante',
    direccion: 'Florida 650, CABA',
    email: 'centro@sushi.example',
    telefono: '+54 11 5555-2002',
  },
]

export const mockRepartidores: Repartidor[] = [
  {
    idRepartidor: 1,
    nombre: 'Lucia',
    apellido: 'Gomez',
    email: 'lucia.gomez@example.com',
    telefono: '+54 11 5555-1001',
    disponible: true,
    coordenadaActual: -34.5889,
  },
  {
    idRepartidor: 2,
    nombre: 'Mateo',
    apellido: 'Ruiz',
    email: 'mateo.ruiz@example.com',
    telefono: '+54 11 5555-1002',
    disponible: true,
    coordenadaActual: -34.6037,
  },
]

export const mockDetallesPedido: DetallePedido[] = [
  {
    idDetalle: 1,
    idPedido: 1,
    idProducto: 1,
    cantidad: 1,
    precioUnitario: 9200,
  },
  {
    idDetalle: 2,
    idPedido: 1,
    idProducto: 2,
    cantidad: 1,
    precioUnitario: 2800,
  },
  {
    idDetalle: 3,
    idPedido: 2,
    idProducto: 10,
    cantidad: 1,
    precioUnitario: 18500,
  },
]

export const mockPedidos: PedidoConDetalle[] = [
  {
    idPedido: 1,
    idCliente: 1,
    idEstablecimiento: 1,
    idRepartidor: 1,
    idDireccion: 1,
    fechaHora: new Date('2026-05-20T17:45:00Z'),
    estado: EstadoPedido.EnCamino,
    total: 12000,
    detalles: mockDetallesPedido.filter((detalle) => detalle.idPedido === 1),
  },
  {
    idPedido: 2,
    idCliente: 2,
    idEstablecimiento: 2,
    idRepartidor: null,
    idDireccion: 2,
    fechaHora: new Date('2026-05-20T17:58:00Z'),
    estado: EstadoPedido.Preparando,
    total: 18500,
    detalles: mockDetallesPedido.filter((detalle) => detalle.idPedido === 2),
  },
]

export const mockRestaurants = mockEstablecimientos
export const mockDeliveryPersons = mockRepartidores
export const mockOrders = mockPedidos
