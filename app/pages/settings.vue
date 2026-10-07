<script setup lang="ts">
/**
 * 유저 설정. 현재는 프로필 조회 + 계정 삭제만. 추후 알림/이메일 설정 등 확장.
 */
import { signOut } from 'firebase/auth'

definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: '설정',
  robots: 'noindex, nofollow'
})

const auth = useFirebaseAuth()
const user = useCurrentUser()
const { run: deleteAccount, deleting, error: deleteError } = useAccountDelete()

// 로그인 방식 식별. 소셜은 UID prefix, Google 은 providerData.
const loginProvider = computed(() => {
  if (!user.value) return ''
  if (user.value.uid.startsWith('kakao:')) return '카카오'
  if (user.value.uid.startsWith('naver:')) return '네이버'
  const providerId = user.value.providerData?.[0]?.providerId
  if (providerId === 'google.com') return 'Google'
  return '기타'
})

const confirmOpen = ref(false)
const confirmText = ref('')
const confirmPhrase = '계정 삭제'
const canSubmitDelete = computed(() => confirmText.value.trim() === confirmPhrase)

async function handleLogout() {
  if (!auth) return
  await signOut(auth)
  await navigateTo('/')
}

async function handleDelete() {
  if (!canSubmitDelete.value) return
  const ok = await deleteAccount()
  if (ok) {
    // Auth 세션은 이미 끊긴 상태. 홈으로.
    confirmOpen.value = false
    await navigateTo('/')
  }
}

function openConfirm() {
  confirmText.value = ''
  confirmOpen.value = true
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">설정</h1>

    <section class="mt-10">
      <h2 class="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">프로필</h2>
      <div class="mt-4 flex items-center gap-4 rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
        <img
          v-if="user?.photoURL"
          :src="user.photoURL"
          :alt="user?.displayName ?? ''"
          class="size-14 rounded-full bg-neutral-200 object-cover"
          referrerpolicy="no-referrer"
        >
        <div v-else class="flex size-14 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
          <UIcon name="i-lucide-user" class="size-6 text-neutral-500" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-base font-bold tracking-tight">{{ user?.displayName ?? '이름 없음' }}</p>
          <p class="truncate text-sm text-neutral-500">{{ user?.email || loginProvider + ' 계정' }}</p>
        </div>
        <span class="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
          {{ loginProvider }}
        </span>
      </div>
      <p class="mt-3 text-xs text-neutral-500">
        프로필 정보는 {{ loginProvider }} 계정에서 가져와요
      </p>
    </section>

    <section class="mt-12">
      <h2 class="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">계정</h2>
      <div class="mt-4 divide-y divide-neutral-150 overflow-hidden rounded-3xl bg-neutral-100 dark:divide-neutral-700 dark:bg-neutral-800">
        <button
          type="button"
          class="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-neutral-150 dark:hover:bg-neutral-700"
          @click="handleLogout"
        >
          <span class="flex items-center gap-3">
            <UIcon name="i-lucide-log-out" class="size-5 text-neutral-500" />
            <span class="text-sm font-semibold">로그아웃</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-neutral-400" />
        </button>
      </div>
    </section>

    <section class="mt-12">
      <h2 class="text-xs font-bold uppercase tracking-[0.14em] text-red-600">위험 영역</h2>
      <div class="mt-4 rounded-3xl border border-red-200 bg-red-50/60 p-6 dark:border-red-900/50 dark:bg-red-950/20">
        <h3 class="text-sm font-bold tracking-tight">계정 삭제</h3>
        <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          계정과 북마크가 영구 삭제돼요
          작성한 댓글·업보트·제출한 프로덕트는 계정 식별 정보가 분리된 상태로 유지돼요
          완전 삭제가 필요하면
          <a
            href="mailto:connectdot.app@gmail.com?subject=%EA%B3%84%EC%A0%95%20%EC%99%84%EC%A0%84%20%EC%82%AD%EC%A0%9C%20%EC%9A%94%EC%B2%AD"
            class="text-neutral-700 underline underline-offset-2 hover:text-neutral-900 dark:text-neutral-300"
          >connectdot.app@gmail.com</a>
          으로 요청해주세요
        </p>

        <div class="mt-6">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-red-600 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
            @click="openConfirm"
          >
            <UIcon name="i-lucide-trash-2" class="size-4" />
            계정 삭제하기
          </button>
        </div>
      </div>
    </section>

    <!-- 확인 모달 -->
    <UModal v-model:open="confirmOpen" :dismissible="!deleting">
      <template #content>
        <div class="p-6 sm:p-8">
          <div class="flex size-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
            <UIcon name="i-lucide-alert-triangle" class="size-5 text-red-600" />
          </div>
          <h3 class="mt-4 text-lg font-bold tracking-tight">정말 계정을 삭제할까요?</h3>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            이 작업은 되돌릴 수 없어요
            아래에 <strong class="font-bold text-neutral-900 dark:text-neutral-50">{{ confirmPhrase }}</strong> 라고 입력해주세요
          </p>

          <input
            v-model="confirmText"
            type="text"
            :placeholder="confirmPhrase"
            autocomplete="off"
            class="mt-4 w-full rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm outline-none transition focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900"
            :disabled="deleting"
          >

          <p v-if="deleteError" class="mt-3 text-xs text-red-600">
            {{ deleteError }}
          </p>

          <div class="mt-6 flex gap-2">
            <button
              type="button"
              class="flex-1 rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
              :disabled="deleting"
              @click="confirmOpen = false"
            >
              취소
            </button>
            <button
              type="button"
              class="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="!canSubmitDelete || deleting"
              @click="handleDelete"
            >
              {{ deleting ? '삭제 중...' : '영구 삭제' }}
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
