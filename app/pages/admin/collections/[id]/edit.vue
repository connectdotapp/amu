<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { Collection } from '~/types/collection'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '컬렉션 수정',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const id = String(route.params.id)
const db = useFirestore()

const { data: collectionDoc } = await useAsyncData<Collection | null>(
  () => `collection:admin:${id}`,
  async () => {
    try {
      const snap = await getDoc(doc(db, 'collections', id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as Collection) : null
    } catch (e) {
      console.warn('[collection edit] fetch failed:', e)
      return null
    }
  },
  { default: () => null }
)

const toast = useToast()

function onSubmitted() {
  toast.add({ title: '저장됐어요', color: 'success' })
  navigateTo('/admin/collections')
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <NuxtLink to="/admin/collections" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      컬렉션 관리
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">컬렉션 수정</h1>
    <p v-if="collectionDoc" class="mt-2 text-neutral-500">{{ collectionDoc.title }}</p>

    <div v-if="collectionDoc" class="mt-10 rounded-3xl bg-neutral-150 p-6 sm:p-8 dark:bg-neutral-800">
      <CollectionForm :collection="collectionDoc" submit-label="저장" @submitted="onSubmitted" />
    </div>

    <div v-else class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <p class="text-neutral-500">컬렉션을 찾을 수 없어요.</p>
    </div>
  </div>
</template>
