<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  remove: [productId: string]
}>()

const pricingLabel: Record<string, string> = {
  free: '무료',
  freemium: '프리미엄',
  paid: '유료',
  subscription: '구독'
}

function primaryLink(p: Product): string | undefined {
  return p.links?.[0]?.url
}
</script>

<template>
  <div class="overflow-x-auto rounded-3xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
    <table class="w-full min-w-[720px] border-collapse text-left text-sm">
      <!-- Product headers -->
      <thead>
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <th class="sticky left-0 z-10 w-32 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">항목</th>
          <th
            v-for="p in products"
            :key="p.id"
            class="p-4 align-top"
            :style="{ width: `calc((100% - 8rem) / ${products.length})` }"
          >
            <div class="flex flex-col items-start gap-3">
              <div class="flex w-full items-start justify-between gap-2">
                <img
                  :src="p.thumbnailUrl"
                  :alt="p.name"
                  class="size-14 rounded-2xl object-cover bg-neutral-100 dark:bg-neutral-800"
                >
                <button
                  type="button"
                  class="rounded-full p-1.5 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                  :aria-label="`${p.name} 비교에서 빼기`"
                  @click="$emit('remove', p.id)"
                >
                  <UIcon name="i-lucide-x" class="size-4" />
                </button>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <NuxtLink :to="`/products/${p.slug || p.id}`" class="truncate font-bold tracking-tight hover:underline">
                    {{ p.name }}
                  </NuxtLink>
                  <UBadge v-if="p.source === 'curated'" size="xs" color="neutral" variant="solid">
                    Pick
                  </UBadge>
                </div>
                <p class="mt-1 line-clamp-2 text-xs text-neutral-500">{{ p.tagline }}</p>
              </div>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- Category -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">카테고리</td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm">
            {{ p.category || '—' }}
          </td>
        </tr>

        <!-- Pricing -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">가격</td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm">
            {{ pricingLabel[p.pricing] || p.pricing || '—' }}
          </td>
        </tr>

        <!-- Maker -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">메이커</td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm">
            {{ p.maker || '—' }}
          </td>
        </tr>

        <!-- Tags -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">태그</td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm">
            <div v-if="p.tags?.length" class="flex flex-wrap gap-1">
              <span
                v-for="t in p.tags.slice(0, 6)"
                :key="t"
                class="rounded-full bg-neutral-150 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                #{{ t }}
              </span>
            </div>
            <span v-else class="text-neutral-400">—</span>
          </td>
        </tr>

        <!-- Platforms -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">플랫폼</td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm">
            {{ p.platforms?.length ? p.platforms.join(', ') : '—' }}
          </td>
        </tr>

        <!-- Metrics -->
        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">
            <UIcon name="i-lucide-arrow-up" class="mr-1 inline size-3.5" />업보트
          </td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm tabular-nums">
            {{ p.upvoteCount ?? 0 }}
          </td>
        </tr>

        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">
            <UIcon name="i-lucide-message-square" class="mr-1 inline size-3.5" />댓글
          </td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm tabular-nums">
            {{ p.commentCount ?? 0 }}
          </td>
        </tr>

        <tr class="border-b border-neutral-200 dark:border-neutral-800">
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">
            <UIcon name="i-lucide-bookmark" class="mr-1 inline size-3.5" />북마크
          </td>
          <td v-for="p in products" :key="p.id" class="p-4 text-sm tabular-nums">
            {{ p.bookmarkCount ?? 0 }}
          </td>
        </tr>

        <!-- Visit link -->
        <tr>
          <td class="sticky left-0 z-10 bg-white p-4 text-xs font-semibold text-neutral-500 dark:bg-neutral-900">방문</td>
          <td v-for="p in products" :key="p.id" class="p-4">
            <UButton
              v-if="primaryLink(p)"
              :to="primaryLink(p)"
              target="_blank"
              size="sm"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-up-right"
            >
              방문하기
            </UButton>
            <span v-else class="text-sm text-neutral-400">—</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
