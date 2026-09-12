import type { Timestamp } from 'firebase/firestore'

export type ProductStatus = 'pending' | 'published' | 'rejected'
export type ProductSource = 'curated' | 'user'
export type PricingModel = 'free' | 'freemium' | 'paid' | 'subscription'
export type Platform = 'web' | 'ios' | 'android' | 'macos' | 'windows' | 'linux'

export interface ProductLink {
  label: string
  url: string
}

export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  tags: string[]
  platforms: Platform[]
  pricing: PricingModel
  links: ProductLink[]
  thumbnailUrl: string
  screenshots: string[]
  maker?: string

  status: ProductStatus
  source: ProductSource
  submittedBy: string
  submittedAt: Timestamp
  publishedAt?: Timestamp

  upvoteCount: number
  commentCount: number
  bookmarkCount: number
}

export type ProductDraft = Omit<Product, 'id' | 'status' | 'source' | 'submittedBy' | 'submittedAt' | 'publishedAt' | 'upvoteCount' | 'commentCount' | 'bookmarkCount'>
