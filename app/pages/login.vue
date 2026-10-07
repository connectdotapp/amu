<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

useSeoMeta({
  title: '로그인',
  robots: 'noindex, nofollow'
})

const auth = useFirebaseAuth()
const route = useRoute()
const config = useRuntimeConfig()
const googleLoading = ref(false)
const kakaoLoading = ref(false)
const naverLoading = ref(false)
const error = ref<string | null>(null)

const loading = computed(() => googleLoading.value || kakaoLoading.value || naverLoading.value)

async function finishLogin() {
  const redirect = (route.query.redirect as string) || '/'
  await navigateTo(redirect)
}

async function loginGoogle() {
  if (!auth || loading.value) return
  googleLoading.value = true
  error.value = null
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
    await finishLogin()
  } catch (e: any) {
    error.value = e?.message ?? '로그인에 실패했어요.'
  } finally {
    googleLoading.value = false
  }
}

function loginKakao() {
  if (!auth || loading.value) return

  const Kakao = window.Kakao
  if (!Kakao?.isInitialized?.()) {
    error.value = '카카오 SDK 가 아직 로딩 중이에요. 잠시 후 다시 시도해주세요.'
    return
  }

  kakaoLoading.value = true
  error.value = null

  // 로그인 후 돌아올 경로를 쿼리로 넣어두면 callback 에서 꺼내 리다이렉트.
  const redirectAfterLogin = (route.query.redirect as string) || '/'
  const redirectUri = `${location.origin}/auth/kakao/callback`

  // state 로 redirect 경로 전달 (CSRF 완화 겸)
  const state = encodeURIComponent(redirectAfterLogin)

  Kakao.Auth.authorize({
    redirectUri,
    scope: 'profile_nickname,profile_image',
    state
  })
  // 이 호출은 리다이렉트를 트리거하므로 반환되지 않음. kakaoLoading 상태는 페이지 이탈로 리셋.
}

function loginNaver() {
  if (!auth || loading.value) return

  const clientId = config.public.naverClientId as string
  if (!clientId) {
    error.value = '네이버 로그인이 설정되지 않았어요.'
    return
  }

  naverLoading.value = true
  error.value = null

  // CSRF 방어용 state. 콜백에서 sessionStorage 값과 비교.
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36)
  // sessionStorage 는 일부 환경 (리다이렉트 후 창 재생성 등) 에서 유실 → localStorage.
  localStorage.setItem('naver-state', state)
  localStorage.setItem('naver-redirect', (route.query.redirect as string) || '/')

  const redirectUri = `${location.origin}/auth/naver/callback`
  const authUrl = new URL('https://nid.naver.com/oauth2.0/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('state', state)

  window.location.href = authUrl.toString()
}
</script>

<template>
  <div class="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
    <img
      src="/mascot-black.png"
      alt="AMU 마스코트"
      class="h-28 w-auto select-none sm:h-32"
      draggable="false"
    >
    <h1 class="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">아무와 함께하세요</h1>

    <div class="mt-10 w-full space-y-3 rounded-3xl bg-neutral-100 p-8 dark:bg-neutral-800">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-full bg-[#03C75A] px-5 py-3 text-[15px] font-bold text-white transition hover:brightness-[0.95] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="loginNaver"
      >
        <svg
          v-if="!naverLoading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="size-5"
          aria-hidden="true"
        >
          <path fill="white" d="M14.233 12.835 9.302 5.667H5v12.666h4.767V11.165l4.931 7.168H19V5.667h-4.767v7.168Z" />
        </svg>
        <UIcon v-else name="i-lucide-loader-2" class="size-5 animate-spin" />
        네이버로 계속하기
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-full bg-[#FEE500] px-5 py-3 text-[15px] font-bold text-[#191600] transition hover:brightness-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="loginKakao"
      >
        <svg
          v-if="!kakaoLoading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          class="size-5"
          aria-hidden="true"
        >
          <path
            fill="#191600"
            d="M12 3C6.48 3 2 6.58 2 11c0 2.86 1.86 5.38 4.68 6.8l-.8 2.93c-.08.29.24.52.48.37L10 19.14c.65.1 1.32.15 2 .15 5.52 0 10-3.58 10-8s-4.48-8-10-8z"
          />
        </svg>
        <UIcon v-else name="i-lucide-loader-2" class="size-5 animate-spin" />
        카카오로 계속하기
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-3 text-[15px] font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="loginGoogle"
      >
        <svg
          v-if="!googleLoading"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          class="size-5"
          aria-hidden="true"
        >
          <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
          <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
          <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
          <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
        </svg>
        <UIcon v-else name="i-lucide-loader-2" class="size-5 animate-spin" />
        Google로 계속하기
      </button>

      <p v-if="error" class="mt-3 text-sm text-error">{{ error }}</p>
    </div>

    <p class="mt-6 text-xs text-neutral-500">
      이미 가입하셨다면 처음 가입한 방식으로 로그인해주세요
    </p>
    <p class="mt-2 text-xs text-neutral-400">
      계속 진행 시 이용약관과 개인정보처리방침에 동의하는 것으로 간주해요
    </p>
  </div>
</template>
