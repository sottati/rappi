import type { Establecimiento, Producto } from '@/types/domain'

import type { RestaurantListing } from './restaurants-content'

const logo = (path: string) =>
  `https://images.rappi.com.ar/restaurants_logo/${path}?e=webp&d=150x150&q=50`

const cover = (path: string) =>
  `https://images.rappi.com.ar/restaurants_background/${path}?e=webp&d=800x400&q=60`

export interface EstablishmentPresentation {
  coverSrc?: string
  logoSrc?: string
  deliveryMinutes?: number
  deliveryFee?: number
  rating?: number
}

export interface EstablishmentCatalog {
  establecimiento: Establecimiento
  productos: Producto[]
}

/** Mock estático del DLR para pantallas públicas (sin Postgres). */
export const mockEstablishmentCatalogs: Record<number, EstablishmentCatalog> = {
  1: {
    establecimiento: {
      idEstablecimiento: 1,
      nombre: 'Burger Palermo',
      tipo: 'restaurante',
      direccion: 'Av. Santa Fe 3200, CABA',
      email: 'palermo@burger.example',
      telefono: '+54 11 5555-2001',
    },
    productos: [
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
    ],
  },
}

/** Locales con menú mock linkeables desde /restaurantes. */
export const catalogRestaurants: readonly RestaurantListing[] = [
  {
    id: 'burger-palermo',
    idEstablecimiento: 1,
    name: 'Burger Palermo',
    logoSrc: logo('burger-1610076086158.png'),
    coverSrc: cover('burger-1610076086158.png'),
    deliveryMinutes: 32,
    deliveryFee: 990,
    rating: 4.7,
    hasPromo: true,
    isNew: true,
  },
]

export function getMockEstablishmentCatalog(
  idEstablecimiento: number,
): EstablishmentCatalog | null {
  return mockEstablishmentCatalogs[idEstablecimiento] ?? null
}

/** Enriquecimiento mock de UI para la vista de detalle de producto. */
export interface ProductoPresentacion {
  categoria: string
  ingredientes: readonly string[]
  nota?: string
}

export const mockProductoPresentacion: Record<number, ProductoPresentacion> = {
  1: {
    categoria: 'Hamburguesas',
    ingredientes: [
      'Doble medallón smash 90 g',
      'Cheddar',
      'Pickles',
      'Salsa house',
      'Pan brioche',
    ],
    nota: 'Medallones a la plancha. Podés pedir sin pickles.',
  },
  2: {
    categoria: 'Acompañamientos',
    ingredientes: ['Papas fritas', 'Cheddar fundido', 'Verdeo'],
    nota: 'Porción individual. Promo -15% por tiempo limitado.',
  },
}

export interface ProductoDetalle {
  producto: Producto
  establecimiento: Establecimiento
  presentacion: ProductoPresentacion
}

export function getMockProductoDetalle(
  idEstablecimiento: number,
  idProducto: number,
): ProductoDetalle | null {
  const catalog = getMockEstablishmentCatalog(idEstablecimiento)
  if (!catalog) return null

  const producto = catalog.productos.find((item) => item.idProducto === idProducto)
  if (!producto) return null

  const presentacion = mockProductoPresentacion[idProducto]
  if (!presentacion) return null

  return {
    producto,
    establecimiento: catalog.establecimiento,
    presentacion,
  }
}

export function getProductoPath(idEstablecimiento: number, idProducto: number) {
  return `/restaurantes/${idEstablecimiento}/productos/${idProducto}`
}
