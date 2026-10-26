<script setup lang="ts">
const route = useRoute()
const makerName = decodeURIComponent(String(route.params.name))

const { data: products } = useProductsByMaker(makerName)

const totalUpvotes = computed(() =>
  (products.value || []).reduce((sum, p) => sum + (p.upvoteCount || 0), 0)
)

const totalBookmarks = computed(() =>
  (products.value || []).reduce((sum, p) => sum + (p.bookmarkCount || 0), 0)
)

// 가장 최근에 등록된 메이커 스토리 (하나의 메이커가 여러 앱에 스토리를 썼을 때 최신것)
const latestStory = computed(() => {
  const withStory = (products.value || []).filter((p) => {
    const m = p.makerStory
    return !!(m?.videoUrl || m?.oneLiner || m?.qa?.some((x) => x.a?.trim()))
  })
  return withStory[0] || null
})

// 쇼룸 지표 집계: 가장 최근 등록 앱의 쇼룸 사용 (여러 앱 평균은 왜곡)
const latestShowroom = computed(() => {
  return (products.value || []).find((p) => p.showroom)?.showroom
})

useSeoMeta({
  title: () => `${makerName} · 메이커`,
  description: () => `AMU에 등록된 ${makerName}의 작품 모음`
})

defineOgImageComponent('Maker', {
  name: makerName,
  productCount: () => products.value?.length ?? 0,
  totalUpvotes: () => totalUpvotes.value,
  quote: () => latestStory.value?.makerStory?.oneLiner
})
</script>

<template>
  <div class="mx-auto max-w-[900px] px-5 pb-24 pt-2 md:px-6">
    <NuxtLink to="/" class="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 transition hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      둘러보기
    </NuxtLink>

    <!-- Hero -->
    <section class="pb-10">
      <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">Maker</div>
      <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        {{ makerName }}
      </h1>

      <div v-if="products?.length" class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500">
        <span>
          <span class="font-bold text-neutral-950 dark:text-neutral-50">{{ products.length }}</span>개 작품
        </span>
        <span class="text-neutral-300">·</span>
        <span>
          <UIcon name="i-lucide-arrow-up" class="mr-0.5 inline size-3.5 align-text-top" />
          <span class="font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">{{ totalUpvotes }}</span>
          <span class="ml-1">업보트</span>
        </span>
        <span class="text-neutral-300">·</span>
        <span>
          <UIcon name="i-lucide-bookmark" class="mr-0.5 inline size-3.5 align-text-top" />
          <span class="font-bold text-neutral-950 dark:text-neutral-50 tabular-nums">{{ totalBookmarks }}</span>
          <span class="ml-1">북마크</span>
        </span>
      </div>
    </section>

    <!-- 최근 메이커 소감 (있을 경우) -->
    <section v-if="latestStory?.makerStory?.oneLiner" class="mb-12">
      <blockquote class="border-l-[3px] border-[#0A0A0A] pl-5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
        "{{ latestStory.makerStory.oneLiner }}"
      </blockquote>
      <NuxtLink
        :to="`/products/${latestStory.slug || latestStory.id}?tab=maker`"
        class="mt-3 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50"
      >
        <span>{{ latestStory.name }} 인터뷰 전체 보기</span>
        <UIcon name="i-lucide-arrow-right" class="size-3.5" />
      </NuxtLink>
    </section>

    <!-- 작품 목록 -->
    <section v-if="products?.length">
      <div class="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        Works
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ProductCard
          v-for="p in products"
          :key="p.id"
          :product="p"
        />
      </div>
    </section>

    <!-- 쇼룸 지표 (가장 최근 앱 기준) -->
    <section v-if="latestShowroom" class="mt-12">
      <div class="mb-5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        Showroom
      </div>
      <ProductShowroomSection :showroom="latestShowroom" :maker="makerName" />
    </section>

    <!-- 없을 때 -->
    <div v-if="!products?.length" class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-user" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">
        {{ makerName }}의 등록된 작품이 없다.
      </p>
    </div>
  </div>
</template>
