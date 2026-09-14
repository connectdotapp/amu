<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-32 border-t border-neutral-200 dark:border-neutral-800">
    <div class="mx-auto max-w-[1280px] px-6 py-12">
      <div class="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <div class="text-lg font-black tracking-tighter">AMU</div>
          <p class="mt-1 text-sm text-neutral-500">
            아무거나 먹지 않는 새
          </p>
        </div>

        <div class="flex flex-wrap gap-x-8 gap-y-6 text-sm">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-neutral-400">둘러보기</span>
            <NuxtLink to="/" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">홈</NuxtLink>
            <NuxtLink to="/submit" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">등록하기</NuxtLink>
            <NuxtLink to="/about" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">About</NuxtLink>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-neutral-400">정책</span>
            <NuxtLink to="/legal/terms" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">이용약관</NuxtLink>
            <NuxtLink to="/legal/privacy" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">개인정보처리방침</NuxtLink>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-neutral-400">연결</span>
            <a href="https://instagram.com" target="_blank" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">Instagram</a>
            <a href="mailto:eslabsofficial@gmail.com" class="text-neutral-950 hover:text-neutral-600 dark:text-neutral-50">문의</a>
          </div>
        </div>
      </div>

      <p class="mt-10 text-xs text-neutral-400">© {{ year }} AMU. All rights reserved.</p>
    </div>
  </footer>
</template>
