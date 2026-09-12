import { collection, query, where, orderBy, limit as fbLimit, doc } from 'firebase/firestore'
import type { Product } from '~/types/product'

export function useLatestProducts(count = 20) {
  const db = useFirestore()
  const q = query(
    collection(db, 'products'),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc'),
    fbLimit(count)
  )
  return useCollection<Product>(q, { ssrKey: `products:latest:${count}` })
}

export function useProduct(id: string) {
  const db = useFirestore()
  return useDocument<Product>(doc(db, 'products', id), { ssrKey: `products:${id}` })
}
