<script setup lang="ts">
const props = defineProps<{
  productId: string
  initialCount?: number
}>()

const { upvoted, count, loading, toggle } = useUpvote(props.productId, props.initialCount ?? 0)
</script>

<template>
  <button
    class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition disabled:opacity-50"
    :class="upvoted
      ? 'bg-[var(--color-amu-pink)] text-white ring-[var(--color-amu-pink)] hover:bg-[var(--color-amu-pink-dark)] hover:ring-[var(--color-amu-pink-dark)]'
      : 'bg-white text-neutral-950 ring-neutral-300 hover:ring-neutral-500 dark:bg-neutral-800 dark:text-neutral-50 dark:ring-neutral-600'"
    :disabled="loading"
    @click="toggle"
  >
    <UIcon name="i-lucide-arrow-up" class="size-4" />
    {{ count }}
  </button>
</template>
