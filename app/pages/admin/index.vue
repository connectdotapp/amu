<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '관리자',
  robots: 'noindex, nofollow'
})

const actions = [
  {
    to: '/admin/products/new',
    icon: 'i-lucide-plus',
    title: '큐레이션 등록',
    description: 'AMU Pick으로 즉시 게시'
  },
  {
    to: '/admin/queue',
    icon: 'i-lucide-inbox',
    title: '승인 대기',
    description: '사용자 등록 프로덕트 검토'
  },
  {
    to: '/admin/categories',
    icon: 'i-lucide-tag',
    title: '카테고리 관리',
    description: '초기 8개 시드됨'
  }
]
</script>

<template>
  <UContainer class="py-10">
    <header class="mb-8">
      <h1 class="text-2xl font-semibold tracking-tight">관리자</h1>
      <p class="mt-1 text-muted">아무의 큐레이션 워크스페이스.</p>
    </header>

    <div class="grid gap-3 sm:grid-cols-3">
      <NuxtLink
        v-for="a in actions"
        :key="a.to"
        :to="a.to"
        class="group rounded-lg border border-default p-5 transition hover:border-highlighted"
      >
        <UIcon :name="a.icon" class="size-5 text-muted transition group-hover:text-default" />
        <div class="mt-3 font-medium">{{ a.title }}</div>
        <div class="mt-0.5 text-sm text-muted">{{ a.description }}</div>
      </NuxtLink>
    </div>
  </UContainer>
</template>
