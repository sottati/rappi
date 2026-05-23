export interface Establecimiento {
  idEstablecimiento: number
  nombre: string
  tipo: string
  direccion: string
  email: string
  telefono: string
}

export interface Producto {
  idProducto: number
  idEstablecimiento: number
  nombre: string
  descripcion: string
  precio: number
  promocionPorcentaje: number
  disponible: boolean
  foto: string
}

export interface Cliente {
  idCliente: number
  nombre: string
  apellido: string
  email: string
  telefono: string
}

export interface DireccionEntrega {
  idDireccion: number
  idCliente: number
  calle: string
  numero: string
  ciudad: string
  codigoPostal: string
}

export interface Repartidor {
  idRepartidor: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  disponible: boolean
  coordenadaActual: number
}

export enum EstadoPedido {
  Pendiente = 'pendiente',
  Confirmado = 'confirmado',
  Preparando = 'preparando',
  EnCamino = 'en_camino',
  Entregado = 'entregado',
  Cancelado = 'cancelado',
}

export interface Pedido {
  idPedido: number
  idCliente: number
  idEstablecimiento: number
  idRepartidor: number | null
  idDireccion: number
  fechaHora: Date
  estado: EstadoPedido
  total: number
}

export interface DetallePedido {
  idDetalle: number
  idPedido: number
  idProducto: number
  cantidad: number
  precioUnitario: number
}

export interface PedidoConDetalle extends Pedido {
  detalles: DetallePedido[]
}

export enum TipoCalificacion {
  Establecimiento = 'establecimiento',
  Repartidor = 'repartidor',
}

export interface Calificacion {
  idCalificacion: number
  idPedido: number
  tipo: TipoCalificacion
  puntaje: number
}

export type Restaurant = Establecimiento
export type Product = Producto
export type User = Cliente
export type DeliveryPerson = Repartidor
export type OrderStatus = EstadoPedido
export const OrderStatus = EstadoPedido
export type OrderItem = DetallePedido
export type Order = PedidoConDetalle
