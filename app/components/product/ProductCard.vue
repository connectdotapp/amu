<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  product: Product
}>()
</script>

<template>
  <NuxtLink
    :to="`/products/${product.slug || product.id}`"
    class="group flex gap-4 rounded-lg border border-default p-4 transition hover:border-highlighted focus-visible:outline-2 outline-primary/50"
  >
    <div class="shrink-0">
      <NuxtImg
        :src="product.thumbnailUrl"
        :alt="product.name"
        width="72"
        height="72"
        class="size-16 rounded-md object-cover bg-elevated"
        loading="lazy"
      />
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <h3 class="truncate font-medium">{{ product.name }}</h3>
        <UBadge
          v-if="product.source === 'curated'"
          size="xs"
          color="neutral"
          variant="subtle"
        >
          AMU Pick
        </UBadge>
      </div>
      <p class="mt-0.5 line-clamp-2 text-sm text-muted">
        {{ product.tagline }}
      </p>
      <div class="mt-2 flex items-center gap-3 text-xs text-dimmed">
        <span class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-arrow-up" class="size-3.5" />
          {{ product.upvoteCount ?? 0 }}
        </span>
        <span class="inline-flex items-center gap-1">
          <UIcon name="i-lucide-message-square" class="size-3.5" />
          {{ product.commentCount ?? 0 }}
        </span>
        <span v-if="product.category" class="text-dimmed">· {{ product.category }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
