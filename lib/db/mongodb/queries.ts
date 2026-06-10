import { getDb } from './client'
import type { QueryResult } from '../helpers'
import { ok, fail, shouldUseMockData } from '../helpers'
import {
  ensureCatalogCategory,
  nextCatalogProductId,
} from '@/lib/admin/catalog-helpers'
import {
  mockRestaurantCatalogs,
  mockRestaurantProfiles,
  mockReviews,
  mockUserActivity,
} from './mock'
import type {
  CatalogProductInput,
  RestaurantCatalog,
  RestaurantCatalogProduct,
  RestaurantCatalogProductLookup,
  RestaurantProfile,
  Review,
  UserActivity,
} from './types'

function findCatalogProduct(
  catalog: RestaurantCatalog,
  idProducto: number
): RestaurantCatalogProductLookup | null {
  for (const categoria of catalog.categorias) {
    const producto = categoria.productos.find(
      (item) => item.idProducto === idProducto
    )

    if (producto) {
      return { catalog, categoria, producto }
    }
  }

  return null
}

function getMockCatalog(idEstablecimiento: number): RestaurantCatalog | null {
  return (
    mockRestaurantCatalogs.find(
      (catalog) => catalog.idEstablecimiento === idEstablecimiento
    ) ?? null
  )
}

function omitMongoId<T extends { _id?: unknown }>(doc: T): Omit<T, '_id'> {
  const { _id: _ignored, ...rest } = doc
  void _ignored
  return rest
}

async function persistCatalog(catalog: RestaurantCatalog): Promise<QueryResult<RestaurantCatalog>> {
  catalog.updatedAt = new Date()

  if (shouldUseMockData()) {
    const index = mockRestaurantCatalogs.findIndex(
      (item) => item.idEstablecimiento === catalog.idEstablecimiento
    )

    if (index >= 0) {
      mockRestaurantCatalogs[index] = catalog
    } else {
      mockRestaurantCatalogs.push(catalog)
    }

    return ok(catalog)
  }

  try {
    const db = await getDb()
    await db.collection<RestaurantCatalog>('restaurant_catalogs').updateOne(
      { idEstablecimiento: catalog.idEstablecimiento },
      { $set: omitMongoId(catalog) },
      { upsert: true }
    )
    return ok(catalog)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to save catalog')
  }
}

export async function getRestaurantCatalog(
  idEstablecimiento: number
): Promise<QueryResult<RestaurantCatalog | null>> {
  if (shouldUseMockData()) {
    return ok(getMockCatalog(idEstablecimiento))
  }

  try {
    const db = await getDb()
    const catalog = await db
      .collection<RestaurantCatalog>('restaurant_catalogs')
      .findOne({ idEstablecimiento })
    return ok(catalog)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch catalog')
  }
}

export async function getRestaurantCatalogProduct(
  idEstablecimiento: number,
  idProducto: number
): Promise<QueryResult<RestaurantCatalogProductLookup | null>> {
  const catalogResult = await getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return fail(catalogResult.error)
  }

  if (!catalogResult.data) {
    return ok(null)
  }

  return ok(findCatalogProduct(catalogResult.data, idProducto))
}

export async function getRestaurantProfile(
  idEstablecimiento: number
): Promise<QueryResult<RestaurantProfile | null>> {
  if (shouldUseMockData()) {
    return ok(
      mockRestaurantProfiles.find(
        (profile) => profile.idEstablecimiento === idEstablecimiento
      ) ?? null
    )
  }

  try {
    const db = await getDb()
    const profile = await db
      .collection<RestaurantProfile>('restaurant_profiles')
      .findOne({ idEstablecimiento })
    return ok(profile ? omitMongoId(profile) : null)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch restaurant profile')
  }
}

export async function upsertRestaurantProfile(
  idEstablecimiento: number,
  data: Pick<
    RestaurantProfile,
    'nombre' | 'descripcionComercial' | 'horarios' | 'zonasEntrega' | 'mediosPago'
  >
): Promise<QueryResult<RestaurantProfile>> {
  const profile: RestaurantProfile = {
    idEstablecimiento,
    nombre: data.nombre.trim(),
    descripcionComercial: data.descripcionComercial?.trim() || undefined,
    horarios: data.horarios,
    zonasEntrega: data.zonasEntrega,
    mediosPago: data.mediosPago,
    updatedAt: new Date(),
  }

  if (shouldUseMockData()) {
    const index = mockRestaurantProfiles.findIndex(
      (item) => item.idEstablecimiento === idEstablecimiento
    )

    if (index >= 0) {
      mockRestaurantProfiles[index] = { ...mockRestaurantProfiles[index], ...profile }
      return ok(mockRestaurantProfiles[index])
    }

    mockRestaurantProfiles.push(profile)
    return ok(profile)
  }

  try {
    const db = await getDb()
    await db.collection<RestaurantProfile>('restaurant_profiles').updateOne(
      { idEstablecimiento },
      { $set: omitMongoId(profile) },
      { upsert: true }
    )
    return ok(profile)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to upsert restaurant profile')
  }
}

export async function syncCatalogHeader(
  idEstablecimiento: number,
  nombre: string,
  tipo: string
): Promise<QueryResult<RestaurantCatalog | null>> {
  const catalogResult = await getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return fail(catalogResult.error)
  }

  if (!catalogResult.data) {
    return ok(null)
  }

  const catalog = structuredClone(catalogResult.data)
  catalog.nombre = nombre.trim()
  catalog.tipo = tipo.trim()

  const saved = await persistCatalog(catalog)
  if (saved.error || !saved.data) {
    return fail(saved.error ?? 'Failed to sync catalog header')
  }

  return ok(saved.data)
}

export async function addCatalogProduct(
  idEstablecimiento: number,
  input: CatalogProductInput
): Promise<QueryResult<RestaurantCatalogProduct>> {
  const catalogResult = await getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return fail(catalogResult.error)
  }

  let catalog = catalogResult.data

  if (!catalog) {
    catalog = {
      idEstablecimiento,
      nombre: `Local #${idEstablecimiento}`,
      tipo: 'restaurante',
      categorias: [],
      updatedAt: new Date(),
    }
  } else {
    catalog = structuredClone(catalog)
  }

  const categoria = ensureCatalogCategory(catalog, input.categoriaNombre)
  const producto: RestaurantCatalogProduct = {
    idProducto: nextCatalogProductId(catalog),
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    precio: input.precio,
    promocionPorcentaje: input.promocionPorcentaje,
    disponible: input.disponible,
    foto: input.foto.trim(),
  }

  categoria.productos.push(producto)

  const saved = await persistCatalog(catalog)
  if (saved.error) {
    return fail(saved.error)
  }

  return ok(producto)
}

export async function updateCatalogProduct(
  idEstablecimiento: number,
  idProducto: number,
  input: CatalogProductInput
): Promise<QueryResult<RestaurantCatalogProduct>> {
  const catalogResult = await getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return fail(catalogResult.error)
  }

  if (!catalogResult.data) {
    return fail('No existe un catalogo para este establecimiento.')
  }

  const catalog = structuredClone(catalogResult.data)
  const lookup = findCatalogProduct(catalog, idProducto)

  if (!lookup) {
    return fail('Producto no encontrado en el catalogo.')
  }

  const targetCategory = ensureCatalogCategory(catalog, input.categoriaNombre)

  if (targetCategory.nombre !== lookup.categoria.nombre) {
    lookup.categoria.productos = lookup.categoria.productos.filter(
      (item) => item.idProducto !== idProducto
    )
    targetCategory.productos.push(lookup.producto)
  }

  lookup.producto.nombre = input.nombre.trim()
  lookup.producto.descripcion = input.descripcion.trim()
  lookup.producto.precio = input.precio
  lookup.producto.promocionPorcentaje = input.promocionPorcentaje
  lookup.producto.disponible = input.disponible
  lookup.producto.foto = input.foto.trim()

  const saved = await persistCatalog(catalog)
  if (saved.error) {
    return fail(saved.error)
  }

  return ok(lookup.producto)
}

export async function setCatalogProductAvailability(
  idEstablecimiento: number,
  idProducto: number,
  disponible: boolean
): Promise<QueryResult<RestaurantCatalogProduct>> {
  const catalogResult = await getRestaurantCatalog(idEstablecimiento)

  if (catalogResult.error) {
    return fail(catalogResult.error)
  }

  if (!catalogResult.data) {
    return fail('No existe un catalogo para este establecimiento.')
  }

  const catalog = structuredClone(catalogResult.data)
  const lookup = findCatalogProduct(catalog, idProducto)

  if (!lookup) {
    return fail('Producto no encontrado en el catalogo.')
  }

  lookup.producto.disponible = disponible

  const saved = await persistCatalog(catalog)
  if (saved.error) {
    return fail(saved.error)
  }

  return ok(lookup.producto)
}

export async function getRestaurantReviews(
  restaurantId: string,
): Promise<QueryResult<Review[]>> {
  if (shouldUseMockData()) {
    return ok(mockReviews.filter((review) => review.restaurantId === restaurantId))
  }

  try {
    const db = await getDb()
    const reviews = await db
      .collection<Review>('reviews')
      .find({ restaurantId })
      .sort({ createdAt: -1 })
      .toArray()
    return ok(reviews)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch reviews')
  }
}

export async function createReview(
  review: Omit<Review, '_id'>,
): Promise<QueryResult<Review>> {
  if (shouldUseMockData()) {
    return ok(review)
  }

  try {
    const db = await getDb()
    const { insertedId } = await db
      .collection<Review>('reviews')
      .insertOne(review as Review)
    return ok({ ...review, _id: insertedId })
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create review')
  }
}

export async function getUserActivity(
  userId: string,
  limit = 20,
): Promise<QueryResult<UserActivity[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockUserActivity
        .filter((activity) => activity.userId === userId)
        .slice(0, limit),
    )
  }

  try {
    const db = await getDb()
    const activities = await db
      .collection<UserActivity>('user_activity')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    return ok(activities)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch user activity')
  }
}
