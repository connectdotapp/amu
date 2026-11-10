<script setup lang="ts">
import { deleteDoc, doc } from 'firebase/firestore'
import type { Platform } from '~/types/product'

const route = useRoute()
const id = String(route.params.id)

const { data: product, error } = await useProductById(id)
// 조회 실패는 503(크롤러 재시도·CDN 미캐시), 문서가 없거나 비공개면 404.
if (error.value) throw createError({ statusCode: 503, statusMessage: '잠시 후 다시 시도해 주세요', fatal: true })
if (!product.value) throw createError({ statusCode: 404, statusMessage: '프로덕트를 찾을 수 없어요', fatal: true })

const site = useSiteConfig()

const user = useCurrentUser()
const isAdmin = ref(false)
watchEffect(async () => {
  if (!user.value) { isAdmin.value = false; return }
  try {
    const token = await user.value.getIdTokenResult()
    isAdmin.value = !!token.claims.admin
  } catch { isAdmin.value = false }
})

const db = useFirestore()
const toast = useToast()
const analytics = useAnalytics()

// 등록한 본인이면 수정 가능 (관리자는 아래 관리자 액션에서).
const isOwner = computed(() => !!user.value && !!product.value && user.value.uid === product.value.submittedBy)

// 바로가기: 링크 종류(웹·앱스토어·플레이스토어)별 첫 링크. 둘 이상이면 골라서 가게 메뉴로 보여준다.
const goLinks = computed(() => {
  const seen = new Set<string>()
  return (product.value?.links || []).filter((l) => {
    const k = linkKind(l.url)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
})
const linkIcon = (url: string) => ({ appstore: 'i-simple-icons-appstore', playstore: 'i-simple-icons-googleplay', web: 'i-lucide-globe' })[linkKind(url)]
function trackLink(url: string) {
  analytics.externalLink({ productId: id, productName: product.value?.name ?? '', url })
}
const goMenuItems = computed(() => goLinks.value.map(l => ({
  label: linkGoLabel(l),
  icon: linkIcon(l.url),
  to: l.url,
  target: '_blank',
  onSelect: () => trackLink(l.url)
})))

// 상세 뷰 이벤트. product 로드 완료되면 1회 로깅.
watch(product, (p) => {
  if (!p) return
  analytics.productView({
    productId: p.id,
    productSlug: p.slug,
    productName: p.name,
    category: p.category,
    pricing: p.pricing,
    source: p.source
  })
}, { immediate: true, once: true })

async function removeProduct() {
  if (!product.value) return
  if (!confirm(`"${product.value.name}" 프로덕트를 삭제할까요? 되돌릴 수 없어요.`)) return
  try {
    await deleteDoc(doc(db, 'products', id))
    toast.add({ title: '삭제됐어요', color: 'success' })
    await navigateTo('/')
  } catch (e: any) {
    toast.add({ title: '삭제 실패', description: e?.message, color: 'error' })
  }
}

useSeoMeta({
  title: () => product.value?.name ?? '프로덕트',
  description: () => product.value?.tagline,
  ogTitle: () => product.value?.name,
  ogDescription: () => product.value?.tagline,
  ogType: 'article',
  ogUrl: () => `${site.url}/products/${id}`
})

// 동적 OG 이미지: 프로덕트 데이터로 자동 생성.
defineOgImageComponent('Product', {
  name: () => product.value?.name,
  tagline: () => product.value?.tagline,
  category: () => product.value?.category,
  pricing: () => product.value?.pricing,
  thumbnailUrl: () => product.value?.thumbnailUrl,
  isPick: () => product.value?.source === 'curated'
})

useSchemaOrg([
  defineWebPage(),
  defineSoftwareApp({
    name: () => product.value?.name,
    description: () => product.value?.tagline,
    image: () => product.value?.thumbnailUrl,
    applicationCategory: () => product.value?.category,
    operatingSystem: () => product.value?.platforms?.join(', ')
  })
])

const pricingLabel: Record<string, string> = {
  free: '무료',
  freemium: '프리미엄',
  paid: '유료',
  subscription: '구독'
}

const platformLabel: Record<Platform, string> = {
  web: '웹',
  ios: 'iOS',
  android: 'Android',
  macos: 'macOS',
  windows: 'Windows',
  linux: 'Linux'
}

const { data: categories } = useCategories()

// 카테고리·가격·플랫폼·태그를 해시태그로. 한글 카테고리명을 쓰고, 띄어쓰기는 붙이고, 중복은 한 번만.
const hashtags = computed(() => {
  const p = product.value
  if (!p) return []
  const categoryName = categories.value?.find(c => c.id === p.category)?.name || p.category
  const raw = [
    categoryName,
    p.pricing ? (pricingLabel[p.pricing] || p.pricing) : '',
    ...(p.platforms || []).map(pf => platformLabel[pf] || pf),
    ...(p.tags || []).slice(0, 6)
  ]
  return [...new Set(raw.map(s => (s || '').replace(/\s+/g, '')).filter(Boolean))]
})

const hasShowroom = computed(() => {
  const s = product.value?.showroom
  if (!s) return false
  return !!(
    s.investorPitch
    || s.monthlyUsersRange
    || s.monthlyRevenueRange
    || s.teamSize
    || s.foundedAt
    || s.location
  )
})

type Tab = 'overview' | 'maker' | 'showroom' | 'links' | 'comments'
const activeTab = ref<Tab>((route.query.tab as Tab) || 'overview')

const hasMakerStory = computed(() => {
  const m = product.value?.makerStory
  if (!m) return false
  return !!(m.videoUrl || m.oneLiner || m.qa?.some(x => x.a?.trim()))
})

// YouTube URL → 임베드 URL 변환. watch?v= / youtu.be / shorts/ 모두 지원.
const youtubeEmbed = computed(() => {
  const url = product.value?.makerStory?.videoUrl
  if (!url) return null
  const m = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
})

const tabs = computed(() => {
  const list: Array<{ value: Tab, label: string, visible: boolean }> = [
    { value: 'overview', label: '소개', visible: !!product.value?.description },
    { value: 'maker', label: '메이커', visible: hasMakerStory.value },
    { value: 'showroom', label: '쇼룸', visible: hasShowroom.value },
    { value: 'links', label: '링크', visible: !!(product.value?.links?.length) },
    { value: 'comments', label: `댓글${product.value?.commentCount ? ` · ${product.value.commentCount}` : ''}`, visible: true }
  ]
  return list.filter(t => t.visible)
})

// If the initially selected tab isn't visible for this product, fall back to
// the first available tab.
watchEffect(() => {
  if (!tabs.value.length) return
  if (!tabs.value.some(t => t.value === activeTab.value)) {
    activeTab.value = tabs.value[0]!.value
  }
})
</script>

<template>
  <div class="mx-auto max-w-[900px] px-5 pb-28 pt-2 md:px-6 md:pb-24">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      둘러보기
    </NuxtLink>

    <!-- Admin actions -->
    <div v-if="isAdmin && product" class="mb-6 flex items-center gap-2 rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800">
      <UIcon name="i-lucide-shield" class="size-4 text-neutral-500" />
      <span class="text-xs text-neutral-500">관리자 액션</span>
      <div class="ml-auto flex gap-2">
        <UButton :to="`/admin/products/${id}/edit`" size="xs" color="neutral" variant="outline" icon="i-lucide-pencil">
          수정
        </UButton>
        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-trash-2" @click="removeProduct">
          삭제
        </UButton>
      </div>
    </div>

    <!-- 등록한 본인 액션 -->
    <div v-if="isOwner && !isAdmin && product" class="mb-6 flex items-center gap-2 rounded-2xl bg-neutral-100 p-3 dark:bg-neutral-800">
      <UIcon name="i-lucide-user-round-pen" class="size-4 text-neutral-500" />
      <span class="text-xs text-neutral-500">내가 등록한 프로덕트예요</span>
      <UButton :to="`/me/products/${id}/edit`" size="xs" color="neutral" variant="outline" icon="i-lucide-pencil" class="ml-auto">
        수정
      </UButton>
    </div>

    <article v-if="product">
      <!-- HERO — content-first, no card wrapper -->
      <section class="pb-8">
        <div class="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
          <img
            :src="product.thumbnailUrl"
            :alt="product.name"
            class="size-24 shrink-0 rounded-3xl bg-neutral-100 object-cover sm:size-[120px] dark:bg-neutral-800"
          >
          <div class="min-w-0 flex-1 pt-1">
            <span
              v-if="product.source === 'curated'"
              class="mb-3 inline-block rounded-full bg-[#0A0A0A] px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              AMU Pick
            </span>
            <h1 class="text-3xl font-bold leading-[1.05] tracking-tight sm:text-[40px]">
              {{ product.name }}
            </h1>
            <p class="mt-2.5 max-w-[480px] text-base leading-snug text-neutral-500 sm:text-[17px]">
              {{ product.tagline }}
            </p>
          </div>
        </div>

        <!-- Hashtag meta -->
        <div class="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-700 dark:text-neutral-300">
          <span v-for="h in hashtags" :key="h">#{{ h }}</span>
          <NuxtLink
            v-if="product.maker"
            :to="`/makers/${encodeURIComponent(product.maker)}`"
            class="transition hover:text-neutral-950 dark:hover:text-white"
          >
            by {{ product.maker }}
          </NuxtLink>
        </div>

        <!-- Actions (모바일에선 하단 고정 액션바로 대체) -->
        <div class="mt-6 flex-wrap items-center gap-2 max-md:hidden md:flex">
          <UDropdownMenu v-if="goLinks.length > 1" :items="goMenuItems" :content="{ align: 'start' }">
            <UButton color="neutral" variant="solid" trailing-icon="i-lucide-chevron-down">
              바로가기
            </UButton>
          </UDropdownMenu>
          <UButton
            v-else-if="goLinks[0]"
            :to="goLinks[0].url"
            target="_blank"
            color="neutral"
            variant="solid"
            trailing-icon="i-lucide-arrow-up-right"
            @click="trackLink(goLinks[0]!.url)"
          >
            {{ linkGoLabel(goLinks[0]) }}
          </UButton>
          <ProductUpvoteButton :product-id="id" :initial-count="product.upvoteCount ?? 0" />
          <ProductBookmarkButton :product-id="id" />
          <ProductShareButton
            :url="`/products/${product.slug || id}`"
            :title="product.name"
            :text="product.tagline"
          />
          <UButton
            :to="`/compare?ids=${id}`"
            color="neutral"
            variant="outline"
            icon="i-lucide-scale"
            aria-label="다른 프로덕트와 비교"
          >
            비교
          </UButton>
        </div>
      </section>

      <!-- TABS -->
      <nav
        class="no-scrollbar sticky top-[var(--mobile-header-h)] z-10 -mx-5 mt-0 flex gap-6 overflow-x-auto whitespace-nowrap bg-white px-5 pt-2 md:top-0 md:-mx-6 md:gap-7 md:overflow-visible md:px-6 md:pt-4 dark:bg-neutral-950"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="relative flex min-h-11 shrink-0 items-end pb-2.5 text-sm font-bold transition md:block md:min-h-0"
          :class="activeTab === tab.value
            ? 'text-neutral-950 dark:text-neutral-50'
            : 'text-neutral-400 hover:text-neutral-600'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="activeTab === tab.value"
            class="absolute inset-x-0 -bottom-px h-0.5 bg-neutral-950 dark:bg-neutral-50"
          />
        </button>
      </nav>

      <!-- Overview -->
      <section v-if="activeTab === 'overview'" class="pt-8">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Overview</div>
        <h2 class="mt-3.5 text-xl font-bold tracking-tight sm:text-[22px]">
          어떤 프로덕트인가요
        </h2>
        <p class="mt-4 max-w-[680px] whitespace-pre-wrap text-[15px] leading-[1.7] text-neutral-700 dark:text-neutral-300">
          {{ product.description }}
        </p>
      </section>

      <!-- 메이커 인터뷰 -->
      <section v-else-if="activeTab === 'maker' && product.makerStory" class="pt-8">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Maker</div>
        <h2 class="mt-3.5 text-xl font-bold tracking-tight sm:text-[22px]">
          메이커의 이야기
        </h2>

        <div v-if="product.maker" class="mt-4 text-sm text-neutral-500">
          by
          <NuxtLink
            :to="`/makers/${encodeURIComponent(product.maker)}`"
            class="font-semibold text-neutral-950 hover:underline dark:text-neutral-50"
          >
            {{ product.maker }}
          </NuxtLink>
        </div>

        <!-- 영상 -->
        <div v-if="youtubeEmbed" class="mt-5 aspect-video overflow-hidden rounded-2xl bg-neutral-100">
          <iframe
            :src="youtubeEmbed"
            class="size-full"
            allowfullscreen
            frameborder="0"
          />
        </div>

        <!-- 한 줄 소감 -->
        <blockquote
          v-if="product.makerStory.oneLiner"
          class="mt-6 border-l-[3px] border-[#0A0A0A] pl-4 text-lg font-semibold leading-snug tracking-tight sm:text-xl"
        >
          "{{ product.makerStory.oneLiner }}"
        </blockquote>

        <!-- Q&A -->
        <div v-if="product.makerStory.qa?.length" class="mt-7 space-y-6">
          <div v-for="(item, i) in product.makerStory.qa" :key="i" class="max-w-[680px]">
            <div class="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Q. {{ item.q }}
            </div>
            <p class="mt-2 whitespace-pre-wrap text-[15px] leading-[1.7] text-neutral-700 dark:text-neutral-300">
              {{ item.a }}
            </p>
          </div>
        </div>
      </section>

      <!-- Showroom -->
      <section v-else-if="activeTab === 'showroom' && product.showroom" class="pt-8">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Showroom</div>
        <h2 class="mt-3.5 text-xl font-bold tracking-tight sm:text-[22px]">
          메이커가 알려주는 지표
        </h2>
        <div class="mt-5">
          <ProductShowroomSection :showroom="product.showroom" :maker="product.maker" />
        </div>
      </section>

      <!-- Links -->
      <section v-else-if="activeTab === 'links' && product.links?.length" class="pt-8">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Links</div>
        <h2 class="mt-3.5 text-xl font-bold tracking-tight sm:text-[22px]">
          더 살펴보기
        </h2>
        <div class="mt-5 flex flex-col gap-1">
          <a
            v-for="link in product.links"
            :key="link.url"
            :href="link.url"
            target="_blank"
            class="group flex items-center gap-4 rounded-2xl bg-neutral-100 p-4 transition hover:bg-neutral-150 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <div class="h-10 w-1 shrink-0 rounded bg-neutral-300 transition group-hover:bg-[var(--color-amu-pink)] dark:bg-neutral-700" />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-bold">{{ link.label || link.url }}</div>
              <div class="mt-0.5 truncate text-xs text-neutral-500">{{ link.url }}</div>
            </div>
            <span class="flex items-center gap-1 text-xs font-medium text-neutral-500">
              방문
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
            </span>
          </a>
        </div>
      </section>

      <!-- Comments -->
      <section v-else-if="activeTab === 'comments'" class="pt-8">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Discussion</div>
        <h2 class="mt-3.5 text-xl font-bold tracking-tight sm:text-[22px]">
          사람들의 이야기
        </h2>
        <div class="mt-5">
          <ProductCommentSection :product-id="id" />
        </div>
      </section>

      <!-- 신고 링크 (풋터 영역) -->
      <div class="mt-16 flex justify-end border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <ProductReportButton
          target-type="product"
          :target-id="id"
          :target-label="product.name"
        />
      </div>
      <!-- 모바일 하단 고정 액션바: 기존 북마크/업보트 컴포넌트와 외부 링크 핸들러 재사용 -->
      <div
        class="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-neutral-150 bg-white px-4 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] md:hidden dark:border-neutral-800 dark:bg-neutral-950"
      >
        <ProductBookmarkButton :product-id="id" class="size-[52px]! rounded-2xl!" />
        <ProductUpvoteButton :product-id="id" :initial-count="product.upvoteCount ?? 0" class="h-[52px]! rounded-2xl! px-3!" />
        <UDropdownMenu v-if="goLinks.length > 1" :items="goMenuItems" :content="{ side: 'top', align: 'end' }" class="flex-1">
          <UButton
            color="neutral"
            variant="solid"
            block
            trailing-icon="i-lucide-chevron-up"
            class="h-[52px] flex-1 rounded-2xl text-base font-bold"
          >
            바로가기
          </UButton>
        </UDropdownMenu>
        <UButton
          v-else-if="goLinks[0]"
          :to="goLinks[0].url"
          target="_blank"
          color="neutral"
          variant="solid"
          block
          trailing-icon="i-lucide-arrow-up-right"
          class="h-[52px] flex-1 rounded-2xl text-base font-bold"
          @click="trackLink(goLinks[0]!.url)"
        >
          {{ linkGoLabel(goLinks[0]) }}
        </UButton>
      </div>
    </article>

    <div v-else class="mt-12 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">프로덕트를 불러오는 중이거나 존재하지 않아요.</p>
    </div>
  </div>
</template>
