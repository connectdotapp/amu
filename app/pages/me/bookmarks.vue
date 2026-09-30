<script setup lang="ts">
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: '북마크',
  robots: 'noindex, nofollow'
})

interface BookmarkDoc {
  productId: string
  productName: string
  productTagline: string
  productThumbnail: string
  productSlug: string
}

const user = useCurrentUser()
const db = useFirestore()

const { data: bookmarks } = await useAsyncData<BookmarkDoc[]>(
  () => `bookmarks:${user.value?.uid ?? 'anon'}`,
  async () => {
    if (!user.value) return []
    try {
      const snap = await getDocs(query(
        collection(db, `users/${user.value.uid}/bookmarks`),
        orderBy('createdAt', 'desc')
      ))
      return snap.docs.map(d => d.data() as BookmarkDoc)
    } catch (e) {
      console.warn('[bookmarks] fetch failed:', e)
      return []
    }
  },
  { default: () => [], watch: [user] }
)
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">북마크</h1>
    <p class="mt-2 text-neutral-500">저장해둔 프로덕트들.</p>

    <section v-if="bookmarks?.length" class="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <NuxtLink
        v-for="b in bookmarks"
        :key="b.productId"
        :to="`/products/${b.productSlug || b.productId}`"
        class="group flex gap-4 rounded-3xl bg-neutral-100 p-4 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <img
          :src="b.productThumbnail"
          :alt="b.productName"
          class="size-20 shrink-0 rounded-2xl object-cover bg-neutral-50"
        >
        <div class="min-w-0 flex-1">
          <h3 class="truncate text-base font-bold tracking-tight">{{ b.productName }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-neutral-500">{{ b.productTagline }}</p>
        </div>
      </NuxtLink>
    </section>

    <div v-else class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-bookmark" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 북마크한 프로덕트가 없어요.</p>
      <UButton to="/" color="neutral" variant="solid" class="mt-6">
        둘러보러 가기
      </UButton>
    </div>
  </div>
</template>
