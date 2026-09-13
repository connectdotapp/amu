import { doc, getDoc, increment, runTransaction, serverTimestamp } from 'firebase/firestore'

export function useUpvote(productId: string, initialCount = 0) {
  const db = useFirestore()
  const user = useCurrentUser()

  const upvoted = ref(false)
  const count = ref(initialCount)
  const loading = ref(false)

  watch(() => initialCount, v => { count.value = v })

  async function refresh() {
    if (!user.value) {
      upvoted.value = false
      return
    }
    const snap = await getDoc(doc(db, `products/${productId}/upvotes/${user.value.uid}`))
    upvoted.value = snap.exists()
  }

  watchEffect(refresh)

  async function toggle() {
    if (!user.value) return navigateTo('/login')
    if (loading.value) return
    loading.value = true

    const uid = user.value.uid
    const upvoteRef = doc(db, `products/${productId}/upvotes/${uid}`)
    const productRef = doc(db, `products/${productId}`)

    // Optimistic update
    const wasUpvoted = upvoted.value
    upvoted.value = !wasUpvoted
    count.value += wasUpvoted ? -1 : 1

    try {
      await runTransaction(db, async (tx) => {
        const upvoteSnap = await tx.get(upvoteRef)
        if (upvoteSnap.exists()) {
          tx.delete(upvoteRef)
          tx.update(productRef, { upvoteCount: increment(-1) })
        } else {
          tx.set(upvoteRef, { createdAt: serverTimestamp() })
          tx.update(productRef, { upvoteCount: increment(1) })
        }
      })
    } catch (e) {
      // Revert
      upvoted.value = wasUpvoted
      count.value += wasUpvoted ? 1 : -1
      console.error('[useUpvote] toggle failed:', e)
    } finally {
      loading.value = false
    }
  }

  return { upvoted, count, loading, toggle }
}
