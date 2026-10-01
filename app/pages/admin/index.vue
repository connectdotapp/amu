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
    to: '/admin/collections',
    icon: 'i-lucide-layers',
    title: '컬렉션 관리',
    description: '주제별 프로덕트 묶음 편집'
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
  <div class="mx-auto max-w-[1280px] px-6 py-10">
    <header class="mb-10">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">관리자</h1>
      <p class="mt-2 text-neutral-500">아무의 큐레이션 워크스페이스.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="a in actions"
        :key="a.to"
        :to="a.to"
        class="group flex flex-col rounded-3xl bg-neutral-150 p-6 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      >
        <div class="flex size-10 items-center justify-center rounded-full bg-white dark:bg-neutral-700">
          <UIcon :name="a.icon" class="size-5" />
        </div>
        <div class="mt-6 font-bold tracking-tight">{{ a.title }}</div>
        <div class="mt-1 text-sm text-neutral-500">{{ a.description }}</div>
      </NuxtLink>
    </div>
  </div>
</template>
