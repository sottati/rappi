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
