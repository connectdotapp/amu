<script setup lang="ts">
const { data: products } = useLatestProducts(30)

useSeoMeta({
  title: '오늘의 아무',
  description: '오늘의 앱·웹·프로그램. 아무거나 소개하지 않아요.'
})

const platform = ref<'web' | 'app'>('web')
const sort = ref<'latest' | 'popular' | 'pick'>('latest')

const columns = [
  {
    label: '카테고리',
    items: ['AI', '생산성', '디자인', '개발도구', '마케팅']
  },
  {
    label: '플랫폼',
    items: ['웹', 'iOS', 'Android', 'macOS', 'Windows']
  },
  {
    label: '가격',
    items: ['무료', '프리미엄', '유료', '구독', '오픈소스']
  },
  {
    label: '컬렉션',
    items: ['AMU Pick', '오늘의 아무', '이번 주 픽', '최근 등록', '인기순']
  }
]

const sortTabs = [
  { value: 'latest', label: '최신' },
  { value: 'popular', label: '인기' },
  { value: 'pick', label: 'AMU Pick' }
] as const
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6">
    <!-- Four-column taxonomy grid -->
    <section class="grid grid-cols-2 gap-x-6 gap-y-10 pt-4 pb-16 md:grid-cols-4">
      <div v-for="col in columns" :key="col.label">
        <div class="text-sm text-neutral-500">{{ col.label }}</div>
        <ul class="mt-4 space-y-2.5">
          <li v-for="item in col.items" :key="item">
            <NuxtLink
              to="#"
              class="text-lg font-bold tracking-tight text-neutral-950 hover:opacity-60 dark:text-neutral-50"
            >
              {{ item }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Filter row -->
    <div class="flex items-center justify-between gap-4 pb-8">
      <div class="flex items-center gap-6">
        <!-- Platform toggle (pill container with 2 segments) -->
        <div class="relative flex items-center rounded-full bg-neutral-200 p-0.5 dark:bg-neutral-800">
          <button
            class="relative rounded-full px-3 py-1 text-xs font-semibold transition"
            :class="platform === 'web' ? 'bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-300 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-neutral-600' : 'text-neutral-500'"
            @click="platform = 'web'"
          >
            웹
          </button>
          <button
            class="relative rounded-full px-3 py-1 text-xs font-semibold transition"
            :class="platform === 'app' ? 'bg-white text-neutral-950 shadow-sm ring-1 ring-neutral-300 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-neutral-600' : 'text-neutral-500'"
            @click="platform = 'app'"
          >
            앱
          </button>
        </div>

        <div class="h-5 w-px bg-neutral-300 dark:bg-neutral-700" />

        <!-- Sort tabs (underline active) -->
        <nav class="flex items-center gap-6 text-sm font-semibold">
          <button
            v-for="tab in sortTabs"
            :key="tab.value"
            class="transition"
            :class="sort === tab.value ? 'text-neutral-950 underline underline-offset-8 decoration-2 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            @click="sort = tab.value"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <button class="flex items-center gap-1.5 text-sm font-semibold text-neutral-950 dark:text-neutral-50">
        <UIcon name="i-lucide-sliders-horizontal" class="size-4" />
        필터
      </button>
    </div>

    <!-- Cards grid — 4 cols on desktop makes each card ~3/4 of the previous width -->
    <section v-if="products?.length" class="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
      />
    </section>

    <!-- Empty placeholder cards to mirror the browse layout even without data -->
    <section v-else class="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <div
        v-for="i in 8"
        :key="i"
        class="aspect-[6/5] rounded-3xl bg-neutral-150 dark:bg-neutral-800"
      />
    </section>
  </div>
</template>
