<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '관리자',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UContainer class="py-10">
    <h1 class="text-2xl font-semibold tracking-tight">관리자</h1>
    <p class="mt-1 text-muted">승인 대기 · 프로덕트 관리 · 카테고리 관리</p>

    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      <UCard><template #header>승인 대기</template>다음 스텝</UCard>
      <UCard><template #header>프로덕트</template>다음 스텝</UCard>
      <UCard><template #header>카테고리</template>다음 스텝</UCard>
    </div>
  </UContainer>
</template>
