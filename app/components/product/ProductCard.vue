<script setup lang="ts">
import type { Product } from '~/types/product'

const props = defineProps<{
  product: Product
}>()

// NEW badge: published within the last 24 hours
const isNew = computed(() => {
  const t = (props.product.publishedAt as any)?.toMillis?.()
  if (!t) return false
  return Date.now() - t < 24 * 60 * 60 * 1000
})
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug || product.id}`"
    class="group block"
  >
    <!-- 아이콘이 꽉 찬 정사각형 -->
    <div class="relative aspect-square overflow-hidden rounded-3xl bg-neutral-100 ring-1 ring-transparent transition hover:ring-neutral-200 dark:bg-neutral-800 dark:hover:ring-neutral-700">
      <img
        :src="product.thumbnailUrl"
        :alt="product.name"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      >

      <span
        v-if="product.source === 'curated'"
        class="absolute left-3 top-3 z-10 rounded-full bg-[#F2293A] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
      >
        AMU Pick
      </span>

      <span
        v-if="isNew"
        class="absolute right-3 top-3 z-10 rounded-full bg-neutral-950 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
      >
        New
      </span>
    </div>

    <!-- 아래 텍스트: 이름 + 한줄소개만 -->
    <div class="mt-3 px-0.5">
      <h3 class="truncate text-[15px] font-bold tracking-tight">
        {{ product.name }}
      </h3>
      <p class="mt-1 line-clamp-1 text-sm text-neutral-500">
        {{ product.tagline }}
      </p>
    </div>
  </NuxtLink>
</template>
