import { doc, getDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

/** Fetch a set of products by ID for the compare page. */
export function useCompareProducts(ids: MaybeRefOrGetter<string[]>) {
  return useAsyncData<Product[]>(
    () => `compare:${toValue(ids).join(',')}`,
    async () => {
      const targetIds = toValue(ids)
      if (!targetIds.length) return []
      try {
        const db = useFirestore()
        const snaps = await Promise.all(targetIds.map(id => getDoc(doc(db, 'products', id))))
        const map = new Map<string, Product>()
        for (const s of snaps) {
          if (!s.exists()) continue
          const data = { id: s.id, ...s.data() } as Product
          if (data.status === 'published') map.set(s.id, data)
        }
        // Preserve caller-specified order.
        return targetIds.map(id => map.get(id)).filter((p): p is Product => !!p)
      } catch (e) {
        console.warn('[useCompareProducts] fetch failed:', e)
        return []
      }
    },
    { default: () => [], watch: [() => toValue(ids)] }
  )
}
