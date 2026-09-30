import type { Timestamp } from 'firebase/firestore'

export type ProductStatus = 'pending' | 'published' | 'rejected'
export type ProductSource = 'curated' | 'user'
export type PricingModel = 'free' | 'freemium' | 'paid' | 'subscription'
export type Platform = 'web' | 'ios' | 'android' | 'macos' | 'windows' | 'linux'

export interface ProductLink {
  label: string
  url: string
}

// Showroom scale buckets: coarse enough to disclose without exact numbers.
export type MonthlyUsersRange =
  | '~100'
  | '100~1K'
  | '1K~10K'
  | '10K~100K'
  | '100K~1M'
  | '1M+'

export type MonthlyRevenueRange =
  | '없음'
  | '~100만'
  | '100~500만'
  | '500만~1천만'
  | '1천~5천만'
  | '5천만~1억'
  | '1억+'

/**
 * Maker-disclosed operating info shown on the product detail 쇼룸 section.
 * Every field is optional; the section only renders when at least one is filled.
 * Used both on the detail page and (when at least one product has values) in
 * the comparison table.
 */
export interface ProductShowroom {
  monthlyUsersRange?: MonthlyUsersRange
  monthlyRevenueRange?: MonthlyRevenueRange
  teamSize?: number
  foundedAt?: string  // YYYY or YYYY-MM
  location?: string
  investorPitch?: string  // one-line pitch aimed at potential backers
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

  showroom?: ProductShowroom
}

export type ProductDraft = Omit<Product, 'id' | 'status' | 'source' | 'submittedBy' | 'submittedAt' | 'publishedAt' | 'upvoteCount' | 'commentCount' | 'bookmarkCount'>
