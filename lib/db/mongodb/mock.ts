import type { Review, UserActivity } from './types'

export const mockReviews: Review[] = [
  {
    restaurantId: 'rest_001',
    userId: 'usr_001',
    rating: 5,
    comment: 'Llego rapido y caliente.',
    createdAt: new Date('2026-05-20T16:20:00Z'),
  },
  {
    restaurantId: 'rest_002',
    userId: 'usr_002',
    rating: 4,
    comment: 'Buena promo, demora aceptable.',
    createdAt: new Date('2026-05-20T15:40:00Z'),
  },
]

export const mockUserActivity: UserActivity[] = [
  {
    userId: 'usr_001',
    action: 'order_created',
    metadata: { orderId: 'ord_001', channel: 'web' },
    createdAt: new Date('2026-05-20T17:45:00Z'),
  },
  {
    userId: 'usr_001',
    action: 'restaurant_viewed',
    metadata: { restaurantId: 'rest_001' },
    createdAt: new Date('2026-05-20T17:38:00Z'),
  },
]
