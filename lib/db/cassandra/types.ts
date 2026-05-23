export interface OrderEvent {
  orderId: string
  eventId: string
  status: string
  source: string
  payload: Record<string, unknown>
  createdAt: Date
}

export interface DeliveryTrackingPoint {
  deliveryPersonId: string
  orderId: string
  latitude: number
  longitude: number
  recordedAt: Date
}
