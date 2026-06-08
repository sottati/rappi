import type {
  CuentaApp,
  DetallePedido,
  DireccionEntrega,
  Establecimiento,
  PedidoConDetalle,
  Producto,
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

export const mockProductos: Producto[] = [
  {
    idProducto: 1,
    idEstablecimiento: 1,
    nombre: 'Doble Smash Palermo',
    descripcion: 'Doble carne, cheddar, pickles y salsa house en pan brioche.',
    precio: 9200,
    promocionPorcentaje: 0,
    disponible: true,
    foto: 'https://images.rappi.com.ar/rests_taxonomy/3b2189f4-54bc-47e5-8e69-ad8073de60a8.png?e=webp&d=200x200&q=50',
  },
  {
    idProducto: 2,
    idEstablecimiento: 1,
    nombre: 'Papas cheddar',
    descripcion: 'Papas fritas con cheddar fundido y verdeo.',
    precio: 2800,
    promocionPorcentaje: 15,
    disponible: true,
    foto: 'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&d=200x200&q=50',
  },
]

export const mockDireccionesEntrega: DireccionEntrega[] = [
  {
    idDireccion: 1,
    idCliente: 1,
    calle: 'Av. Corrientes',
    numero: '1234',
    ciudad: 'CABA',
    codigoPostal: 'C1043',
  },
  {
    idDireccion: 2,
    idCliente: 2,
    calle: 'Florida',
    numero: '650',
    ciudad: 'CABA',
    codigoPostal: 'C1005',
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
    idProductoCatalogo: 1,
    nombreProducto: 'Doble Smash Palermo',
    cantidad: 1,
    precioUnitario: 9200,
  },
  {
    idDetalle: 2,
    idPedido: 1,
    idProductoCatalogo: 2,
    nombreProducto: 'Papas cheddar',
    cantidad: 1,
    precioUnitario: 2800,
  },
  {
    idDetalle: 3,
    idPedido: 2,
    idProductoCatalogo: 10,
    nombreProducto: 'Combo sushi demo',
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

/** Contraseña compartida para cuentas mock (solo desarrollo). */
export const mockTestPassword = 'test123'

export const mockCuentasApp: CuentaApp[] = [
  {
    idCuenta: 1,
    email: 'admin@burger.example',
    contrasenia: mockTestPassword,
    rol: 'admin',
    nombreVisible: 'Duenio Burger Palermo',
    idCliente: null,
    idRepartidor: null,
    idEstablecimiento: 1,
  },
  {
    idCuenta: 2,
    email: 'lucia.gomez@example.com',
    contrasenia: mockTestPassword,
    rol: 'repartidor',
    nombreVisible: 'Lucia Gomez',
    idCliente: null,
    idRepartidor: 1,
    idEstablecimiento: null,
  },
  {
    idCuenta: 3,
    email: 'ana.perez@example.com',
    contrasenia: mockTestPassword,
    rol: 'usuario',
    nombreVisible: 'Ana Perez',
    idCliente: 1,
    idRepartidor: null,
    idEstablecimiento: null,
  },
]

export const mockRestaurants = mockEstablecimientos
export const mockDeliveryPersons = mockRepartidores
export const mockOrders = mockPedidos
