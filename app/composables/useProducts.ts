import { collection, query, orderBy, limit as fbLimit, getDocs, doc, getDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

export function useLatestProducts(count = 20) {
  return useAsyncData<Product[]>(
    `products:latest:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'products'),
          orderBy('publishedAt', 'desc'),
          fbLimit(count)
        ))
        return snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as Product)
          .filter(p => p.status === 'published')
      } catch (e) {
        console.warn('[useLatestProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

/**
 * Fetch a superset of published products for client-side filter/sort.
 * MVP-friendly (single Firestore read, no composite index). Swap to a
 * server-side query with dedicated indexes once product count grows.
 */
export function useAllPublishedProducts(count = 200) {
  return useAsyncData<Product[]>(
    `products:all-published:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'products'),
          orderBy('publishedAt', 'desc'),
          fbLimit(count)
        ))
        return snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as Product)
          .filter(p => p.status === 'published')
      } catch (e) {
        console.warn('[useAllPublishedProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function usePendingProducts() {
  return useAsyncData<Product[]>(
    'products:pending',
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'products'),
          orderBy('submittedAt', 'desc'),
          fbLimit(100)
        ))
        return snap.docs
          .map(d => ({ id: d.id, ...d.data() }) as Product)
          .filter(p => p.status === 'pending')
      } catch (e) {
        console.warn('[usePendingProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function useProductById(id: string) {
  return useAsyncData<Product | null>(
    `products:${id}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDoc(doc(db, 'products', id))
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Product) : null
      } catch (e) {
        console.warn('[useProductById] fetch failed:', e)
        return null
      }
    },
    { default: () => null }
  )
}

export interface ProductFilters {
  q?: string
  category?: string
  pricing?: string
  collection?: string
  sort?: 'latest' | 'popular' | 'pick'
}

export function filterAndSortProducts(products: Product[], filters: ProductFilters): Product[] {
  let result = [...products]

  if (filters.q) {
    const q = filters.q.toLowerCase().trim()
    if (q) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q)
        || p.tagline?.toLowerCase().includes(q)
        || (p.tags || []).some(t => t.toLowerCase().includes(q))
      )
    }
  }

  if (filters.category) {
    result = result.filter(p => p.category === filters.category)
  }

  if (filters.pricing) {
    result = result.filter(p => p.pricing === filters.pricing)
  }

  if (filters.collection === 'pick') {
    result = result.filter(p => p.source === 'curated')
  }

  const sort = filters.sort || 'latest'
  if (sort === 'popular') {
    result.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
  } else if (sort === 'pick') {
    result = result.filter(p => p.source === 'curated')
  }
  // 'latest' keeps the default publishedAt-desc order from Firestore

  return result
}
