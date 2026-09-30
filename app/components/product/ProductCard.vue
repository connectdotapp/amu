<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug || product.id}`"
    class="group relative flex aspect-[6/5] flex-col overflow-hidden rounded-3xl bg-neutral-150 p-4 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
  >
    <!-- Top-left badge -->
    <div v-if="product.source === 'curated'" class="absolute left-4 top-4 z-10">
      <span class="rounded-full bg-neutral-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        AMU Pick
      </span>
    </div>

    <!-- Thumbnail area -->
    <div class="flex flex-1 items-center justify-center">
      <img
        :src="product.thumbnailUrl"
        :alt="product.name"
        class="size-[110px] rounded-2xl object-cover bg-white"
        loading="lazy"
      >
    </div>

    <!-- Footer info -->
    <div class="mt-4">
      <h3 class="truncate text-base font-bold tracking-tight">{{ product.name }}</h3>
      <p class="mt-1 line-clamp-2 text-sm text-neutral-500">{{ product.tagline }}</p>
      <div class="mt-3 flex items-center gap-3 text-xs text-neutral-400">
        <span class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-arrow-up" class="size-3.5" />
          {{ product.upvoteCount ?? 0 }}
        </span>
        <span class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-message-square" class="size-3.5" />
          {{ product.commentCount ?? 0 }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
