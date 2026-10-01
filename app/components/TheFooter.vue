<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-32 bg-[#FD0E35] text-white">
    <div class="mx-auto max-w-[1280px] px-6 py-12">
      <div class="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div>
          <div class="text-lg font-black tracking-tight">AMU</div>
          <p class="mt-1 text-sm text-white/70">
            아무거나 먹지 않는 새
          </p>
        </div>

        <div class="flex flex-wrap gap-x-8 gap-y-6 text-sm">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-white/60">둘러보기</span>
            <NuxtLink to="/" class="hover:text-white/70">홈</NuxtLink>
            <NuxtLink to="/submit" class="hover:text-white/70">등록하기</NuxtLink>
            <NuxtLink to="/about" class="hover:text-white/70">About</NuxtLink>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-white/60">정책</span>
            <NuxtLink to="/legal/terms" class="hover:text-white/70">이용약관</NuxtLink>
            <NuxtLink to="/legal/privacy" class="hover:text-white/70">개인정보처리방침</NuxtLink>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold text-white/60">연결</span>
            <a href="https://instagram.com" target="_blank" class="hover:text-white/70">Instagram</a>
            <a href="mailto:eslabsofficial@gmail.com" class="hover:text-white/70">문의</a>
          </div>
        </div>
      </div>

      <p class="mt-10 text-xs text-white/60">© {{ year }} AMU. All rights reserved.</p>
    </div>
  </footer>
</template>
