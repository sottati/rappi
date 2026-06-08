export interface DeliveryLocation {
  deliveryPersonId: string
  latitude: number
  longitude: number
  updatedAt: Date
}

export interface OrderStatusCache {
  orderId: string
  status: string
  ttlSeconds: number
}

export interface AvailableOrderSnapshot {
  idPedido: number
  estado: string
  fechaHora: Date
  total: number
  idEstablecimiento: number
  establecimientoNombre: string
  direccionResumen: string
  itemCount: number
}
