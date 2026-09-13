<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-32 border-t border-neutral-200 dark:border-neutral-800">
    <UContainer class="flex flex-col gap-4 py-12 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="font-bold tracking-tighter">AMU</div>
        <p class="mt-1 text-sm text-neutral-500">
          © {{ year }} · 아무거나 먹지 않는 새
        </p>
      </div>
      <UButton
        to="https://instagram.com"
        target="_blank"
        icon="i-lucide-instagram"
        color="neutral"
        variant="ghost"
        size="sm"
        aria-label="Instagram"
      />
    </UContainer>
  </footer>
</template>
