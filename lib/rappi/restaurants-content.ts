const logo = (path: string) =>
  `https://images.rappi.com.ar/restaurants_logo/${path}?e=webp&d=150x150&q=50`

const cover = (path: string) =>
  `https://images.rappi.com.ar/restaurants_background/${path}?e=webp&d=400x300&q=60`

export type RestaurantFilterId = 'promos' | 'rating' | 'fast' | 'new'

export type RestaurantSortId = 'relevance' | 'rating' | 'deliveryTime' | 'deliveryFee'

export interface RestaurantListing {
  id: string
  /** Id del DLR (PostgreSQL) cuando el local tiene página de detalle. */
  idEstablecimiento?: number
  name: string
  coverSrc: string
  logoSrc: string
  deliveryMinutes: number
  deliveryFee: number
  rating: number
  hasPromo?: boolean
  isNew?: boolean
}

export const restaurantFilterOptions = [
  { id: 'promos' as const, label: 'Promos' },
  { id: 'rating' as const, label: '+ 4.5' },
  { id: 'fast' as const, label: '35 mins' },
  { id: 'new' as const, label: '¡Nuevos!' },
] satisfies readonly { id: RestaurantFilterId; label: string }[]

export const restaurantSortOptions = [
  { id: 'relevance' as const, label: 'Relevancia' },
  { id: 'rating' as const, label: 'Mejor calificación' },
  { id: 'deliveryTime' as const, label: 'Menor tiempo' },
  { id: 'deliveryFee' as const, label: 'Menor costo de envío' },
] satisfies readonly { id: RestaurantSortId; label: string }[]

/** Listado mock para /restaurantes (UI pública, sin Postgres aún). */
export const nearbyRestaurants: readonly RestaurantListing[] = [
  {
    id: 'mcdonalds',
    name: "McDonald's",
    logoSrc: logo('mcdonalds-1600092917510-1617128080018.png'),
    coverSrc: cover('mcdonalds-1600092917510-1617128080018.png'),
    deliveryMinutes: 13,
    deliveryFee: 1790,
    rating: 4.8,
    hasPromo: true,
  },
  {
    id: 'mostaza',
    name: 'Mostaza',
    logoSrc: logo('logo-1663343387541.png'),
    coverSrc: cover('logo-1663343387541.png'),
    deliveryMinutes: 18,
    deliveryFee: 1490,
    rating: 4.6,
    hasPromo: true,
  },
  {
    id: 'burger-king',
    name: 'Burger King',
    logoSrc: logo('burger-1610076086158.png'),
    coverSrc: cover('burger-1610076086158.png'),
    deliveryMinutes: 22,
    deliveryFee: 1890,
    rating: 4.5,
  },
  {
    id: 'grido',
    name: 'Grido',
    logoSrc: logo('gridito-1615398972244.png'),
    coverSrc: cover('gridito-1615398972244.png'),
    deliveryMinutes: 28,
    deliveryFee: 1290,
    rating: 4.7,
    hasPromo: true,
  },
  {
    id: 'milanesa',
    name: 'El Club de la Milanesa',
    logoSrc: logo('logooo-1673035573537.png'),
    coverSrc: cover('logooo-1673035573537.png'),
    deliveryMinutes: 35,
    deliveryFee: 2190,
    rating: 4.9,
  },
  {
    id: 'nicolo',
    name: 'Nicolo Helados',
    logoSrc: logo('lo-1643662505967.png'),
    coverSrc: cover('lo-1643662505967.png'),
    deliveryMinutes: 20,
    deliveryFee: 990,
    rating: 4.8,
    isNew: true,
  },
  {
    id: 'rapanui',
    name: 'Rapanui',
    logoSrc: logo('rapa-1625747937080.png'),
    coverSrc: cover('rapa-1625747937080.png'),
    deliveryMinutes: 25,
    deliveryFee: 1590,
    rating: 4.9,
    hasPromo: true,
  },
  {
    id: 'kfc',
    name: 'KFC',
    logoSrc: logo('114941-1557841048.png'),
    coverSrc: cover('114941-1557841048.png'),
    deliveryMinutes: 16,
    deliveryFee: 1790,
    rating: 4.4,
  },
  {
    id: 'subway',
    name: 'Subway',
    logoSrc: logo('113797-1545308320.png'),
    coverSrc: cover('113797-1545308320.png'),
    deliveryMinutes: 19,
    deliveryFee: 1390,
    rating: 4.3,
  },
  {
    id: 'cremolatti',
    name: 'Cremolatti',
    logoSrc: logo('cremolatti-1581946239598.png'),
    coverSrc: cover('cremolatti-1581946239598.png'),
    deliveryMinutes: 24,
    deliveryFee: 1190,
    rating: 4.6,
    isNew: true,
  },
] as const
