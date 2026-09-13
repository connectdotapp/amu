<script setup lang="ts">
const items = [
  { label: '둘러보기', to: '/' },
  { label: '등록하기', to: '/submit' }
]
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
        <span class="text-lg">AMU</span>
        <span class="hidden sm:inline text-xs text-muted">아무거나 소개하지 않아요</span>
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
      <UButton to="/submit" size="sm" color="neutral" variant="solid" icon="i-lucide-plus">
        등록
      </UButton>
    </template>
  </UHeader>
</template>
