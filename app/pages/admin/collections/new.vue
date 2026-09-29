<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '컬렉션 만들기',
  robots: 'noindex, nofollow'
})

const toast = useToast()

function onSubmitted(collectionId: string) {
  toast.add({ title: '컬렉션이 저장됐어요', color: 'success' })
  navigateTo(`/admin/collections`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <NuxtLink to="/admin/collections" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      컬렉션 관리
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tighter sm:text-4xl">컬렉션 만들기</h1>
    <p class="mt-2 text-neutral-500">주제 하나에 묶을 프로덕트들을 골라 소개해요.</p>

    <div class="mt-10 rounded-3xl bg-neutral-150 p-6 sm:p-8 dark:bg-neutral-800">
      <CollectionForm submit-label="컬렉션 만들기" @submitted="onSubmitted" />
    </div>
  </div>
</template>
