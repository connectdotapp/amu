<script setup lang="ts">
const props = defineProps<{
  productId: string
}>()

const { bookmarked, loading, toggle } = useBookmark(props.productId)
</script>

<template>
  <button
    class="inline-flex size-9 items-center justify-center rounded-full ring-1 transition disabled:opacity-50"
    :class="bookmarked
      ? 'bg-neutral-950 text-white ring-neutral-950 dark:bg-white dark:text-neutral-950 dark:ring-white'
      : 'bg-white text-neutral-950 ring-neutral-300 hover:ring-neutral-500 dark:bg-neutral-800 dark:text-neutral-50 dark:ring-neutral-600'"
    :disabled="loading"
    :aria-label="bookmarked ? '북마크 해제' : '북마크'"
    @click="toggle"
  >
    <UIcon :name="bookmarked ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'" class="size-4" />
  </button>
</template>
