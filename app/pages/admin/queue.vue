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
  <UContainer class="py-10">
    <div class="mb-8">
      <NuxtLink to="/admin" class="text-sm text-muted hover:text-default">← 관리자</NuxtLink>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">승인 대기</h1>
      <p class="mt-1 text-muted">사용자가 등록한 프로덕트를 검토해요.</p>
    </div>

    <section v-if="pending?.length" class="space-y-3">
      <article
        v-for="p in pending"
        :key="p.id"
        class="flex flex-col gap-4 rounded-lg border border-default p-4 sm:flex-row sm:items-start"
      >
        <NuxtImg
          :src="p.thumbnailUrl"
          :alt="p.name"
          width="80"
          height="80"
          class="size-20 shrink-0 rounded-md object-cover bg-elevated"
        />

        <div class="min-w-0 flex-1">
          <NuxtLink :to="`/products/${p.id}`" class="font-medium hover:underline">
            {{ p.name }}
          </NuxtLink>
          <p class="mt-0.5 line-clamp-2 text-sm text-muted">{{ p.tagline }}</p>
          <div class="mt-2 text-xs text-dimmed">
            카테고리 · {{ p.category }} · 태그 {{ (p.tags || []).length }}개
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

    <div v-else class="rounded-lg border border-dashed border-default p-10 text-center text-muted">
      검토 대기 중인 프로덕트가 없어요.
    </div>
  </UContainer>
</template>
