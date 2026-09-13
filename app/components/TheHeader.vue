<script setup lang="ts">
const productType = ref<'web' | 'app'>('web')
const searchQuery = ref('')
</script>

<template>
  <header class="w-full">
    <div class="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-4">
      <!-- Left: Logo + type tabs -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="text-xl font-black tracking-tighter">
          AMU
        </NuxtLink>
        <nav class="flex items-center gap-4 text-sm font-semibold">
          <button
            class="transition"
            :class="productType === 'web' ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            @click="productType = 'web'"
          >
            웹
          </button>
          <button
            class="transition"
            :class="productType === 'app' ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            @click="productType = 'app'"
          >
            앱
          </button>
        </nav>
      </div>

      <!-- Center: Search -->
      <div class="mx-auto w-full max-w-md">
        <div class="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
          <UIcon name="i-lucide-search" class="size-4 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search on Web..."
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          >
          <kbd class="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-neutral-700">
            ⌘K
          </kbd>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-bookmark"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="북마크"
        />
        <UButton
          icon="i-lucide-life-buoy"
          color="neutral"
          variant="ghost"
          size="sm"
          aria-label="도움말"
        />
        <UButton
          to="/submit"
          color="neutral"
          variant="outline"
          size="sm"
        >
          등록하기
        </UButton>
        <NuxtLink to="/login" class="ml-1">
          <div class="size-8 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
