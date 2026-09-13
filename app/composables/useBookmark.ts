import { doc, getDoc, increment, runTransaction, serverTimestamp } from 'firebase/firestore'

export function useBookmark(productId: string) {
  const db = useFirestore()
  const user = useCurrentUser()

  const bookmarked = ref(false)
  const loading = ref(false)

  async function refresh() {
    if (!user.value) {
      bookmarked.value = false
      return
    }
    const snap = await getDoc(doc(db, `users/${user.value.uid}/bookmarks/${productId}`))
    bookmarked.value = snap.exists()
  }

  watchEffect(refresh)

  async function toggle() {
    if (!user.value) return navigateTo('/login')
    if (loading.value) return
    loading.value = true

    const uid = user.value.uid
    const bookmarkRef = doc(db, `users/${uid}/bookmarks/${productId}`)
    const productRef = doc(db, `products/${productId}`)

    const wasBookmarked = bookmarked.value
    bookmarked.value = !wasBookmarked

    try {
      await runTransaction(db, async (tx) => {
        const bookmarkSnap = await tx.get(bookmarkRef)
        if (bookmarkSnap.exists()) {
          tx.delete(bookmarkRef)
          tx.update(productRef, { bookmarkCount: increment(-1) })
        } else {
          const productSnap = await tx.get(productRef)
          const p = productSnap.data() || {}
          tx.set(bookmarkRef, {
            productId,
            productName: p.name ?? '',
            productTagline: p.tagline ?? '',
            productThumbnail: p.thumbnailUrl ?? '',
            productSlug: p.slug ?? productId,
            createdAt: serverTimestamp()
          })
          tx.update(productRef, { bookmarkCount: increment(1) })
        }
      })
    } catch (e) {
      bookmarked.value = wasBookmarked
      console.error('[useBookmark] toggle failed:', e)
    } finally {
      loading.value = false
    }
  }

  return { bookmarked, loading, toggle }
}
