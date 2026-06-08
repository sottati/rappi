import type {
  CatalogProductInput,
  RestaurantCatalog,
  RestaurantCatalogCategory,
  RestaurantCatalogProduct,
} from '@/lib/db/mongodb/types'

export function nextCatalogProductId(catalog: RestaurantCatalog): number {
  let max = 0

  for (const categoria of catalog.categorias) {
    for (const producto of categoria.productos) {
      if (producto.idProducto > max) {
        max = producto.idProducto
      }
    }
  }

  return max + 1
}

export function ensureCatalogCategory(
  catalog: RestaurantCatalog,
  categoriaNombre: string
): RestaurantCatalogCategory {
  const normalized = categoriaNombre.trim()
  const existing = catalog.categorias.find(
    (categoria) => categoria.nombre.toLowerCase() === normalized.toLowerCase()
  )

  if (existing) {
    return existing
  }

  const orden =
    catalog.categorias.reduce((max, categoria) => Math.max(max, categoria.orden), 0) +
    1

  const categoria: RestaurantCatalogCategory = {
    nombre: normalized,
    orden,
    productos: [],
  }

  catalog.categorias.push(categoria)
  return categoria
}

export function buildCatalogProduct(input: CatalogProductInput): RestaurantCatalogProduct {
  return {
    idProducto: 0,
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    precio: input.precio,
    promocionPorcentaje: input.promocionPorcentaje,
    disponible: input.disponible,
    foto: input.foto.trim(),
  }
}

export function flattenCatalogProducts(catalog: RestaurantCatalog) {
  return catalog.categorias.flatMap((categoria) =>
    categoria.productos.map((producto) => ({
      producto,
      categoriaNombre: categoria.nombre,
    }))
  )
}
