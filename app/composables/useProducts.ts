import { collection, query, where, limit as fbLimit, getDocs, doc, getDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

function sortByPublishedDesc(items: Product[]): Product[] {
  return items.sort((a, b) => {
    const bt = (b.publishedAt as any)?.toMillis?.() ?? 0
    const at = (a.publishedAt as any)?.toMillis?.() ?? 0
    return bt - at
  })
}

export function useLatestProducts(count = 20) {
  return useAsyncData<Product[]>(
    `products:latest:${count}`,
    async () => {
      try {
        const db = useFirestore()
        // where('status', '==', 'published') satisfies security rules for
        // anonymous readers; sort client-side to skip the composite index.
        const snap = await getDocs(query(
          collection(db, 'products'),
          where('status', '==', 'published'),
          fbLimit(count * 2)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
        return sortByPublishedDesc(items).slice(0, count)
      } catch (e) {
        console.warn('[useLatestProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function useAllPublishedProducts(count = 200) {
  return useAsyncData<Product[]>(
    `products:all-published:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'products'),
          where('status', '==', 'published'),
          fbLimit(count)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
        return sortByPublishedDesc(items)
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
        // Admin-only page; unconstrained query is fine because admin has
        // full read access via the security rules.
        const snap = await getDocs(query(
          collection(db, 'products'),
          where('status', '==', 'pending'),
          fbLimit(100)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
        items.sort((a, b) => {
          const bt = (b.submittedAt as any)?.toMillis?.() ?? 0
          const at = (a.submittedAt as any)?.toMillis?.() ?? 0
          return bt - at
        })
        return items
      } catch (e) {
        console.warn('[usePendingProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function useProductsByMaker(maker: string) {
  return useAsyncData<Product[]>(
    `products:maker:${maker}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'products'),
          where('status', '==', 'published'),
          where('maker', '==', maker),
          fbLimit(100)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Product)
        return sortByPublishedDesc(items)
      } catch (e) {
        console.warn('[useProductsByMaker] fetch failed:', e)
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

  return result
}
