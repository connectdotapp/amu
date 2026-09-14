<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '프로덕트 수정',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const id = String(route.params.id)
const { data: product } = useProductById(id)
const toast = useToast()

function onSubmitted(pid: string) {
  toast.add({ title: '저장됐어요', color: 'success' })
  navigateTo(`/products/${pid}`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      관리자
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tighter sm:text-4xl">프로덕트 수정</h1>
    <p v-if="product" class="mt-2 text-neutral-500">{{ product.name }}</p>

    <div v-if="product" class="mt-10 rounded-3xl bg-neutral-150 p-6 sm:p-8 dark:bg-neutral-800">
      <ProductForm
        :product="product"
        submit-label="저장"
        @submitted="onSubmitted"
      />
    </div>

    <div v-else class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <p class="text-neutral-500">불러오는 중…</p>
    </div>
  </div>
</template>
