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
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl">
      <div class="mb-8">
        <NuxtLink to="/admin" class="text-sm text-muted hover:text-default">← 관리자</NuxtLink>
        <h1 class="mt-2 text-2xl font-semibold tracking-tight">큐레이션 등록</h1>
        <p class="mt-1 text-muted">AMU Pick으로 즉시 게시됩니다.</p>
      </div>

      <ProductForm
        source="curated"
        status="published"
        submit-label="AMU Pick으로 게시"
        @submitted="onSubmitted"
      />
    </div>
  </UContainer>
</template>
