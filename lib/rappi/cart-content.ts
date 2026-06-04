const logo = (path: string) =>
  `https://images.rappi.com.ar/restaurants_logo/${path}?e=webp&d=150x150&q=50`

export interface CartLineItem {
  id: string
  name: string
  description?: string
  unitPrice: number
  quantity: number
  imageSrc?: string
}

export const formatArs = (amount: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)

export function getCartItemCount(cart: Pick<MockCart, 'items'>) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartSubtotal(cart: Pick<MockCart, 'items'>) {
  return cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function getCartTotal(cart: Pick<MockCart, 'items' | 'deliveryFee' | 'serviceFee'>) {
  return getCartSubtotal(cart) + cart.deliveryFee + cart.serviceFee
}

export interface MockCart {
  restaurantId: string
  restaurantName: string
  restaurantLogoSrc: string
  deliveryMinutes: number
  deliveryFee: number
  serviceFee: number
  addressLabel: string
  addressDetail: string
  items: readonly CartLineItem[]
}

/** Carrito mock para /carrito (un solo local, UI pública). */
export const mockCart: MockCart = {
  restaurantId: 'mcdonalds',
  restaurantName: "McDonald's",
  restaurantLogoSrc: logo('mcdonalds-1600092917510-1617128080018.png'),
  deliveryMinutes: 13,
  deliveryFee: 1790,
  serviceFee: 490,
  addressLabel: 'Casa',
  addressDetail: 'Av. Corrientes 1234, Piso 3 · CABA',
  items: [
    {
      id: 'big-mac',
      name: 'Big Mac',
      description: 'Mediana · Sin cebolla',
      unitPrice: 9200,
      quantity: 1,
      imageSrc:
        'https://images.rappi.com.ar/rests_taxonomy/3b2189f4-54bc-47e5-8e69-ad8073de60a8.png?e=webp&d=80x80&q=50',
    },
    {
      id: 'papas',
      name: 'Papas fritas grandes',
      description: 'Con salsa BBQ',
      unitPrice: 4200,
      quantity: 1,
      imageSrc:
        'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&d=80x80&q=50',
    },
    {
      id: 'coca',
      name: 'Coca-Cola 500 ml',
      unitPrice: 2800,
      quantity: 2,
      imageSrc:
        'https://images.rappi.com.ar/rests_taxonomy/86b14807-e9f4-4e58-bc94-9d512839e646.png?e=webp&d=80x80&q=50',
    },
  ],
}

/** Datos estáticos para la pantalla de confirmación (mock, sin persistencia). */
export const mockOrderConfirmation = {
  orderId: 'RAP-MCK42A',
  confirmedAtLabel: '3 jun 2026, 14:30',
} as const
