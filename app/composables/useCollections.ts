import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  where
} from 'firebase/firestore'
import type { Collection } from '~/types/collection'

function sortByOrder(items: Collection[]): Collection[] {
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}

function sortByPublishedDesc(items: Collection[]): Collection[] {
  return items.sort((a, b) => {
    const bt = (b.publishedAt as any)?.toMillis?.() ?? 0
    const at = (a.publishedAt as any)?.toMillis?.() ?? 0
    return bt - at
  })
}

export function usePublishedCollections(count = 50) {
  return useAsyncData<Collection[]>(
    `collections:published:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'collections'),
          where('status', '==', 'published'),
          fbLimit(count)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Collection)
        return sortByOrder(items)
      } catch (e) {
        console.warn('[usePublishedCollections] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function useRecentCollections(count = 3) {
  return useAsyncData<Collection[]>(
    `collections:recent:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'collections'),
          where('status', '==', 'published'),
          fbLimit(count * 3)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Collection)
        return sortByPublishedDesc(items).slice(0, count)
      } catch (e) {
        console.warn('[useRecentCollections] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function useCollectionBySlug(slug: string) {
  return useAsyncData<Collection | null>(
    `collection:${slug}`,
    async () => {
      try {
        const db = useFirestore()
        // slug is used as the doc id so we can direct-get.
        const snap = await getDoc(doc(db, 'collections', slug))
        if (!snap.exists()) return null
        const data = { id: snap.id, ...snap.data() } as Collection
        return data.status === 'published' ? data : null
      } catch (e) {
        console.warn('[useCollectionBySlug] fetch failed:', e)
        return null
      }
    },
    { default: () => null }
  )
}

// Admin: fetches all collections including drafts.
export function useAllCollections() {
  return useAsyncData<Collection[]>(
    'collections:all',
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'collections'),
          orderBy('order', 'asc'),
          fbLimit(200)
        ))
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Collection)
      } catch (e) {
        console.warn('[useAllCollections] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}
