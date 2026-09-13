<script setup lang="ts">
const { data: products } = useLatestProducts(30)

useSeoMeta({
  title: '오늘의 아무',
  description: '오늘의 앱·웹·프로그램. 아무거나 소개하지 않아요.'
})
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8">
      <h1 class="text-3xl font-semibold tracking-tight">오늘의 아무</h1>
      <p class="mt-1 text-muted">아무거나 소개하지 않아요. 오늘 새로 소개된 프로덕트.</p>
    </header>

    <section v-if="products?.length" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
      />
    </section>

    <div v-else class="rounded-lg border border-dashed border-default p-10 text-center text-muted">
      아직 등록된 프로덕트가 없어요.
    </div>
  </UContainer>
</template>
