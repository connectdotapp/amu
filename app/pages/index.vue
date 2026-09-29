<script setup lang="ts">
import type { ProductFilters } from '~/composables/useProducts'

useSeoMeta({
  title: '오늘의 아무',
  description: '오늘의 앱·웹·프로그램. 아무거나 소개하지 않아요.'
})

const route = useRoute()
const router = useRouter()

const { data: allProducts } = useAllPublishedProducts(200)
const { data: categories } = useCategories()
const { data: collections } = usePublishedCollections(6)

const filters = computed<ProductFilters>(() => ({
  q: (route.query.q as string) || '',
  category: (route.query.category as string) || '',
  pricing: (route.query.pricing as string) || '',
  collection: (route.query.collection as string) || '',
  sort: ((route.query.sort as string) || 'latest') as ProductFilters['sort']
}))

const products = computed(() => filterAndSortProducts(allProducts.value || [], filters.value))

const hasActiveFilter = computed(() =>
  !!(filters.value.q || filters.value.category || filters.value.pricing || filters.value.collection)
)

function setFilter(key: keyof ProductFilters, value: string | undefined) {
  const current = filters.value[key]
  const next = current === value ? undefined : value
  router.push({ query: { ...route.query, [key]: next || undefined } })
}

function clearAll() {
  router.push({ query: {} })
}

const pricingOptions = [
  { label: '무료', value: 'free' },
  { label: '프리미엄', value: 'freemium' },
  { label: '유료', value: 'paid' },
  { label: '구독', value: 'subscription' }
]

const sortTabs = [
  { value: 'latest', label: '최신' },
  { value: 'popular', label: '인기' },
  { value: 'pick', label: 'AMU Pick' }
] as const

const featuredCollections = computed(() => (collections.value || []).slice(0, 3))
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6">
    <!-- Four-column taxonomy grid -->
    <section class="grid grid-cols-2 gap-x-6 gap-y-10 pt-4 pb-16 md:grid-cols-4">
      <div>
        <div class="text-sm text-neutral-500">카테고리</div>
        <ul class="mt-4 space-y-2.5">
          <li v-for="c in categories" :key="c.id">
            <button
              class="text-lg font-bold tracking-tight text-neutral-950 transition hover:opacity-60 dark:text-neutral-50"
              :class="filters.category === c.slug && 'underline underline-offset-4 decoration-2'"
              @click="setFilter('category', c.slug)"
            >
              {{ c.name }}
            </button>
          </li>
        </ul>
      </div>

      <div>
        <div class="text-sm text-neutral-500">가격</div>
        <ul class="mt-4 space-y-2.5">
          <li v-for="p in pricingOptions" :key="p.value">
            <button
              class="text-lg font-bold tracking-tight text-neutral-950 transition hover:opacity-60 dark:text-neutral-50"
              :class="filters.pricing === p.value && 'underline underline-offset-4 decoration-2'"
              @click="setFilter('pricing', p.value)"
            >
              {{ p.label }}
            </button>
          </li>
        </ul>
      </div>

      <div>
        <div class="flex items-center justify-between">
          <div class="text-sm text-neutral-500">컬렉션</div>
          <NuxtLink v-if="collections?.length" to="/collections" class="text-xs text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50">
            전체
          </NuxtLink>
        </div>
        <ul v-if="collections?.length" class="mt-4 space-y-2.5">
          <li v-for="c in collections.slice(0, 5)" :key="c.id">
            <NuxtLink
              :to="`/collections/${c.slug}`"
              class="line-clamp-1 text-lg font-bold tracking-tight text-neutral-950 hover:opacity-60 dark:text-neutral-50"
            >
              {{ c.title }}
            </NuxtLink>
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-neutral-400">
          곧 열려요.
        </p>
      </div>

      <div>
        <div class="text-sm text-neutral-500">단축</div>
        <ul class="mt-4 space-y-2.5">
          <li>
            <NuxtLink to="/submit" class="text-lg font-bold tracking-tight text-neutral-950 hover:opacity-60 dark:text-neutral-50">
              프로덕트 등록
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/me/bookmarks" class="text-lg font-bold tracking-tight text-neutral-950 hover:opacity-60 dark:text-neutral-50">
              내 북마크
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Featured collections block -->
    <section v-if="featuredCollections.length" class="mb-16">
      <div class="mb-6 flex items-baseline justify-between">
        <h2 class="text-xl font-bold tracking-tight sm:text-2xl">이번의 컬렉션</h2>
        <NuxtLink to="/collections" class="text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
          전체 보기 →
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CollectionCard
          v-for="c in featuredCollections"
          :key="c.id"
          :collection="c"
        />
      </div>
    </section>

    <!-- Active filter chips -->
    <div v-if="hasActiveFilter" class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-neutral-500">필터:</span>
      <button
        v-if="filters.q"
        class="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
        @click="router.push({ query: { ...route.query, q: undefined } })"
      >
        "{{ filters.q }}"
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
      <button
        v-if="filters.category"
        class="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
        @click="setFilter('category', filters.category)"
      >
        {{ categories?.find(c => c.slug === filters.category)?.name || filters.category }}
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
      <button
        v-if="filters.pricing"
        class="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
        @click="setFilter('pricing', filters.pricing)"
      >
        {{ pricingOptions.find(p => p.value === filters.pricing)?.label || filters.pricing }}
        <UIcon name="i-lucide-x" class="size-3" />
      </button>
      <button
        class="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-950 dark:hover:text-neutral-50"
        @click="clearAll"
      >
        모두 지우기
      </button>
    </div>

    <!-- Sort tabs -->
    <div class="flex items-center justify-between gap-4 pb-8">
      <nav class="flex items-center gap-6 text-sm font-semibold">
        <button
          v-for="tab in sortTabs"
          :key="tab.value"
          class="transition"
          :class="filters.sort === tab.value ? 'text-neutral-950 underline underline-offset-8 decoration-2 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
          @click="router.push({ query: { ...route.query, sort: tab.value === 'latest' ? undefined : tab.value } })"
        >
          {{ tab.label }}
        </button>
      </nav>

      <span class="text-xs text-neutral-500">{{ products.length }}개</span>
    </div>

    <!-- Cards grid -->
    <section v-if="products.length" class="grid grid-cols-1 gap-4 pb-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <ProductCard
        v-for="p in products"
        :key="p.id"
        :product="p"
      />
    </section>

    <div v-else-if="hasActiveFilter" class="mx-auto max-w-xl rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search-x" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">일치하는 프로덕트가 없어요.</p>
      <button
        class="mt-6 text-sm text-neutral-950 underline underline-offset-4 dark:text-neutral-50"
        @click="clearAll"
      >
        필터 지우기
      </button>
    </div>

    <div v-else class="mx-auto max-w-xl rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 등록된 프로덕트가 없어요.</p>
    </div>
  </div>
</template>
