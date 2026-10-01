<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const code = computed(() => Number(props.error?.statusCode || 500))
const isNotFound = computed(() => code.value === 404)

const title = computed(() => isNotFound.value ? '아무것도 없어요.' : '뭔가 문제가 생겼어요.')
const description = computed(() =>
  isNotFound.value
    ? '이 페이지는 아무가 아직 발견하지 못했거나 사라진 것 같아요.'
    : '잠시 후 다시 시도해 주세요. 문제가 계속되면 알려주세요.'
)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-dvh bg-neutral-100 dark:bg-neutral-950">
    <div class="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p class="text-sm font-semibold text-neutral-500">{{ code }}</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">
        {{ title }}
      </h1>
      <p class="mt-4 text-neutral-500">{{ description }}</p>

      <div class="mt-10 flex gap-2">
        <UButton color="neutral" variant="solid" size="lg" @click="goHome">
          홈으로
        </UButton>
        <UButton
          v-if="!isNotFound"
          color="neutral"
          variant="outline"
          size="lg"
          @click="$router.go(0)"
        >
          다시 시도
        </UButton>
      </div>
    </div>
  </div>
</template>
