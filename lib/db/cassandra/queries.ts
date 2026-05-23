import { getClient } from './client'
import type { QueryResult } from '../helpers'
import { fail, ok, shouldUseMockData } from '../helpers'
import { mockDeliveryTrackingPoints, mockOrderEvents } from './mock'
import type { DeliveryTrackingPoint, OrderEvent } from './types'

export async function getOrderEvents(
  orderId: string,
): Promise<QueryResult<OrderEvent[]>> {
  if (shouldUseMockData()) {
    return ok(mockOrderEvents.filter((event) => event.orderId === orderId))
  }

  try {
    const client = getClient()
    const result = await client.execute(
      `
      SELECT order_id, event_id, status, source, payload, created_at
      FROM order_events
      WHERE order_id = ?
      ORDER BY created_at DESC
      `,
      [orderId],
      { prepare: true },
    )

    const events = result.rows.map((row) => ({
      orderId: row.order_id as string,
      eventId: row.event_id as string,
      status: row.status as string,
      source: row.source as string,
      payload: JSON.parse((row.payload as string | null) ?? '{}') as Record<string, unknown>,
      createdAt: row.created_at as Date,
    }))

    return ok(events)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch order events')
  }
}

export async function getDeliveryTrackingPoints(
  deliveryPersonId: string,
  orderId: string,
): Promise<QueryResult<DeliveryTrackingPoint[]>> {
  if (shouldUseMockData()) {
    return ok(
      mockDeliveryTrackingPoints.filter(
        (point) =>
          point.deliveryPersonId === deliveryPersonId && point.orderId === orderId,
      ),
    )
  }

  try {
    const client = getClient()
    const result = await client.execute(
      `
      SELECT delivery_person_id, order_id, latitude, longitude, recorded_at
      FROM delivery_tracking_points
      WHERE delivery_person_id = ? AND order_id = ?
      ORDER BY recorded_at DESC
      `,
      [deliveryPersonId, orderId],
      { prepare: true },
    )

    const points = result.rows.map((row) => ({
      deliveryPersonId: row.delivery_person_id as string,
      orderId: row.order_id as string,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      recordedAt: row.recorded_at as Date,
    }))

    return ok(points)
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to fetch tracking points')
  }
}
