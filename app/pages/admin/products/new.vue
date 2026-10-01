<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '큐레이션 등록',
  robots: 'noindex, nofollow'
})

const toast = useToast()

function onSubmitted(id: string) {
  toast.add({ title: '등록됐어요', description: '홈에서 확인해 보세요.', color: 'success' })
  navigateTo(`/products/${id}`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      관리자
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">큐레이션 등록</h1>
    <p class="mt-2 text-neutral-500">AMU Pick으로 즉시 게시됩니다.</p>

    <div class="mt-10 rounded-3xl bg-neutral-150 p-6 sm:p-8 dark:bg-neutral-800">
      <ProductForm
        source="curated"
        status="published"
        submit-label="AMU Pick으로 게시"
        @submitted="onSubmitted"
      />
    </div>
  </div>
</template>
