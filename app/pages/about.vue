<script setup lang="ts">
useSeoMeta({
  title: 'About',
  description: 'AMU는 아무거나 소개하지 않아요. 아무의 큐레이션 이야기.'
})
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-16 sm:py-24">
    <h1 class="text-4xl font-bold tracking-tighter sm:text-6xl">
      아무거나 소개하지 않아요.
    </h1>

    <p class="mt-6 text-lg text-neutral-500 sm:text-xl">
      AMU는 오늘의 앱·웹·프로그램을 아무가 골라 소개하는 큐레이션 커뮤니티예요.
    </p>

    <section class="mt-16 space-y-3">
      <h2 class="text-sm font-semibold text-neutral-500">마스코트</h2>
      <h3 class="text-2xl font-bold tracking-tight">아무</h3>
      <p class="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        아무는 아무거나 먹지 않는 새예요. 부리에 걸리는 걸 다 받아 삼키지 않고, 오래 살펴본 뒤 마음에 드는 것만 골라요. AMU의 큐레이션 태도가 여기서 왔어요.
      </p>
    </section>

    <section class="mt-12 space-y-3">
      <h2 class="text-sm font-semibold text-neutral-500">우리가 하는 일</h2>
      <ul class="space-y-4 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        <li>
          <strong class="text-neutral-950 dark:text-neutral-50">골라서 소개</strong>
          — 오늘 새로 나온 앱·웹·프로그램 중, 사용자에게 소개할 가치가 있다고 판단한 것만 <em>AMU Pick</em>으로 게시해요.
        </li>
        <li>
          <strong class="text-neutral-950 dark:text-neutral-50">사용자 등록</strong>
          — 자기 프로덕트를 알리고 싶다면 등록할 수 있어요. 아무가 검토 후 공개해요.
        </li>
        <li>
          <strong class="text-neutral-950 dark:text-neutral-50">양방향 소통</strong>
          — 업보트, 댓글, 북마크로 반응하고 대화해요.
        </li>
      </ul>
    </section>

    <section class="mt-12 space-y-3">
      <h2 class="text-sm font-semibold text-neutral-500">참여하기</h2>
      <p class="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
        관심 있는 프로덕트가 있다면
        <NuxtLink to="/submit" class="font-medium text-neutral-950 underline underline-offset-2 dark:text-neutral-50">등록</NuxtLink>
        해 주세요. 인스타그램에서는
        <a href="https://instagram.com" target="_blank" class="font-medium text-neutral-950 underline underline-offset-2 dark:text-neutral-50">아무 계정</a>
        을 팔로우하실 수 있어요.
      </p>
    </section>
  </div>
</template>
