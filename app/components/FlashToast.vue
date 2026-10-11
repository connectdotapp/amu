<script setup lang="ts">
/**
 * 상단 중앙 플래시 토스트. useFlash() 가 세팅한 메시지를 1.5초간 pill 로 노출.
 */
const { message } = useFlash()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="message"
      class="pointer-events-none fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm dark:bg-neutral-800 dark:text-neutral-100"
      role="status"
      aria-live="polite"
    >
      {{ message }}
    </div>
  </Transition>
</template>
