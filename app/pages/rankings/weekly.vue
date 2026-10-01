<script setup lang="ts">
useSeoMeta({
  title: '이번 주 순위',
  description: '이번 주 아무의 관심이 모인 프로덕트'
})

const { data: allProducts } = useAllPublishedProducts(200)

const ranked = computed(() =>
  [...(allProducts.value || [])]
    .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
)

const currentWeekLabel = computed(() => {
  const now = new Date()
  const month = now.getMonth() + 1
  const weekOfMonth = Math.ceil(now.getDate() / 7)
  return `${month}월 ${weekOfMonth}주차`
})

const pricingLabel: Record<string, string> = {
  free: '무료',
  freemium: '프리미엄',
  paid: '유료',
  subscription: '구독'
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 pb-24 pt-2">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-neutral-500 transition hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      둘러보기
    </NuxtLink>

    <header class="mt-6 pb-6">
      <div class="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500">
        Ranking · {{ currentWeekLabel }}
      </div>
      <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        이번 주 순위
      </h1>
    </header>

    <ol v-if="ranked.length" class="mt-4 flex flex-col gap-2">
      <li v-for="(p, i) in ranked" :key="p.id">
        <NuxtLink
          :to="`/products/${p.slug || p.id}`"
          class="flex items-center gap-5 rounded-3xl bg-neutral-100 p-5 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <div
            class="w-8 shrink-0 text-left text-2xl font-bold leading-none tracking-tight tabular-nums sm:text-3xl"
            :class="i < 3 ? 'text-[var(--color-amu-pink)]' : 'text-neutral-950 dark:text-neutral-50'"
          >
            {{ i + 1 }}
          </div>

          <img
            :src="p.thumbnailUrl"
            :alt="p.name"
            class="size-16 shrink-0 rounded-2xl bg-neutral-50 object-cover sm:size-20"
            loading="lazy"
          >

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h2 class="truncate text-base font-bold tracking-tight sm:text-lg">
                {{ p.name }}
              </h2>
              <span
                v-if="p.source === 'curated'"
                class="shrink-0 rounded-full bg-[#FD0E35] px-2 py-0.5 text-[10px] font-semibold text-white"
              >
                Pick
              </span>
            </div>
            <p class="mt-1 line-clamp-1 text-sm text-neutral-500 sm:line-clamp-2">
              {{ p.tagline }}
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-400">
              <span v-if="p.category">{{ p.category }}</span>
              <span v-if="p.pricing" class="text-neutral-300">·</span>
              <span v-if="p.pricing">{{ pricingLabel[p.pricing] || p.pricing }}</span>
            </div>
          </div>

          <div class="hidden shrink-0 flex-col items-end gap-1 text-xs tabular-nums text-neutral-500 sm:flex">
            <span class="inline-flex items-center gap-1 text-sm font-bold text-neutral-950 dark:text-neutral-50">
              <UIcon name="i-lucide-arrow-up" class="size-4" />
              {{ p.upvoteCount ?? 0 }}
            </span>
            <span class="inline-flex items-center gap-1">
              <UIcon name="i-lucide-message-square" class="size-3" />
              {{ p.commentCount ?? 0 }}
            </span>
          </div>

          <div class="shrink-0 text-right text-sm font-bold tabular-nums text-neutral-950 sm:hidden dark:text-neutral-50">
            ↑ {{ p.upvoteCount ?? 0 }}
          </div>
        </NuxtLink>
      </li>
    </ol>

    <div v-else class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-trophy" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 순위에 오를 프로덕트가 없어요.</p>
    </div>
  </div>
</template>
