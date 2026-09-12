<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: '프로덕트 등록',
  description: '프로덕트를 등록하고 아무의 심사를 기다려 보세요.',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl">
      <h1 class="text-2xl font-semibold tracking-tight">프로덕트 등록</h1>
      <p class="mt-1 text-muted">
        등록 후 아무의 심사를 거쳐 공개돼요. (승인 대기 상태로 저장됩니다)
      </p>

      <div class="mt-8 rounded-lg border border-dashed border-default p-10 text-center text-muted">
        등록 폼은 다음 스텝에서 붙일게요.
      </div>
    </div>
  </UContainer>
</template>
