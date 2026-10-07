<script setup lang="ts">
import type { Product } from '~/types/product'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: categories } = useCategories()
const category = computed(() => (categories.value || []).find(c => c.slug === slug.value))

useSeoMeta({
  title: () => category.value ? `${category.value.name} 추천 앱` : '카테고리',
  description: () => category.value
    ? `${category.value.name} 카테고리의 아무가 추천하는 앱·웹·프로그램을 모았어요.`
    : undefined
})

// 전체 published 가져온 뒤 slug 로 필터 — 보안 룰 (status==published) 만 사용해서 복합 인덱스 회피
const { data: allProducts } = useAllPublishedProducts(500)
const products = computed<Product[]>(() =>
  (allProducts.value || []).filter(p => p.category === slug.value)
)

// 베스트: upvoteCount 내림차순 상위 10개
const best = computed<Product[]>(() =>
  [...products.value]
    .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
    .slice(0, 10)
)

type SortOption = 'recommended' | 'latest' | 'popular' | 'oldest'
const sortOption = ref<SortOption>('recommended')
const sortOptions: Array<{ label: string, value: SortOption }> = [
  { label: '추천순', value: 'recommended' },
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '오래된순', value: 'oldest' }
]

function millis(v: any): number {
  return v?.toMillis?.() ?? 0
}

const sortedProducts = computed<Product[]>(() => {
  const list = [...products.value]
  switch (sortOption.value) {
    case 'latest':
      return list.sort((a, b) => millis(b.publishedAt) - millis(a.publishedAt))
    case 'popular':
      return list.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
    case 'oldest':
      return list.sort((a, b) => millis(a.publishedAt) - millis(b.publishedAt))
    case 'recommended':
    default:
      // AMU Pick 먼저, 동률이면 upvoteCount 내림차순
      return list.sort((a, b) => {
        const aPick = a.source === 'curated' ? 1 : 0
        const bPick = b.source === 'curated' ? 1 : 0
        if (aPick !== bPick) return bPick - aPick
        return (b.upvoteCount || 0) - (a.upvoteCount || 0)
      })
  }
})

// 캐러셀 스크롤 제어
const bestScroller = ref<HTMLElement | null>(null)

function scrollBest(dir: -1 | 1) {
  const el = bestScroller.value
  if (!el) return
  const amount = Math.round(el.clientWidth * 0.8) * dir
  el.scrollBy({ left: amount, behavior: 'smooth' })
}
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6 py-10">
    <!-- 헤더 -->
    <header>
      <p class="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Category</p>
      <h1 class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        {{ category?.name ?? slug }}
      </h1>
      <p class="mt-3 text-sm text-neutral-500">
        {{ category?.name ?? '이' }} 카테고리의 아무가 추천하는 프로덕트들이에요
      </p>
    </header>

    <!-- 카테고리 없음 -->
    <div v-if="categories && categories.length && !category" class="mt-16 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search-x" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">존재하지 않는 카테고리예요</p>
      <UButton to="/" color="neutral" variant="solid" class="mt-6">
        홈으로 돌아가기
      </UButton>
    </div>

    <template v-else>
      <!-- 카테고리 베스트 캐러셀 -->
      <section v-if="best.length" class="mt-12">
        <div class="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold tracking-tight sm:text-2xl">카테고리 베스트</h2>
            <p class="mt-1 text-xs text-neutral-500">업보트 많이 받은 순</p>
          </div>
          <div class="hidden gap-2 sm:flex">
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label="이전"
              @click="scrollBest(-1)"
            >
              <UIcon name="i-lucide-chevron-left" class="size-5" />
            </button>
            <button
              type="button"
              class="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              aria-label="다음"
              @click="scrollBest(1)"
            >
              <UIcon name="i-lucide-chevron-right" class="size-5" />
            </button>
          </div>
        </div>

        <div
          ref="bestScroller"
          class="hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        >
          <div
            v-for="p in best"
            :key="p.id"
            class="w-[180px] shrink-0 snap-start sm:w-[200px]"
          >
            <ProductCard :product="p" />
          </div>
        </div>
      </section>

      <!-- 전체 리스트 -->
      <section class="mt-16">
        <div class="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold tracking-tight sm:text-2xl">전체</h2>
            <p class="mt-1 text-xs text-neutral-500">{{ sortedProducts.length }}개</p>
          </div>
          <div class="w-36">
            <USelectMenu
              v-model="sortOption"
              :items="sortOptions"
              value-key="value"
            />
          </div>
        </div>

        <div v-if="sortedProducts.length" class="grid gap-3 grid-cols-[repeat(auto-fit,minmax(160px,1fr))]">
          <ProductCard
            v-for="p in sortedProducts"
            :key="p.id"
            :product="p"
          />
        </div>

        <div v-else class="rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
          <UIcon name="i-lucide-package-open" class="mx-auto size-8 text-neutral-400" />
          <p class="mt-4 text-neutral-500">아직 이 카테고리에 등록된 프로덕트가 없어요</p>
          <UButton to="/submit" color="neutral" variant="solid" class="mt-6">
            첫 프로덕트 등록하기
          </UButton>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
