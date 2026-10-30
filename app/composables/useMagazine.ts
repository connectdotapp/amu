import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  query,
  where
} from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import type { MagazinePost } from '~/types/magazine'

function byPublishedDesc(items: MagazinePost[]): MagazinePost[] {
  return items.sort((a, b) => {
    const bt = (b.publishedAt as any)?.toMillis?.() ?? (b.updatedAt as any)?.toMillis?.() ?? 0
    const at = (a.publishedAt as any)?.toMillis?.() ?? (a.updatedAt as any)?.toMillis?.() ?? 0
    return bt - at
  })
}

// 정렬은 클라이언트에서 — status+publishedAt 복합 인덱스 없이 동작하도록.
export function usePublishedPosts(count = 50) {
  return useAsyncData<MagazinePost[]>(
    `magazine:published:${count}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(
          collection(db, 'magazine'),
          where('status', '==', 'published'),
          fbLimit(100)
        ))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as MagazinePost)
        return byPublishedDesc(items).slice(0, count)
      } catch (e) {
        console.warn('[usePublishedPosts] fetch failed:', e)
        return []
      }
    },
    { default: () => [] }
  )
}

export function usePostBySlug(slug: string) {
  return useAsyncData<MagazinePost | null>(
    `magazine:post:${slug}`,
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDoc(doc(db, 'magazine', slug))
        if (!snap.exists()) return null
        const post = { id: snap.id, ...snap.data() } as MagazinePost
        return post.status === 'published' ? post : null
      } catch (e) {
        // 초안은 비관리자에게 permission-denied → 없는 글로 처리.
        console.warn('[usePostBySlug] fetch failed:', e)
        return null
      }
    },
    { default: () => null }
  )
}

export function useAllPostsAdmin() {
  return useAsyncData<MagazinePost[]>(
    'magazine:admin:all',
    async () => {
      try {
        const db = useFirestore()
        const snap = await getDocs(query(collection(db, 'magazine'), fbLimit(200)))
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }) as MagazinePost)
        return items.sort((a, b) =>
          ((b.updatedAt as any)?.toMillis?.() ?? 0) - ((a.updatedAt as any)?.toMillis?.() ?? 0))
      } catch (e) {
        console.warn('[useAllPostsAdmin] fetch failed:', e)
        return []
      }
    },
    { default: () => [], server: false }
  )
}

export function useMagazineUpload() {
  const storage = useFirebaseStorage()

  async function uploadImage(file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const rand = Math.random().toString(36).slice(2, 8)
    const r = storageRef(storage, `magazine/uploads/${Date.now()}-${rand}.${ext}`)
    await uploadBytes(r, file, { contentType: file.type })
    return getDownloadURL(r)
  }

  return { uploadImage }
}

export function formatPostDate(post: Pick<MagazinePost, 'publishedAt' | 'updatedAt'>): string {
  const ts = (post.publishedAt as any)?.toDate?.() ?? (post.updatedAt as any)?.toDate?.()
  if (!ts) return ''
  const d = ts as Date
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
