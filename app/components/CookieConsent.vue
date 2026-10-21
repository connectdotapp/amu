<script setup lang="ts">
// 쿠키·GA4 수집 동의 배너. localStorage 로 선택 상태 저장.
// 동의하면 analytics plugin 이 수집 시작. 거부하면 수집 중단.
// 플러그인 측에서 window.__amuConsent 를 체크해 조건부 로깅.
const CONSENT_KEY = 'amu-cookie-consent'

type Consent = 'accepted' | 'rejected' | null

const consent = ref<Consent>(null)
const visible = ref(false)

onMounted(() => {
  const stored = localStorage.getItem(CONSENT_KEY) as Consent
  consent.value = stored
  visible.value = stored === null
  // 플러그인에서 참조할 수 있도록 글로벌 플래그 세팅
  if (typeof window !== 'undefined') {
    (window as any).__amuConsent = stored
  }
})

function set(value: 'accepted' | 'rejected') {
  consent.value = value
  localStorage.setItem(CONSENT_KEY, value)
  if (typeof window !== 'undefined') {
    (window as any).__amuConsent = value
  }
  visible.value = false
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-500"
    enter-from-class="opacity-0 translate-y-6"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-300"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="visible"
      class="fixed inset-x-3 bottom-[calc(var(--mobile-tabbar-h)+var(--safe-bottom)+0.5rem)] z-50 mx-auto max-w-3xl rounded-2xl bg-neutral-950 px-4 py-3 text-white shadow-2xl md:inset-x-4 md:bottom-6 md:p-6"
    >
      <div class="flex items-center gap-3 sm:items-start md:gap-4">
        <div class="flex-1">
          <h3 class="hidden text-sm font-bold tracking-tight md:block md:text-base">
            🍪 쿠키 사용에 동의해주세요
          </h3>
          <p class="text-xs leading-snug text-neutral-300 md:mt-1.5 md:text-sm md:leading-relaxed">
            AMU는 서비스 개선을 위해 쿠키와 Google Analytics 를 사용해요
            동의하지 않아도 서비스는 이용 가능해요
            <NuxtLink to="/legal/privacy" class="underline underline-offset-2 hover:text-white">
              자세히 보기
            </NuxtLink>
          </p>
        </div>

        <div class="flex shrink-0 gap-1.5 sm:flex-col sm:items-stretch md:gap-2">
          <button
            type="button"
            class="min-h-9 rounded-full bg-white px-3 py-2 md:flex-1 md:px-4 md:py-2.5 text-xs font-bold text-neutral-950 transition hover:bg-neutral-200 sm:text-sm"
            @click="set('accepted')"
          >
            <span class="md:hidden">동의</span><span class="hidden md:inline">전체 동의</span>
          </button>
          <button
            type="button"
            class="min-h-9 rounded-full border border-neutral-700 px-3 py-2 md:flex-1 md:px-4 md:py-2.5 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-800 sm:text-sm"
            @click="set('rejected')"
          >
            거부
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
