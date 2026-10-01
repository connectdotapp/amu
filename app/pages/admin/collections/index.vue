<script setup lang="ts">
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import type { Collection } from '~/types/collection'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '컬렉션 관리',
  robots: 'noindex, nofollow'
})

const { data: collections, refresh } = useAllCollections()
const db = useFirestore()
const toast = useToast()
const busyId = ref<string | null>(null)

async function togglePublish(c: Collection) {
  busyId.value = c.id
  try {
    const publishing = c.status !== 'published'
    await updateDoc(doc(db, 'collections', c.id), {
      status: publishing ? 'published' : 'draft',
      publishedAt: publishing && !c.publishedAt ? serverTimestamp() : c.publishedAt ?? null,
      updatedAt: serverTimestamp()
    })
    toast.add({
      title: publishing ? `${c.title} 게시됨` : `${c.title} 초안으로 전환`,
      color: 'success'
    })
    await refresh()
  } catch (e: any) {
    toast.add({ title: '변경 실패', description: e?.message, color: 'error' })
  } finally {
    busyId.value = null
  }
}

async function removeCollection(c: Collection) {
  if (!confirm(`"${c.title}" 컬렉션을 삭제할까요? 되돌릴 수 없어요.`)) return
  busyId.value = c.id
  try {
    await deleteDoc(doc(db, 'collections', c.id))
    toast.add({ title: '삭제됐어요', color: 'success' })
    await refresh()
  } catch (e: any) {
    toast.add({ title: '삭제 실패', description: e?.message, color: 'error' })
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

    <header class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">컬렉션 관리</h1>
        <p class="mt-2 text-neutral-500">주제별로 프로덕트를 묶어 소개하는 편집 단위.</p>
      </div>
      <UButton to="/admin/collections/new" color="neutral" variant="solid" icon="i-lucide-plus">
        새 컬렉션
      </UButton>
    </header>

    <section v-if="collections?.length" class="mt-10 space-y-3">
      <article
        v-for="c in collections"
        :key="c.id"
        class="flex flex-col gap-4 rounded-3xl bg-neutral-150 p-5 sm:flex-row sm:items-center dark:bg-neutral-800"
      >
        <div class="aspect-[16/9] w-32 shrink-0 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
          <img v-if="c.coverImageUrl" :src="c.coverImageUrl" :alt="c.title" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-neutral-300">
            <UIcon name="i-lucide-layers" class="size-6" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <NuxtLink :to="`/collections/${c.slug}`" class="font-bold tracking-tight hover:underline">
              {{ c.title }}
            </NuxtLink>
            <UBadge
              size="xs"
              :color="c.status === 'published' ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ c.status === 'published' ? '게시됨' : '초안' }}
            </UBadge>
          </div>
          <p class="mt-1 line-clamp-2 text-sm text-neutral-500">{{ c.description }}</p>
          <div class="mt-2 text-xs text-neutral-500">
            {{ c.productCount ?? 0 }}개 프로덕트 · 순서 #{{ c.order ?? 0 }} · slug: {{ c.slug }}
          </div>
        </div>

        <div class="flex flex-wrap gap-2 sm:flex-col">
          <UButton
            size="sm"
            color="neutral"
            variant="solid"
            :icon="c.status === 'published' ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :loading="busyId === c.id"
            @click="togglePublish(c)"
          >
            {{ c.status === 'published' ? '숨기기' : '게시' }}
          </UButton>
          <UButton :to="`/admin/collections/${c.id}/edit`" size="sm" color="neutral" variant="outline" icon="i-lucide-pencil">
            수정
          </UButton>
          <UButton size="sm" color="neutral" variant="ghost" icon="i-lucide-trash-2" :disabled="busyId === c.id" @click="removeCollection(c)">
            삭제
          </UButton>
        </div>
      </article>
    </section>

    <div v-else class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-layers" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 컬렉션이 없어요.</p>
      <UButton to="/admin/collections/new" color="neutral" variant="solid" class="mt-6" icon="i-lucide-plus">
        첫 컬렉션 만들기
      </UButton>
    </div>
  </div>
</template>
