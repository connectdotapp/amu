<script setup lang="ts">
useSeoMeta({
  title: '카테고리',
  description: '카테고리별로 오늘의 앱·웹·프로그램을 둘러보세요.'
})

const { data: categories, pending } = useCategories()
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-5 pb-16 pt-6 md:px-6 md:pt-10">
    <h1 class="text-[28px] font-bold tracking-tight md:text-4xl">
      카테고리
    </h1>

    <div
      v-if="pending && !categories?.length"
      class="mt-6 text-sm text-neutral-400"
    >
      불러오는 중…
    </div>

    <ul
      v-else
      class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
    >
      <li
        v-for="c in categories"
        :key="c.slug"
      >
        <NuxtLink
          :to="`/categories/${c.slug}`"
          class="flex min-h-14 items-center justify-between rounded-2xl bg-neutral-100 px-4 text-[15px] font-bold transition hover:bg-neutral-150 active:opacity-70 dark:bg-neutral-900"
        >
          {{ c.name }}
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 text-neutral-400"
          />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
