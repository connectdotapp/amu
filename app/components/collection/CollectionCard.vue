<script setup lang="ts">
import type { Collection } from '~/types/collection'

defineProps<{
  collection: Collection
}>()
</script>

<template>
  <NuxtLink
    :to="`/collections/${collection.slug}`"
    class="group flex flex-col overflow-hidden rounded-3xl bg-neutral-150 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
  >
    <div class="relative aspect-[16/9] w-full overflow-hidden bg-white dark:bg-neutral-900">
      <img
        v-if="collection.coverImageUrl"
        :src="collection.coverImageUrl"
        :alt="collection.title"
        class="size-full object-cover"
        loading="lazy"
      >
      <div v-else class="flex size-full items-center justify-center text-neutral-300">
        <UIcon name="i-lucide-layers" class="size-10" />
      </div>
    </div>

    <div class="flex flex-1 flex-col p-5">
      <div class="mb-2 flex items-center gap-2 text-xs text-neutral-500">
        <UIcon name="i-lucide-layers" class="size-3.5" />
        <span>컬렉션 · {{ collection.productCount ?? 0 }}개 프로덕트</span>
      </div>
      <h3 class="text-lg font-bold tracking-tight">{{ collection.title }}</h3>
      <p class="mt-2 line-clamp-2 text-sm text-neutral-500">{{ collection.description }}</p>
      <div v-if="collection.curatorName" class="mt-4 text-xs text-neutral-500">
        by {{ collection.curatorName }}
      </div>
    </div>
  </NuxtLink>
</template>
