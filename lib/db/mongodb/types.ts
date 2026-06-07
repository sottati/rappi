import type { ObjectId } from 'mongodb'

export interface RestaurantCatalogProduct {
  idProducto: number
  nombre: string
  descripcion: string
  precio: number
  promocionPorcentaje: number
  disponible: boolean
  foto: string
  tags?: string[]
  opciones?: Array<{
    nombre: string
    valores: string[]
  }>
}

export interface RestaurantCatalogCategory {
  nombre: string
  orden: number
  productos: RestaurantCatalogProduct[]
}

export interface RestaurantCatalog {
  _id?: ObjectId
  idEstablecimiento: number
  nombre: string
  tipo: string
  categorias: RestaurantCatalogCategory[]
  updatedAt: Date
}

export interface RestaurantCatalogProductLookup {
  catalog: RestaurantCatalog
  categoria: RestaurantCatalogCategory
  producto: RestaurantCatalogProduct
}

export interface Review {
  _id?: ObjectId
  restaurantId: string
  userId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface UserActivity {
  _id?: ObjectId
  userId: string
  action: string
  metadata: Record<string, unknown>
  createdAt: Date
}
