import { getDb } from './client'
import type { QueryResult } from '../helpers'
import { ok, fail, shouldUseMockData } from '../helpers'
import { mockReviews, mockUserActivity } from './mock'
import type { Review, UserActivity } from './types'

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
