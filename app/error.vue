<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const code = computed(() => Number(props.error?.statusCode || 500))
const isNotFound = computed(() => code.value === 404)

const title = computed(() => isNotFound.value ? '앗! 페이지가 도망갔어요' : '뭔가 문제가 생겼어요')
const description = computed(() =>
  isNotFound.value
    ? '주소가 잘못됐거나 삭제된 페이지일 수 있어요'
    : '일시적인 오류예요. 잠시 후 다시 시도해주세요'
)

function goHome() {
  clearError({ redirect: '/' })
}

function reload() {
  if (typeof window !== 'undefined') window.location.reload()
}
</script>

<template>
  <div class="min-h-dvh bg-white dark:bg-neutral-950">
    <div class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <img
        src="/mascot-sad.png"
        :alt="title"
        class="h-28 w-auto select-none sm:h-32"
        draggable="false"
      >

      <p class="mt-6 text-sm font-semibold text-neutral-400">{{ code }}</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {{ title }}
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-neutral-500">{{ description }}</p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium leading-none text-white transition hover:bg-[#262626]"
          @click="goHome"
        >
          홈으로
        </button>
        <button
          v-if="!isNotFound"
          type="button"
          class="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium leading-none text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          @click="reload"
        >
          다시 시도
        </button>
      </div>
    </div>
  </div>
</template>
