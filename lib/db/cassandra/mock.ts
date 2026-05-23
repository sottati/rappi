import type { DeliveryTrackingPoint, OrderEvent } from './types'

export const mockOrderEvents: OrderEvent[] = [
  {
    orderId: 'ord_001',
    eventId: 'evt_001',
    status: 'created',
    source: 'postgres.orders',
    payload: { total: 12000 },
    createdAt: new Date('2026-05-20T17:45:00Z'),
  },
  {
    orderId: 'ord_001',
    eventId: 'evt_002',
    status: 'in_transit',
    source: 'delivery.dispatch',
    payload: { deliveryPersonId: 'del_001' },
    createdAt: new Date('2026-05-20T18:04:00Z'),
  },
]

export const mockDeliveryTrackingPoints: DeliveryTrackingPoint[] = [
  {
    deliveryPersonId: 'del_001',
    orderId: 'ord_001',
    latitude: -34.5889,
    longitude: -58.4306,
    recordedAt: new Date('2026-05-20T18:05:00Z'),
  },
  {
    deliveryPersonId: 'del_001',
    orderId: 'ord_001',
    latitude: -34.5901,
    longitude: -58.425,
    recordedAt: new Date('2026-05-20T18:02:00Z'),
  },
]
