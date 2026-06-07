import type { RestaurantCatalog, Review, UserActivity } from './types'

export const mockRestaurantCatalogs: RestaurantCatalog[] = [
  {
    idEstablecimiento: 1,
    nombre: 'Burger Palermo',
    tipo: 'restaurante',
    categorias: [
      {
        nombre: 'Hamburguesas y acompanamientos',
        orden: 1,
        productos: [
          {
            idProducto: 1,
            nombre: 'Doble Smash Palermo',
            descripcion:
              'Doble carne, cheddar, pickles y salsa house en pan brioche.',
            precio: 9200,
            promocionPorcentaje: 0,
            disponible: true,
            foto: 'https://images.rappi.com.ar/rests_taxonomy/3b2189f4-54bc-47e5-8e69-ad8073de60a8.png?e=webp&d=200x200&q=50',
            tags: ['hamburguesa', 'demo'],
          },
          {
            idProducto: 2,
            nombre: 'Papas cheddar',
            descripcion: 'Papas fritas con cheddar fundido y verdeo.',
            precio: 2800,
            promocionPorcentaje: 15,
            disponible: true,
            foto: 'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&d=200x200&q=50',
            tags: ['acompanamiento', 'promo'],
          },
        ],
      },
    ],
    updatedAt: new Date('2026-05-20T17:45:00Z'),
  },
  {
    idEstablecimiento: 2,
    nombre: 'Sushi Centro',
    tipo: 'restaurante',
    categorias: [
      {
        nombre: 'Pokes y ensaladas',
        orden: 1,
        productos: [
          {
            idProducto: 3,
            nombre: 'Ensalada Poke',
            descripcion: 'Ensalada de arroz con palta y salmon',
            precio: 15000,
            promocionPorcentaje: 0,
            disponible: true,
            foto: 'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&d=200x200&q=50',
            tags: ['poke', 'sushi'],
          },
        ],
      },
    ],
    updatedAt: new Date('2026-05-20T17:45:00Z'),
  },
]

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
