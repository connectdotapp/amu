<script setup lang="ts">
useSeoMeta({
  title: '커뮤니티',
  description: 'AMU 사용자들과 함께 이야기 나누는 공간입니다.'
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-20 text-center">
    <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
      <UIcon name="i-lucide-messages-square" class="size-7 text-neutral-500" />
    </div>
    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">커뮤니티</h1>
    <p class="mt-4 text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
      곧 유저분들과 함께 이야기 나눌 공간이 열려요
      메이커와 사용자가 서로 피드백을 주고받는 자리를 준비하고 있어요
    </p>

    <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
      <NuxtLink
        to="/community/notices"
        class="inline-flex items-center justify-center gap-2 rounded-full bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
      >
        <UIcon name="i-lucide-megaphone" class="size-4" />
        공지사항 보기
      </NuxtLink>
      <NuxtLink
        to="/community/faq"
        class="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
      >
        <UIcon name="i-lucide-help-circle" class="size-4" />
        자주 묻는 질문
      </NuxtLink>
    </div>
  </div>
</template>
