<script setup lang="ts">
import type { Product } from '~/types/product'

// 모바일 4열 앱스토어형 타일. 데스크톱은 ProductCard 를 계속 사용.
defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug || product.id}`"
    class="flex min-w-0 flex-col items-center active:opacity-70"
  >
    <div class="relative size-[74px]">
      <img
        :src="product.thumbnailUrl"
        :alt="product.name"
        class="size-full rounded-[18px] bg-neutral-100 object-cover dark:bg-neutral-800"
        loading="lazy"
      >
      <span
        v-if="product.source === 'curated'"
        class="absolute -right-[3px] -top-[3px] size-3.5 rounded-full border-[2.5px] border-white bg-[#0A0A0A] dark:border-neutral-950"
        aria-label="AMU Pick"
        role="img"
      />
    </div>
    <h3 class="mt-[7px] max-w-full truncate text-[12.5px] font-bold leading-tight tracking-tight">
      {{ product.name }}
    </h3>
    <p class="mt-px max-w-full truncate text-[11px] text-neutral-400">
      <template v-if="product.category">{{ product.category }} · </template>↑{{ product.upvoteCount ?? 0 }}
    </p>
  </NuxtLink>
</template>
