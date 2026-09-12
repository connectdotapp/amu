<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        © {{ year }} AMU · 아무거나 먹지 않는 새
      </p>
    </template>
    <template #right>
      <UButton
        to="https://instagram.com"
        target="_blank"
        icon="i-simple-icons-instagram"
        color="neutral"
        variant="ghost"
        aria-label="Instagram"
      />
    </template>
  </UFooter>
</template>
