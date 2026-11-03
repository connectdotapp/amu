<script setup lang="ts">
import type { Product } from '~/types/product'

defineProps<{
  title: string
  to: string
  products: Product[]
}>()

const scroller = ref<HTMLElement | null>(null)
const atStart = ref(true)
const atEnd = ref(false)

function updateEdges() {
  const el = scroller.value
  if (!el) return
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
}

function scrollByPage(dir: 1 | -1) {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
}

onMounted(updateEdges)
</script>

<template>
  <section class="pb-16 md:pb-14">
    <div class="mb-3.5 flex items-end justify-between gap-4 md:mb-4">
      <div>
        <h2 class="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px]">
          {{ title }}
        </h2>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <NuxtLink
          :to="to"
          class="-mr-2 px-2 pb-1 text-xs text-neutral-500 md:hidden"
        >
          전체 보기 →
        </NuxtLink>
        <button
          type="button"
          aria-label="이전"
          class="hidden size-11 items-center justify-center rounded-full border border-neutral-200 bg-white transition hover:border-neutral-400 disabled:opacity-30 md:flex dark:border-neutral-700 dark:bg-neutral-950"
          :disabled="atStart"
          @click="scrollByPage(-1)"
        >
          <UIcon
            name="i-lucide-chevron-left"
            class="size-5"
          />
        </button>
        <button
          type="button"
          aria-label="다음"
          class="hidden size-11 items-center justify-center rounded-full border border-neutral-200 bg-white transition hover:border-neutral-400 disabled:opacity-30 md:flex dark:border-neutral-700 dark:bg-neutral-950"
          :disabled="atEnd"
          @click="scrollByPage(1)"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-5"
          />
        </button>
      </div>
    </div>

    <div
      ref="scroller"
      class="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 md:mx-0 md:gap-5 md:scroll-px-0 md:px-0"
      @scroll.passive="updateEdges"
    >
      <NuxtLink
        v-for="p in products"
        :key="p.id"
        :to="`/products/${p.slug || p.id}`"
        class="group w-[132px] shrink-0 snap-start md:w-[208px]"
      >
        <img
          :src="p.thumbnailUrl"
          :alt="p.name"
          class="aspect-square w-full rounded-[22px] bg-neutral-100 object-cover transition group-hover:opacity-90 md:rounded-[30px] dark:bg-neutral-800"
          loading="lazy"
        >
        <div class="mt-3 truncate text-sm font-bold tracking-tight md:text-base">{{ p.name }}</div>
        <div class="mt-0.5 truncate text-xs text-neutral-500 md:text-sm">{{ p.tagline }}</div>
      </NuxtLink>
    </div>
  </section>
</template>
