import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import type { Category } from '~/types/user'

export function useCategories() {
  return useAsyncData<Category[]>(
    'categories',
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(collection(db, 'categories'), orderBy('order')))
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Category)
      } catch (e) {
        console.warn('[useCategories] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}
