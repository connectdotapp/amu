<script setup lang="ts">
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '승인 대기',
  robots: 'noindex, nofollow'
})

const { data: pending, refresh } = usePendingProducts()
const toast = useToast()
const db = useFirestore()

const busyId = ref<string | null>(null)

async function approve(p: Product) {
  busyId.value = p.id
  try {
    await updateDoc(doc(db, 'products', p.id), {
      status: 'published',
      publishedAt: serverTimestamp()
    })
    toast.add({ title: `${p.name} 승인됨`, color: 'success' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: '승인 실패', description: e?.message, color: 'error' })
  } finally {
    busyId.value = null
  }
}

async function reject(p: Product) {
  busyId.value = p.id
  try {
    await updateDoc(doc(db, 'products', p.id), { status: 'rejected' })
    toast.add({ title: `${p.name} 반려됨`, color: 'warning' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: '반려 실패', description: e?.message, color: 'error' })
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-10">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      관리자
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">승인 대기</h1>
    <p class="mt-2 text-neutral-500">사용자가 등록한 프로덕트를 검토해요.</p>

    <section v-if="pending?.length" class="mt-10 space-y-3">
      <article
        v-for="p in pending"
        :key="p.id"
        class="flex flex-col gap-4 rounded-3xl bg-neutral-150 p-5 sm:flex-row sm:items-center dark:bg-neutral-800"
      >
        <img
          :src="p.thumbnailUrl"
          :alt="p.name"
          class="size-20 shrink-0 rounded-2xl object-cover bg-white"
        >

        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/products/${p.id}`" class="font-bold tracking-tight hover:underline">
            {{ p.name }}
          </NuxtLink>
          <p class="mt-1 line-clamp-2 text-sm text-neutral-500">{{ p.tagline }}</p>
          <div class="mt-2 text-xs text-neutral-400">
            {{ p.category }} · 태그 {{ (p.tags || []).length }}개
          </div>
        </div>

        <div class="flex gap-2 sm:flex-col">
          <UButton
            size="sm"
            color="neutral"
            variant="solid"
            icon="i-lucide-check"
            :loading="busyId === p.id"
            @click="approve(p)"
          >
            승인
          </UButton>
          <UButton
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-x"
            :disabled="busyId === p.id"
            @click="reject(p)"
          >
            반려
          </UButton>
        </div>
      </article>
    </section>

    <div v-else class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-inbox" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">검토 대기 중인 프로덕트가 없어요.</p>
    </div>
  </div>
</template>
