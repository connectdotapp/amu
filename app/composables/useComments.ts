import {
  collection,
  doc,
  getDocs,
  increment,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import type { Comment } from '~/types/user'

export function useComments(productId: string) {
  const db = useFirestore()
  const user = useCurrentUser()

  const comments = ref<Comment[]>([])
  const loading = ref(false)
  const submitting = ref(false)

  async function refresh() {
    loading.value = true
    try {
      const snap = await getDocs(query(
        collection(db, `products/${productId}/comments`),
        orderBy('createdAt', 'desc'),
        fbLimit(100)
      ))
      comments.value = snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment))
    } catch (e) {
      console.warn('[useComments] fetch failed:', e)
      comments.value = []
    } finally {
      loading.value = false
    }
  }

  async function add(body: string) {
    if (!user.value) return navigateTo('/login')
    const trimmed = body.trim()
    if (!trimmed) return
    submitting.value = true
    try {
      const commentRef = doc(collection(db, `products/${productId}/comments`))
      const productRef = doc(db, `products/${productId}`)
      const batch = writeBatch(db)
      batch.set(commentRef, {
        authorUid: user.value.uid,
        authorName: user.value.displayName ?? '익명',
        authorPhotoURL: user.value.photoURL ?? null,
        body: trimmed,
        createdAt: serverTimestamp()
      })
      batch.update(productRef, { commentCount: increment(1) })
      await batch.commit()
      await refresh()
    } finally {
      submitting.value = false
    }
  }

  onMounted(refresh)

  return { comments, loading, submitting, add, refresh }
}
