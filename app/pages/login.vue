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
  <div class="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
    <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">로그인</h1>
    <p class="mt-2 text-neutral-500">아무의 큐레이션에 참여해요.</p>

    <div class="mt-10 w-full rounded-3xl bg-neutral-100 p-8 dark:bg-neutral-800">
      <UButton
        block
        size="lg"
        color="neutral"
        variant="solid"
        icon="i-lucide-log-in"
        :loading="loading"
        @click="loginGoogle"
      >
        Google로 계속하기
      </UButton>
      <p v-if="error" class="mt-3 text-sm text-error">{{ error }}</p>
    </div>

    <p class="mt-6 text-xs text-neutral-500">
      계속 진행 시 이용약관과 개인정보처리방침에 동의하는 것으로 간주해요.
    </p>
  </div>
</template>
