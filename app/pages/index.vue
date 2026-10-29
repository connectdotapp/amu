<script setup lang="ts">
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
const { data: categories } = useCategories()

// 순위용 — 상위 N개
const rankedProducts = computed(() =>
  [...(allProducts.value || [])]
    .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
)

// 이번 주의 아무 3 — AMU Pick 우선, 모자라면 업보트 순으로 보충
const weeklyTop3 = computed(() => {
  const picks = (allProducts.value || []).filter(p => p.source === 'curated')
  const sortedPicks = [...picks].sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
  const fill = rankedProducts.value.filter(p => !sortedPicks.find(x => x.id === p.id))
  return [...sortedPicks, ...fill].slice(0, 3)
})

// 큐레이터의 숨은 Pick — Top 3 다음 2개
const hiddenPicks = computed(() => {
  const top3Ids = new Set(weeklyTop3.value.map(p => p.id))
  return rankedProducts.value.filter(p => !top3Ids.has(p.id)).slice(0, 2)
})

// 인기 순위 전체 (상위 10)
const topRanking = computed(() => rankedProducts.value.slice(0, 10))

// Hero search
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

// 히어로 배너 캐러셀 — 유지
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

function nextHero() { heroIndex.value = (heroIndex.value + 1) % heroBanners.length }
function prevHero() { heroIndex.value = (heroIndex.value - 1 + heroBanners.length) % heroBanners.length }

onMounted(() => {
  heroTimer = setInterval(() => {
    if (!heroPaused.value) nextHero()
  }, 5000)
})

onBeforeUnmount(() => { if (heroTimer) clearInterval(heroTimer) })

// 모바일 스와이프
const touchStartX = ref<number | null>(null)
function onHeroTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0]?.clientX ?? null
  heroPaused.value = true
}
function onHeroTouchEnd(e: TouchEvent) {
  const start = touchStartX.value
  touchStartX.value = null
  heroPaused.value = false
  if (start === null) return
  const endX = e.changedTouches[0]?.clientX ?? start
  const delta = endX - start
  if (Math.abs(delta) < 50) return
  if (delta < 0) nextHero()
  else prevHero()
}

// 큐레이터 노트 — 정적 콘텐츠. 운영 시 CMS/컬렉션으로 이관 예정.
const curatorNote = {
  week: 23,
  title: '이번 주, 저는 32개 중 3개를 고르기 위해\n42시간을 썼습니다.',
  body: '대형 서비스 광고가 밀려오는 세상에서, 숨은 작품을 발굴하는 일은 여전히 손으로 하는 일이에요. 매주 월요일 오전 10시의 \'아무 3\' 뒤엔 긴 밤과 수십 번의 시연이 있어요. 이번 주 이야기를 전해드려요.',
  meta: [
    { icon: '⏱', label: '큐레이션', value: '42시간' },
    { icon: '📱', label: '시연', value: '32개' },
    { icon: '✂', label: '선정', value: '3개' }
  ]
}

// 아무 매거진 — 정적 플레이스홀더. 운영 시 /magazine 또는 Firestore 'posts' 로 전환.
const magazine = [
  {
    cat: '큐레이션 비교',
    title: '디스콰이엇, 아무, 프로덕트헌트 — 당신이 올려야 할 곳',
    sub: '인디메이커의 플랫폼 선택 가이드',
    gradient: 'from-pink-100 to-pink-200',
    to: '#'
  },
  {
    cat: '메이커 인터뷰',
    title: '"안와요"는 어떻게 2주 만에 1,000명을 모았나',
    sub: '쇼핑 금고 앱 메이커 인터뷰',
    gradient: 'from-blue-100 to-blue-300',
    to: '#'
  },
  {
    cat: '가이드',
    title: '앱 아이콘 36px에서 살아남는 법',
    sub: 'iOS 홈 화면 디자인 치트시트',
    gradient: 'from-emerald-100 to-emerald-300',
    to: '#'
  }
]
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-5 md:px-6">
    <!-- 유지: 모바일 카테고리 탭 -->
    <nav class="no-scrollbar -mx-5 flex gap-[22px] overflow-x-auto whitespace-nowrap border-b border-neutral-100 px-5 text-[15px] font-bold text-neutral-400 md:hidden dark:border-neutral-800">
      <NuxtLink to="/" class="flex min-h-11 shrink-0 items-center text-neutral-950 shadow-[inset_0_-2px_0_#0A0A0A] dark:text-neutral-50">
        전체
      </NuxtLink>
      <NuxtLink
        v-for="c in categories"
        :key="c.slug"
        :to="`/categories/${c.slug}`"
        class="flex min-h-11 shrink-0 items-center active:text-neutral-950"
      >
        {{ c.name }}
      </NuxtLink>
    </nav>

    <!-- 유지: 히어로 배너 캐러셀 -->
    <section class="pt-6 md:pt-8">
      <div
        class="relative aspect-[2/1] touch-pan-y overflow-hidden rounded-[20px] bg-neutral-100 md:aspect-[35/9] md:rounded-3xl"
        @mouseenter="heroPaused = true"
        @mouseleave="heroPaused = false"
        @touchstart.passive="onHeroTouchStart"
        @touchend="onHeroTouchEnd"
      >
        <picture
          v-for="(src, i) in heroBanners"
          :key="src"
          class="absolute inset-0 block size-full transition-opacity duration-700"
          :class="heroIndex === i ? 'opacity-100' : 'opacity-0'"
        >
          <source
            media="(max-width: 640px)"
            :srcset="src.replace('.png', '-m.webp')"
            type="image/webp"
          >
          <source
            :srcset="src.replace('.png', '.webp')"
            type="image/webp"
          >
          <img
            :src="src"
            alt=""
            class="size-full object-cover object-center"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
            :loading="i === 0 ? 'eager' : 'lazy'"
            decoding="async"
          >
        </picture>

        <div class="absolute bottom-3 left-4 flex items-center gap-1.5 md:bottom-5 md:left-1/2 md:-translate-x-1/2 md:gap-2">
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

    <!-- 유지: 새로운 발견 h1 + 검색창 -->
    <section class="pt-8 pb-10 md:pt-14 md:pb-14">
      <h1 class="text-2xl font-bold tracking-tight md:text-4xl lg:text-5xl">
        새로운 발견
      </h1>

      <form class="mt-6 hidden max-w-xl md:block md:mt-8" @submit.prevent="submitHeroSearch">
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
            class="min-w-0 flex-1 bg-transparent text-base outline-none md:text-[15px]"
          >
        </div>
      </form>
    </section>

    <!-- ============================================================ -->
    <!-- NEW: 이번 주의 아무 3                                         -->
    <!-- ============================================================ -->
    <section class="pb-16 md:pb-14">
      <div class="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 class="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px]">이번 주의 아무 3</h2>
          <p class="mt-1 text-xs text-neutral-500 md:text-sm">큐레이터가 월요일 오전 10시에 발표한 이번 주 세 작품</p>
        </div>
        <NuxtLink to="/collections" class="-mr-2 shrink-0 px-2 pb-1 text-xs text-neutral-500">
          지난 주 아무 →
        </NuxtLink>
      </div>

      <div v-if="weeklyTop3.length" class="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
        <NuxtLink
          v-for="(p, i) in weeklyTop3"
          :key="p.id"
          :to="`/products/${p.slug || p.id}`"
          class="group relative block overflow-hidden rounded-[20px] bg-neutral-50 p-5 transition hover:-translate-y-0.5 md:rounded-3xl md:p-7 dark:bg-neutral-900"
        >
          <span
            class="absolute right-5 top-4 text-[44px] font-black leading-none tracking-tight md:right-6 md:top-5 md:text-[56px]"
            :class="i === 0 ? 'text-[var(--color-amu-pink)]' : 'text-neutral-200 dark:text-neutral-800'"
          >{{ i + 1 }}</span>

          <img
            :src="p.thumbnailUrl"
            :alt="p.name"
            class="size-[60px] rounded-[14px] bg-neutral-100 object-cover md:size-[72px] md:rounded-[18px]"
          >

          <div class="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-amu-pink)]">
            <span class="size-1.5 rounded-full bg-[var(--color-amu-pink)]" />
            AMU PICK #{{ i + 1 }}
          </div>

          <h3 class="mt-2 text-[17px] font-bold tracking-tight md:text-xl">{{ p.name }}</h3>
          <p class="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500 md:text-sm md:min-h-[44px]">
            {{ p.tagline }}
          </p>

          <div class="mt-5 flex items-center justify-between text-xs font-bold text-neutral-400">
            <span>{{ p.category }}<span v-if="p.pricing"> · {{ p.pricing === 'free' ? '무료' : p.pricing === 'paid' ? '유료' : p.pricing === 'freemium' ? '프리미엄' : '구독' }}</span></span>
            <span class="text-neutral-950 dark:text-neutral-50">↑ {{ p.upvoteCount ?? 0 }}</span>
          </div>
        </NuxtLink>
      </div>
      <p v-else class="py-10 text-center text-sm text-neutral-400">
        이번 주 큐레이션 준비 중이에요
      </p>
    </section>

    <!-- ============================================================ -->
    <!-- NEW: 큐레이터의 숨은 Pick                                     -->
    <!-- ============================================================ -->
    <section v-if="hiddenPicks.length" class="pb-16 md:pb-14">
      <div class="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 class="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px]">큐레이터의 숨은 Pick</h2>
          <p class="mt-1 text-xs text-neutral-500 md:text-sm">TOP 3엔 못 들었지만 꼭 소개하고 싶었던 두 작품</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <NuxtLink
          v-for="p in hiddenPicks"
          :key="p.id"
          :to="`/products/${p.slug || p.id}`"
          class="group flex items-start gap-4 rounded-2xl border border-neutral-100 bg-white p-5 transition hover:border-neutral-300 md:gap-5 dark:border-neutral-800 dark:bg-neutral-950"
        >
          <img
            :src="p.thumbnailUrl"
            :alt="p.name"
            class="size-14 shrink-0 rounded-[12px] bg-neutral-100 object-cover md:size-[60px] md:rounded-[14px]"
          >
          <div class="min-w-0 flex-1">
            <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">큐레이터 코멘트</span>
            <h4 class="mt-1 text-[15px] font-bold tracking-tight md:text-base">{{ p.name }}</h4>
            <p class="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500">
              "{{ p.tagline }}"
            </p>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- NEW: 인기 순위 (풀와이드)                                     -->
    <!-- ============================================================ -->
    <section v-if="topRanking.length" class="pb-16 md:pb-14">
      <div class="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 class="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px]">인기 순위</h2>
          <p class="mt-1 text-xs text-neutral-500 md:text-sm">누적 업보트 기준으로 집계해요</p>
        </div>
        <NuxtLink to="/rankings/weekly" class="-mr-2 shrink-0 px-2 pb-1 text-xs text-neutral-500">
          전체 보기 →
        </NuxtLink>
      </div>

      <div class="rounded-2xl bg-neutral-50 p-2 md:rounded-3xl md:p-3 dark:bg-neutral-900">
        <template v-for="(p, i) in topRanking" :key="p.id">
          <NuxtLink
            :to="`/products/${p.slug || p.id}`"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white md:gap-4 md:px-4 md:py-3 dark:hover:bg-neutral-800"
          >
            <span
              class="w-5 shrink-0 text-left text-[15px] font-bold tabular-nums md:w-6"
              :class="i < 3 ? 'text-[var(--color-amu-pink)]' : 'text-neutral-400'"
            >{{ i + 1 }}</span>
            <img
              :src="p.thumbnailUrl"
              :alt="p.name"
              class="size-10 shrink-0 rounded-[10px] bg-neutral-100 object-cover md:size-11 md:rounded-xl"
            >
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-bold tracking-tight md:text-[15px]">{{ p.name }}</div>
              <div class="truncate text-xs text-neutral-500 md:text-[13px]">{{ p.tagline }}</div>
            </div>
            <span class="shrink-0 text-xs font-bold tabular-nums text-neutral-950 md:text-[13px] dark:text-neutral-50">↑ {{ p.upvoteCount ?? 0 }}</span>
          </NuxtLink>
        </template>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- NEW: 큐레이터 노트                                            -->
    <!-- ============================================================ -->
    <section class="pb-16 md:pb-14">
      <div class="grid grid-cols-1 gap-6 overflow-hidden rounded-[24px] bg-neutral-950 p-8 text-white md:grid-cols-[5fr_7fr] md:gap-9 md:rounded-[28px] md:p-12">
        <div class="flex aspect-[16/10] items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-900 to-black text-[80px] md:aspect-[4/5] md:text-[120px]">
          🐦
        </div>
        <div>
          <span class="inline-flex items-center gap-2 rounded-full bg-white/8 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-amu-pink)]">
            큐레이터 노트 · WEEK {{ curatorNote.week }}
          </span>
          <h3 class="mt-5 whitespace-pre-line text-[22px] font-bold tracking-tight md:text-[28px]">
            {{ curatorNote.title }}
          </h3>
          <p class="mt-4 text-[15px] leading-relaxed text-neutral-400">
            {{ curatorNote.body }}
          </p>
          <div class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-400">
            <span v-for="m in curatorNote.meta" :key="m.label" class="inline-flex items-center gap-1.5">
              {{ m.icon }} <strong class="text-white">{{ m.value }}</strong> {{ m.label }}
            </span>
          </div>
          <a href="#" class="mt-7 inline-flex items-center gap-1 border-b-2 border-white pb-1 text-[15px] font-bold text-white">
            이번 주 일기 전문 읽기 →
          </a>
        </div>
      </div>
    </section>

    <!-- ============================================================ -->
    <!-- NEW: 아무 매거진                                              -->
    <!-- ============================================================ -->
    <section class="pb-24 md:pb-20">
      <div class="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 class="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px]">아무 매거진</h2>
          <p class="mt-1 text-xs text-neutral-500 md:text-sm">작은 메이커의 큰 이야기, 디자인·창업 가이드</p>
        </div>
        <NuxtLink to="/community" class="-mr-2 shrink-0 px-2 pb-1 text-xs text-neutral-500">
          매거진 홈 →
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        <NuxtLink
          v-for="m in magazine"
          :key="m.title"
          :to="m.to"
          class="group flex flex-col"
        >
          <div
            class="mb-4 aspect-[16/10] rounded-2xl bg-gradient-to-br"
            :class="m.gradient"
          />
          <span class="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--color-amu-pink)]">
            {{ m.cat }}
          </span>
          <h4 class="mt-2 text-[16px] font-bold leading-snug tracking-tight md:text-[17px]">
            {{ m.title }}
          </h4>
          <p class="mt-1 text-xs text-neutral-500 md:text-[13px]">{{ m.sub }}</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
