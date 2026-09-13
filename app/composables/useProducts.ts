import { collection, query, orderBy, limit as fbLimit, getDocs, doc, getDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

export function useLatestProducts(count = 20) {
  return useAsyncData<Product[]>(
    `products:latest:${count}`,
    async () => {
      try {
        const db = useFirestore()
        // Single-field orderBy avoids the need for a composite index.
        // Pending products have publishedAt=null and are excluded automatically;
        // we also filter defensively in-memory in case of edge cases.
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
