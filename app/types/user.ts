import type { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  displayName: string
  photoURL?: string
  bio?: string
  createdAt: Timestamp
}

export interface Comment {
  id: string
  authorUid: string
  authorName: string
  authorPhotoURL?: string
  body: string
  createdAt: Timestamp
}

export interface Category {
  id: string
  name: string
  slug: string
  order: number
}
