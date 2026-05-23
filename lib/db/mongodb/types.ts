import type { ObjectId } from 'mongodb'

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
