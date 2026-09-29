import type { Timestamp } from 'firebase/firestore'

export type CollectionStatus = 'draft' | 'published'

export interface Collection {
  id: string
  slug: string
  title: string
  description: string
  coverImageUrl?: string | null
  productIds: string[]
  curatorName?: string | null
  status: CollectionStatus
  order: number
  productCount: number

  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp | null
}

export type CollectionDraft = Omit<
  Collection,
  'id' | 'productCount' | 'createdAt' | 'updatedAt' | 'publishedAt'
>
