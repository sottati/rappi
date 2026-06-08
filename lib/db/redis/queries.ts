import { getClient } from "./client"
import type { QueryResult } from "../helpers"
import { ok, fail, shouldUseMockData } from "../helpers"
import type { AvailableOrderSnapshot } from "./types"

const LOCATION_KEY = "delivery:locations"
const ORDER_STATUS_PREFIX = "order:status:"
const AVAILABLE_ORDERS_KEY = "delivery:available_orders"
const AVAILABLE_ORDER_PREFIX = "delivery:available_order:"
const ORDER_CLAIM_PREFIX = "order:claim:"
const mockLocations: Record<string, { latitude: number; longitude: number }> = {
  del_001: { latitude: -34.5889, longitude: -58.4306 },
  del_002: { latitude: -34.6037, longitude: -58.3816 },
}
const mockOrderStatuses: Record<string, string> = {
  ord_001: "in_transit",
  ord_002: "preparing",
}
const mockAvailableOrders = new Set<string>()
const mockAvailableOrderSnapshots = new Map<string, AvailableOrderSnapshot>()
const mockOrderClaims = new Map<string, string>()

function availableOrderKey(orderId: string) {
  return `${AVAILABLE_ORDER_PREFIX}${orderId}`
}

function serializeAvailableOrderSnapshot(snapshot: AvailableOrderSnapshot) {
  return {
    idPedido: String(snapshot.idPedido),
    estado: snapshot.estado,
    fechaHora: snapshot.fechaHora.toISOString(),
    total: String(snapshot.total),
    idEstablecimiento: String(snapshot.idEstablecimiento),
    establecimientoNombre: snapshot.establecimientoNombre,
    direccionResumen: snapshot.direccionResumen,
    itemCount: String(snapshot.itemCount),
  }
}

function parseAvailableOrderSnapshot(
  value: Record<string, unknown> | null
): AvailableOrderSnapshot | null {
  if (!value || Object.keys(value).length === 0) return null

  const idPedido = Number(value.idPedido)
  const total = Number(value.total)
  const idEstablecimiento = Number(value.idEstablecimiento)
  const itemCount = Number(value.itemCount)
  const fechaHora = new Date(String(value.fechaHora ?? ""))

  if (
    Number.isNaN(idPedido) ||
    Number.isNaN(total) ||
    Number.isNaN(idEstablecimiento) ||
    Number.isNaN(itemCount) ||
    Number.isNaN(fechaHora.getTime())
  ) {
    return null
  }

  return {
    idPedido,
    estado: String(value.estado ?? ""),
    fechaHora,
    total,
    idEstablecimiento,
    establecimientoNombre: String(value.establecimientoNombre ?? ""),
    direccionResumen: String(value.direccionResumen ?? ""),
    itemCount,
  }
}

export async function setDeliveryLocation(
  deliveryPersonId: string,
  latitude: number,
  longitude: number
): Promise<QueryResult<void>> {
  if (shouldUseMockData()) {
    mockLocations[deliveryPersonId] = { latitude, longitude }
    return ok(undefined)
  }

  try {
    const redis = getClient()
    await redis.geoadd(LOCATION_KEY, {
      latitude,
      longitude,
      member: deliveryPersonId,
    })
    return ok(undefined)
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to set location")
  }
}

export async function getDeliveryLocation(
  deliveryPersonId: string
): Promise<QueryResult<{ latitude: number; longitude: number } | null>> {
  if (shouldUseMockData()) {
    return ok(mockLocations[deliveryPersonId] ?? null)
  }

  try {
    const redis = getClient()
    const pos = await redis.geopos(LOCATION_KEY, deliveryPersonId)
    if (!pos || !pos[0]) return ok(null)
    return ok({ latitude: Number(pos[0].lat), longitude: Number(pos[0].lng) })
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to get location")
  }
}

export async function cacheOrderStatus(
  orderId: string,
  status: string
): Promise<QueryResult<void>> {
  if (shouldUseMockData()) {
    mockOrderStatuses[orderId] = status
    return ok(undefined)
  }

  try {
    const redis = getClient()
    await redis.set(`${ORDER_STATUS_PREFIX}${orderId}`, status, { ex: 3600 })
    return ok(undefined)
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Failed to cache order status")
  }
}

export async function getCachedOrderStatus(
  orderId: string
): Promise<QueryResult<string | null>> {
  if (shouldUseMockData()) {
    return ok(mockOrderStatuses[orderId] ?? null)
  }

  try {
    const redis = getClient()
    return ok(await redis.get(`${ORDER_STATUS_PREFIX}${orderId}`))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to get cached order status"
    )
  }
}

export async function addAvailableOrder(
  snapshot: AvailableOrderSnapshot
): Promise<QueryResult<void>> {
  const orderId = String(snapshot.idPedido)

  if (shouldUseMockData()) {
    mockAvailableOrders.add(orderId)
    mockAvailableOrderSnapshots.set(orderId, snapshot)
    return ok(undefined)
  }

  try {
    const redis = getClient()
    await Promise.all([
      redis.sadd(AVAILABLE_ORDERS_KEY, orderId),
      redis.hset(
        availableOrderKey(orderId),
        serializeAvailableOrderSnapshot(snapshot)
      ),
    ])
    return ok(undefined)
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to add available order"
    )
  }
}

export async function removeAvailableOrder(
  orderId: string
): Promise<QueryResult<void>> {
  if (shouldUseMockData()) {
    mockAvailableOrders.delete(orderId)
    mockAvailableOrderSnapshots.delete(orderId)
    mockOrderClaims.delete(orderId)
    return ok(undefined)
  }

  try {
    const redis = getClient()
    await Promise.all([
      redis.srem(AVAILABLE_ORDERS_KEY, orderId),
      redis.del(availableOrderKey(orderId)),
      redis.del(`${ORDER_CLAIM_PREFIX}${orderId}`),
    ])
    return ok(undefined)
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to remove available order"
    )
  }
}

export async function getAvailableOrderIds(): Promise<QueryResult<string[]>> {
  if (shouldUseMockData()) {
    return ok([...mockAvailableOrders])
  }

  try {
    const redis = getClient()
    return ok(await redis.smembers<string[]>(AVAILABLE_ORDERS_KEY))
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to fetch available orders"
    )
  }
}

export async function getAvailableOrders(): Promise<
  QueryResult<AvailableOrderSnapshot[]>
> {
  if (shouldUseMockData()) {
    return ok(
      [...mockAvailableOrders]
        .map((id) => mockAvailableOrderSnapshots.get(id))
        .filter(
          (snapshot): snapshot is AvailableOrderSnapshot => snapshot != null
        )
    )
  }

  try {
    const redis = getClient()
    const orderIds = await redis.smembers<string[]>(AVAILABLE_ORDERS_KEY)
    const snapshots = await Promise.all(
      orderIds.map((orderId) => redis.hgetall(availableOrderKey(orderId)))
    )

    return ok(
      snapshots
        .map(parseAvailableOrderSnapshot)
        .filter(
          (snapshot): snapshot is AvailableOrderSnapshot => snapshot != null
        )
    )
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to fetch available orders"
    )
  }
}

export async function claimAvailableOrder(
  orderId: string,
  deliveryPersonId: string
): Promise<QueryResult<boolean>> {
  if (shouldUseMockData()) {
    if (!mockAvailableOrders.has(orderId)) return ok(false)
    if (mockOrderClaims.has(orderId)) return ok(false)
    mockOrderClaims.set(orderId, deliveryPersonId)
    return ok(true)
  }

  try {
    const redis = getClient()
    const isAvailable = await redis.sismember(AVAILABLE_ORDERS_KEY, orderId)
    if (!isAvailable) return ok(false)

    const result = await redis.set(
      `${ORDER_CLAIM_PREFIX}${orderId}`,
      deliveryPersonId,
      { nx: true, ex: 30 }
    )
    return ok(result === "OK")
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Failed to claim available order"
    )
  }
}
