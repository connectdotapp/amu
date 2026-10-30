<script setup lang="ts">
import type { MagazineStatus } from '~/types/magazine'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '새 글 쓰기',
  robots: 'noindex, nofollow'
})

const toast = useToast()

function onSaved(postId: string, status: MagazineStatus) {
  toast.add({ title: status === 'published' ? '발행됐어요' : '초안으로 저장됐어요', color: 'success' })
  navigateTo(status === 'published' ? `/magazine/${postId}` : `/admin/magazine/${postId}/edit`)
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-5 py-10 md:px-6">
    <NuxtLink
      to="/admin/magazine"
      class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      매거진 관리
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
      새 글 쓰기
    </h1>

    <div class="mt-8 rounded-3xl bg-neutral-150 p-5 sm:p-8 dark:bg-neutral-800">
      <MagazineForm @saved="onSaved" />
    </div>
  </div>
</template>
