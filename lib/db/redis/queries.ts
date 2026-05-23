import { getClient } from './client'
import type { QueryResult } from '../helpers'
import { ok, fail, shouldUseMockData } from '../helpers'

const LOCATION_KEY = 'delivery:locations'
const ORDER_STATUS_PREFIX = 'order:status:'
const mockLocations: Record<string, { latitude: number; longitude: number }> = {
  del_001: { latitude: -34.5889, longitude: -58.4306 },
  del_002: { latitude: -34.6037, longitude: -58.3816 },
}
const mockOrderStatuses: Record<string, string> = {
  ord_001: 'in_transit',
  ord_002: 'preparing',
}

export async function setDeliveryLocation(
  deliveryPersonId: string,
  latitude: number,
  longitude: number,
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
    return fail(e instanceof Error ? e.message : 'Failed to set location')
  }
}

export async function getDeliveryLocation(
  deliveryPersonId: string,
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
    return fail(e instanceof Error ? e.message : 'Failed to get location')
  }
}

export async function cacheOrderStatus(
  orderId: string,
  status: string,
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
    return fail(e instanceof Error ? e.message : 'Failed to cache order status')
  }
}

export async function getCachedOrderStatus(
  orderId: string,
): Promise<QueryResult<string | null>> {
  if (shouldUseMockData()) {
    return ok(mockOrderStatuses[orderId] ?? null)
  }

  try {
    const redis = getClient()
    return ok(await redis.get(`${ORDER_STATUS_PREFIX}${orderId}`))
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to get cached order status')
  }
}
