<script setup lang="ts">
import { deleteDoc, doc } from 'firebase/firestore'
import type { Platform } from '~/types/product'

const route = useRoute()
const id = String(route.params.id)

const { data: product } = useProductById(id)

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
  <div class="mx-auto max-w-[900px] px-6 pb-24 pt-2">
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

        <!-- Chip meta -->
        <div class="mt-6 flex flex-wrap gap-1.5">
          <span
            v-if="product.category"
            class="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
          >
            {{ product.category }}
          </span>
          <span
            v-if="product.pricing"
            class="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {{ pricingLabel[product.pricing] || product.pricing }}
          </span>
          <span
            v-for="pf in product.platforms || []"
            :key="pf"
            class="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {{ platformLabel[pf] || pf }}
          </span>
          <span
            v-for="t in (product.tags || []).slice(0, 6)"
            :key="t"
            class="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
          >
            {{ t }}
          </span>
          <NuxtLink
            v-if="product.maker"
            :to="`/makers/${encodeURIComponent(product.maker)}`"
            class="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-800 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
          >
            by {{ product.maker }}
          </NuxtLink>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-wrap items-center gap-2">
          <UButton
            v-if="product.links?.[0]"
            :to="product.links[0].url"
            target="_blank"
            color="neutral"
            variant="solid"
            trailing-icon="i-lucide-arrow-up-right"
            @click="analytics.externalLink({ productId: id, productName: product.name, url: product.links[0]!.url })"
          >
            {{ product.links[0].label || '방문하기' }}
          </UButton>
          <ProductUpvoteButton :product-id="id" :initial-count="product.upvoteCount ?? 0" />
          <ProductBookmarkButton :product-id="id" />
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
        class="sticky top-0 z-10 -mx-6 mt-0 flex gap-7 bg-white px-6 pt-4 dark:bg-neutral-950"
      >
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="relative pb-2.5 text-sm font-bold transition"
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
    </article>

    <div v-else class="mt-12 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">프로덕트를 불러오는 중이거나 존재하지 않아요.</p>
    </div>
  </div>
</template>
