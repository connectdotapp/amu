<script setup lang="ts">
import type { ProductFilters } from '~/composables/useProducts'

useSeoMeta({
  title: '오늘의 아무',
  description: '오늘의 앱·웹·프로그램. 아무거나 소개하지 않아요.'
})

defineOgImageComponent('Default', {
  eyebrow: 'AMU',
  title: '오늘의 새로운 발견',
  description: '내 일상을 함께할 아무를 찾는다. 매주 월요일 3개.'
})

const route = useRoute()
const router = useRouter()

const { data: allProducts } = useAllPublishedProducts(200)
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

// Today's Pick — the most recent curated product
const featuredPick = computed(() => (allProducts.value || []).find(p => p.source === 'curated'))

const pricingLabelKR: Record<string, string> = {
  free: '무료', freemium: '프리미엄', paid: '유료', subscription: '구독'
}

// Weekly ranking — top 7 by upvoteCount
const rankedProducts = computed(() =>
  [...(allProducts.value || [])]
    .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
    .slice(0, 7)
)

// 주제별 홈 섹션. category/tags/name/tagline 을 느슨하게 매칭 — 초기 데이터
// 적을 때도 섹션이 살아 보이게. 첫 키워드가 "전체 보기" 링크의 ?q 로 쓰임.
type HomeTheme = { key: string, eyebrow: string, title: string, keywords: string[] }

const homeThemes: HomeTheme[] = [
  { key: 'lifestyle', eyebrow: 'Lifestyle', title: '라이프스타일', keywords: ['라이프', 'life', 'lifestyle', '일상', '일기', '다이어리', '서비스', 'service', '예약', '매칭', '배달', '취미', 'hobby', '사진'] },
  { key: 'productivity', eyebrow: 'Productivity', title: '생산성', keywords: ['생산성', 'productivity', '노션', 'notion', 'linear', '효율', '업무', '관리', '할일', 'todo', '시간', '포커스'] },
  { key: 'entertainment', eyebrow: 'Entertainment', title: '엔터테인먼트', keywords: ['엔터테인먼트', 'entertainment', '영화', '드라마', '음악', 'music', '만화', '웹툰', '팬', 'ott', '릴스'] }
]

function matchesTheme(p: { name?: string, tagline?: string, category?: string, tags?: string[] }, keywords: string[]) {
  const haystack = `${p.name ?? ''} ${p.tagline ?? ''} ${p.category ?? ''} ${(p.tags || []).join(' ')}`.toLowerCase()
  return keywords.some(k => haystack.includes(k.toLowerCase()))
}

const themedSections = computed(() => {
  const all = allProducts.value || []
  return homeThemes.map(t => ({
    ...t,
    products: all.filter(p => matchesTheme(p, t.keywords)).slice(0, 4)
  }))
})

// 메이커 이야기 — makerStory 가 채워진 프로덕트만. 최신 publishedAt 순.
const makerStories = computed(() => {
  const all = allProducts.value || []
  return all
    .filter(p => {
      const m = p.makerStory
      return !!m && !!(m.videoUrl || m.oneLiner || m.qa?.some(x => x.a?.trim()))
    })
    .slice(0, 4)
})

// "N월 M주차" — week of the current month
const currentWeekLabel = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const weekOfMonth = Math.ceil(now.getDate() / 7)
  return `${month}월 ${weekOfMonth}주차`
})

// Hero search — auto-focus when arriving via ?focus=search
const heroSearchInput = ref((route.query.q as string) || '')
watch(() => route.query.q, (v) => { heroSearchInput.value = (v as string) || '' })

const analytics = useAnalytics()

function submitHeroSearch() {
  const q = heroSearchInput.value.trim()
  const { focus: _drop, ...rest } = route.query
  router.push({ query: { ...rest, q: q || undefined } })
  if (q) analytics.search(q)
}

const heroSearchRef = ref<HTMLInputElement | null>(null)
onMounted(() => {
  if (route.query.focus === 'search' && heroSearchRef.value) {
    heroSearchRef.value.focus()
    const { focus: _drop, ...rest } = route.query
    router.replace({ query: rest })
  }
})

// 히어로 배너 캐러셀. public/hero-banner-N.png 파일을 교체하면 즉시 반영.
const heroBanners = [
  '/hero-banner.png',
  '/hero-banner-2.png',
  '/hero-banner-3.png',
  '/hero-banner-4.png',
  '/hero-banner-5.png'
]
const heroIndex = ref(0)
const heroPaused = ref(false)
let heroTimer: ReturnType<typeof setInterval> | null = null

function nextHero() {
  heroIndex.value = (heroIndex.value + 1) % heroBanners.length
}

onMounted(() => {
  heroTimer = setInterval(() => {
    if (!heroPaused.value) nextHero()
  }, 5000)
})

onBeforeUnmount(() => {
  if (heroTimer) clearInterval(heroTimer)
})
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-6">
    <!-- Hero banner carousel — 5개 자동 전환. public/hero-banner-N.png 교체로 반영. -->
    <section class="pt-6">
      <div
        class="relative aspect-[35/9] overflow-hidden rounded-3xl bg-neutral-100"
        @mouseenter="heroPaused = true"
        @mouseleave="heroPaused = false"
      >
        <img
          v-for="(src, i) in heroBanners"
          :key="src"
          :src="src"
          alt=""
          class="absolute inset-0 size-full object-cover transition-opacity duration-700"
          :class="heroIndex === i ? 'opacity-100' : 'opacity-0'"
        >

        <!-- 점선 인디케이터 -->
        <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <button
            v-for="(_, i) in heroBanners"
            :key="i"
            type="button"
            class="h-2 rounded-full transition-all"
            :class="heroIndex === i
              ? 'w-6 bg-white'
              : 'w-2 bg-white/50 hover:bg-white/80'"
            :aria-label="`배너 ${i + 1}`"
            @click="heroIndex = i"
          />
        </div>
      </div>
    </section>

    <div class="grid gap-10 lg:grid-cols-[1fr_320px]">
      <!-- MAIN CONTENT -->
      <div class="min-w-0">
        <!-- Hero -->
        <section class="pt-10 pb-10 sm:pt-14">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
            오늘의 새로운 발견
          </h1>

          <form class="mt-8 max-w-xl" @submit.prevent="submitHeroSearch">
            <div class="flex items-center gap-3 rounded-full bg-neutral-100 px-5 py-3.5 dark:bg-neutral-800">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-5 shrink-0 text-neutral-950 dark:text-neutral-50"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7.5" />
                <path d="m20.5 20.5-4.3-4.3" />
              </svg>
              <input
                ref="heroSearchRef"
                v-model="heroSearchInput"
                type="text"
                placeholder="이름, 태그, 설명으로 검색"
                class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-neutral-400"
              >
            </div>
          </form>
        </section>

        <!-- Today's Pick -->
        <section v-if="featuredPick" class="pb-12">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Today's Pick</div>
              <h2 class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">오늘의 아무</h2>
            </div>
            <NuxtLink to="/?sort=pick" class="shrink-0 pb-1 text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
              전체 보기 →
            </NuxtLink>
          </div>

          <NuxtLink
            :to="`/products/${featuredPick.slug || featuredPick.id}`"
            class="block rounded-3xl bg-neutral-100 p-8 transition hover:bg-neutral-150 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <div class="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
              <img
                :src="featuredPick.thumbnailUrl"
                :alt="featuredPick.name"
                class="size-28 shrink-0 rounded-3xl bg-neutral-50 object-cover sm:size-32"
              >
              <div class="min-w-0 flex-1">
                <span class="inline-block rounded-full bg-[#F2293A] px-2.5 py-1 text-[11px] font-semibold text-white">
                  AMU Pick
                </span>
                <h3 class="mt-3 text-2xl font-bold tracking-tight sm:text-[26px]">
                  {{ featuredPick.name }}
                </h3>
                <p class="mt-2 text-[15px] leading-relaxed text-neutral-500">
                  {{ featuredPick.tagline }}
                </p>
                <div class="mt-4 flex flex-wrap gap-1.5">
                  <span v-if="featuredPick.category" class="rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {{ featuredPick.category }}
                  </span>
                  <span v-if="featuredPick.pricing" class="rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {{ pricingLabelKR[featuredPick.pricing] || featuredPick.pricing }}
                  </span>
                  <span
                    v-for="t in (featuredPick.tags || []).slice(0, 3)"
                    :key="t"
                    class="rounded-full bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {{ t }}
                  </span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </section>

        <!-- Themed collections -->
        <section
          v-for="t in themedSections"
          :key="t.key"
          class="pb-12"
        >
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">{{ t.eyebrow }}</div>
              <h2 class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{{ t.title }}</h2>
            </div>
            <NuxtLink
              :to="`/?q=${encodeURIComponent(t.keywords[0]!)}`"
              class="shrink-0 pb-1 text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50"
            >
              전체 보기 →
            </NuxtLink>
          </div>

          <div v-if="t.products.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <ProductCard
              v-for="p in t.products"
              :key="p.id"
              :product="p"
            />
          </div>
          <p v-else class="pb-2 text-sm text-neutral-400">
            곧 큐레이션돼요
          </p>
        </section>

        <!-- 메이커 이야기 -->
        <section v-if="makerStories.length" class="pb-12">
          <div class="mb-5 flex items-end justify-between gap-4">
            <div>
              <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Maker Voice</div>
              <h2 class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">메이커 이야기</h2>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <NuxtLink
              v-for="p in makerStories"
              :key="p.id"
              :to="`/products/${p.slug || p.id}?tab=maker`"
              class="group flex flex-col gap-4 rounded-3xl bg-neutral-100 p-6 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="p.thumbnailUrl"
                  :alt="p.name"
                  class="size-12 shrink-0 rounded-xl bg-neutral-50 object-cover"
                >
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-bold tracking-tight">{{ p.name }}</div>
                  <button
                    v-if="p.maker"
                    type="button"
                    class="mt-0.5 block truncate text-xs text-neutral-500 hover:underline"
                    @click.stop.prevent="navigateTo(`/makers/${encodeURIComponent(p.maker)}`)"
                  >
                    by {{ p.maker }}
                  </button>
                </div>
                <UIcon name="i-lucide-mic" class="size-4 shrink-0 text-neutral-400" />
              </div>

              <blockquote
                v-if="p.makerStory?.oneLiner"
                class="border-l-[3px] border-[#F2293A] pl-3 text-[15px] font-semibold leading-snug tracking-tight line-clamp-3"
              >
                "{{ p.makerStory.oneLiner }}"
              </blockquote>
              <p
                v-else-if="p.makerStory?.qa?.[0]?.a"
                class="line-clamp-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
              >
                {{ p.makerStory.qa[0].a }}
              </p>
            </NuxtLink>
          </div>
        </section>

        <!-- Active filter chips -->
        <div v-if="hasActiveFilter" class="mb-4 flex flex-wrap items-center gap-2">
          <span class="text-xs text-neutral-500">필터</span>
          <button
            v-if="filters.q"
            class="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
            @click="router.push({ query: { ...route.query, q: undefined } })"
          >
            "{{ filters.q }}"
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

        <!-- Latest section -->
        <section class="pb-24">
          <div class="mb-5">
            <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Latest</div>
            <h2 class="mt-1 text-xl font-bold tracking-tight sm:text-2xl">새로 발견한 것들</h2>
          </div>

          <!-- Sort tabs -->
          <nav class="flex items-center gap-5 pb-3 text-sm font-bold">
            <button
              v-for="tab in sortTabs"
              :key="tab.value"
              class="relative pb-2 transition"
              :class="filters.sort === tab.value ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
              @click="router.push({ query: { ...route.query, sort: tab.value === 'latest' ? undefined : tab.value } })"
            >
              {{ tab.label }}
              <span
                v-if="filters.sort === tab.value"
                class="absolute inset-x-0 -bottom-[9px] h-0.5 bg-neutral-950 dark:bg-neutral-50"
              />
            </button>
          </nav>

          <!-- Pricing chips row + count -->
          <div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span class="mr-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Pricing</span>
            <button
              v-for="p in pricingOptions"
              :key="p.value"
              type="button"
              class="rounded-full px-3 py-1 text-xs font-semibold transition"
              :class="filters.pricing === p.value
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                : 'bg-neutral-100 text-neutral-500 hover:text-neutral-950 dark:bg-neutral-800 dark:hover:text-neutral-50'"
              @click="setFilter('pricing', p.value)"
            >
              {{ p.label }}
            </button>
            <span class="ml-auto text-xs tabular-nums text-neutral-400">{{ products.length }}개</span>
          </div>

          <!-- Cards grid -->
          <section v-if="products.length" class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <ProductCard
              v-for="p in products"
              :key="p.id"
              :product="p"
            />
          </section>

          <div v-else-if="hasActiveFilter" class="mt-6 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
            <UIcon name="i-lucide-search-x" class="mx-auto size-8 text-neutral-400" />
            <p class="mt-4 text-neutral-500">일치하는 프로덕트가 없어요</p>
            <button class="mt-6 text-sm text-neutral-950 underline underline-offset-4 dark:text-neutral-50" @click="clearAll">
              필터 지우기
            </button>
          </div>

          <div v-else class="mt-6 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
            <UIcon name="i-lucide-search" class="mx-auto size-8 text-neutral-400" />
            <p class="mt-4 text-neutral-500">아직 등록된 프로덕트가 없어요</p>
          </div>
        </section>
      </div>

      <!-- SIDEBAR: Weekly ranking + Collections -->
      <aside class="lg:pt-[86px]">
        <div class="sticky top-24 space-y-4">
          <!-- Ranking card -->
          <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-900">
            <h3 class="text-lg font-bold tracking-tight">이번 주 순위</h3>
            <div class="mt-1 text-xs text-neutral-400">{{ currentWeekLabel }}</div>

            <div v-if="rankedProducts.length" class="mt-4 flex flex-col gap-1">
              <NuxtLink
                v-for="(p, i) in rankedProducts"
                :key="p.id"
                :to="`/products/${p.slug || p.id}`"
                class="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-neutral-150 dark:hover:bg-neutral-800"
              >
                <div
                  class="w-5 shrink-0 text-left text-[17px] font-bold leading-none tracking-tight"
                  :class="i < 3 ? 'text-[var(--color-amu-pink)]' : 'text-neutral-950 dark:text-neutral-50'"
                >
                  {{ i + 1 }}
                </div>
                <img
                  :src="p.thumbnailUrl"
                  :alt="p.name"
                  class="size-10 shrink-0 rounded-xl bg-neutral-50 object-cover"
                >
                <div class="min-w-0 flex-1">
                  <div class="truncate text-sm font-bold tracking-tight">{{ p.name }}</div>
                  <div class="mt-0.5 truncate text-xs text-neutral-400">{{ p.tagline }}</div>
                </div>
                <div class="shrink-0 text-right text-xs font-bold tabular-nums text-neutral-400">
                  ↑ {{ p.upvoteCount ?? 0 }}
                </div>
              </NuxtLink>
            </div>

            <div v-else class="mt-4 py-4 text-center text-sm text-neutral-400">
              아직 순위가 없어요
            </div>

            <NuxtLink
              to="/rankings/weekly"
              class="mt-3 flex items-center justify-center gap-1 py-2 text-xs font-semibold text-neutral-400 transition hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              더 보기
              <UIcon name="i-lucide-chevron-right" class="size-3.5" />
            </NuxtLink>
          </div>

          <!-- Collections quick list -->
          <div v-if="collections?.length" class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-900">
            <div class="flex items-center justify-between">
              <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Collection</div>
              <NuxtLink to="/collections" class="text-xs text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50">
                전체
              </NuxtLink>
            </div>
            <ul class="mt-4 space-y-3">
              <li
                v-for="c in collections.slice(0, 4)"
                :key="c.id"
                class="text-[15px] font-bold tracking-tight"
              >
                <NuxtLink :to="`/collections/${c.slug}`" class="line-clamp-1 transition hover:text-neutral-500">
                  {{ c.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Quick links -->
          <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-900">
            <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Quick</div>
            <ul class="mt-4 space-y-2.5 text-[15px] font-bold tracking-tight">
              <li><NuxtLink to="/submit" class="hover:text-neutral-500">프로덕트 등록</NuxtLink></li>
              <li><NuxtLink to="/compare" class="hover:text-neutral-500">비교하기</NuxtLink></li>
              <li><NuxtLink to="/me/bookmarks" class="hover:text-neutral-500">내 북마크</NuxtLink></li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
