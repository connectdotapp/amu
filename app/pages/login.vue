<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

useSeoMeta({
  title: '로그인',
  robots: 'noindex, nofollow'
})

const auth = useFirebaseAuth()
const route = useRoute()
const loading = ref(false)
const error = ref<string | null>(null)

async function loginGoogle() {
  if (!auth) return
  loading.value = true
  error.value = null
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    const redirect = (route.query.redirect as string) || '/'
    await navigateTo(redirect)
  } catch (e: any) {
    error.value = e?.message ?? '로그인에 실패했어요.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16">
    <div class="mx-auto max-w-sm text-center">
      <h1 class="text-2xl font-semibold tracking-tight">로그인</h1>
      <p class="mt-1 text-muted">아무의 큐레이션에 참여해요.</p>

      <div class="mt-8 space-y-3">
        <UButton
          block
          color="neutral"
          variant="solid"
          icon="i-simple-icons-google"
          :loading="loading"
          @click="loginGoogle"
        >
          Google로 계속하기
        </UButton>
        <p v-if="error" class="text-sm text-error">{{ error }}</p>
      </div>
    </div>
  </UContainer>
</template>
