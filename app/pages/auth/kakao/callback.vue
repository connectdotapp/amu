<script setup lang="ts">
/**
 * 카카오 OAuth 콜백 핸들러.
 *
 * Kakao.Auth.authorize() 가 로그인 성공 시 ?code=XXX&state=YYY 로 리다이렉트 하는 곳.
 * code 를 서버로 보내 Firebase Custom Token 을 받고 signInWithCustomToken 으로 세션 생성.
 */
import { signInWithCustomToken } from 'firebase/auth'

useSeoMeta({ title: '카카오 로그인 처리 중', robots: 'noindex, nofollow' })

const auth = useFirebaseAuth()
const route = useRoute()
const status = ref<'processing' | 'error'>('processing')
const errorMessage = ref<string | null>(null)

async function handleCallback() {
  if (!auth) {
    status.value = 'error'
    errorMessage.value = '인증 서비스가 초기화되지 않았어요.'
    return
  }

  const code = route.query.code as string | undefined
  const kakaoError = route.query.error as string | undefined
  const kakaoErrorDesc = route.query.error_description as string | undefined

  if (kakaoError) {
    status.value = 'error'
    errorMessage.value = kakaoErrorDesc || '카카오 로그인이 취소됐어요.'
    return
  }

  if (!code) {
    status.value = 'error'
    errorMessage.value = '인증 코드를 받지 못했어요.'
    return
  }

  try {
    const { customToken } = await $fetch<{ customToken: string }>('/api/auth/kakao', {
      method: 'POST',
      body: {
        code,
        redirectUri: `${location.origin}/auth/kakao/callback`
      }
    })

    await signInWithCustomToken(auth, customToken)

    useFlash().show('로그인했어요')

    const state = route.query.state as string | undefined
    const redirect = state ? decodeURIComponent(state) : '/'
    await navigateTo(redirect, { replace: true })
  } catch (e: any) {
    status.value = 'error'
    errorMessage.value = e?.data?.statusMessage ?? e?.message ?? '로그인 처리 중 오류가 발생했어요.'
  }
}

onMounted(handleCallback)
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-20 text-center">
    <template v-if="status === 'processing'">
      <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-neutral-400" />
      <p class="mt-4 text-sm text-neutral-500">카카오 로그인 처리 중이에요...</p>
    </template>

    <template v-else>
      <img
        src="/mascot-sad.png"
        alt="로그인에 실패했어요"
        class="h-28 w-auto select-none sm:h-32"
        draggable="false"
      >
      <h1 class="mt-4 text-xl font-bold tracking-tight">로그인에 실패했어요</h1>
      <p class="mt-2 text-sm text-neutral-500">{{ errorMessage }}</p>
      <NuxtLink
        to="/login"
        class="mt-6 inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium leading-none text-white transition hover:bg-[#262626]"
      >
        로그인으로 돌아가기
      </NuxtLink>
    </template>
  </div>
</template>
