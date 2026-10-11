<script setup lang="ts">
import { signOut } from 'firebase/auth'

const route = useRoute()
const router = useRouter()

const searchInput = ref((route.query.q as string) || '')
watch(() => route.query.q, (v) => { searchInput.value = (v as string) || '' })

function submitSearch() {
  const q = searchInput.value.trim()
  router.push({ path: '/', query: { ...(route.path === '/' ? route.query : {}), q: q || undefined } })
  mobileOpen.value = false
}

const auth = useFirebaseAuth()
const user = useCurrentUser()
const isAdmin = ref(false)

watchEffect(async () => {
  if (!user.value) { isAdmin.value = false; return }
  try {
    const token = await user.value.getIdTokenResult()
    isAdmin.value = !!token.claims.admin
  } catch { isAdmin.value = false }
})

const userMenuItems = computed(() => {
  // 로그아웃 상태: 로그인 하나만 노출. 9-dot 아이콘이 로그인/프로필 공통 진입점.
  if (!user.value) {
    return [[{ label: '로그인', to: '/login', icon: 'i-lucide-log-in' }]]
  }
  // 카카오 유저는 email 이 없음 (비즈앱 심사 전까지 수집 불가) → displayName 으로 폴백.
  const identityLabel = user.value.email || user.value.displayName || '내 계정'
  const items: any[][] = [[{ label: identityLabel, type: 'label' as const }]]
  const main: any[] = [
    { label: '북마크', to: '/me/bookmarks', icon: 'i-lucide-bookmark' },
    { label: '설정', to: '/settings', icon: 'i-lucide-settings' }
  ]
  if (isAdmin.value) {
    main.unshift({ label: '관리자', to: '/admin', icon: 'i-lucide-shield' })
  }
  items.push(main)
  items.push([
    { label: '로그아웃', icon: 'i-lucide-log-out', onSelect: logout }
  ])
  return items
})

const flash = useFlash()

async function logout() {
  if (!auth) return
  await signOut(auth)
  flash.show('로그아웃했어요')
  await navigateTo('/')
}

function handleSubmitClick() {
  if (!user.value) {
    flash.show('로그인이 필요해요')
    navigateTo('/login?redirect=/submit')
    mobileOpen.value = false
    return
  }
  navigateTo('/submit')
  mobileOpen.value = false
}

const mobileOpen = ref(false)
watch(() => route.fullPath, () => { mobileOpen.value = false })

const isHome = computed(() => route.path === '/')

function goHomeSearch() {
  router.push({ path: '/', query: { ...(route.path === '/' ? route.query : {}), focus: 'search' } })
}

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const nav = [
  { label: '컬렉션', to: '/collections' },
  { label: '둘러보기', to: '/' },
  { label: 'About', to: '/about' }
]

// 카테고리 메가메뉴
const { data: categories } = useCategories()
const categoriesOpen = ref(false)
const megamenuRef = ref<HTMLElement | null>(null)
const categoryBtnRef = ref<HTMLElement | null>(null)

function onCategoryClick(slug: string) {
  categoriesOpen.value = false
  router.push(`/categories/${slug}`)
}

// 커뮤니티 드롭다운
const communityOpen = ref(false)
const communityMenuRef = ref<HTMLElement | null>(null)
const communityBtnRef = ref<HTMLElement | null>(null)
const communityLinks = [
  { label: '공지사항', to: '/community/notices', icon: 'i-lucide-megaphone' },
  { label: '커뮤니티', to: '/community', icon: 'i-lucide-messages-square' },
  { label: 'FAQ', to: '/community/faq', icon: 'i-lucide-help-circle' }
]

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as Node
  if (categoriesOpen.value) {
    if (!megamenuRef.value?.contains(target) && !categoryBtnRef.value?.contains(target)) {
      categoriesOpen.value = false
    }
  }
  if (communityOpen.value) {
    if (!communityMenuRef.value?.contains(target) && !communityBtnRef.value?.contains(target)) {
      communityOpen.value = false
    }
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutsideClick))

// 라우트 바뀌면 닫기
watch(() => route.fullPath, () => {
  categoriesOpen.value = false
  communityOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white dark:bg-neutral-950">
    <div class="mx-auto flex max-w-[1280px] items-center gap-10 px-6 py-7">
      <NuxtLink to="/" class="block shrink-0" aria-label="AMU 홈">
        <img src="/logo-2.png" alt="AMU" class="h-16 w-auto">
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-14 text-base font-bold">
        <!-- 카테고리 메가메뉴 트리거 -->
        <button
          ref="categoryBtnRef"
          type="button"
          class="inline-flex items-center gap-1 transition"
          :class="categoriesOpen ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
          :aria-expanded="categoriesOpen"
          @click="categoriesOpen = !categoriesOpen"
        >
          카테고리
          <UIcon :name="categoriesOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4" />
        </button>

        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="transition"
          :class="isActive(item.to) ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- 커뮤니티 드롭다운 트리거 -->
        <div class="relative">
          <button
            ref="communityBtnRef"
            type="button"
            class="inline-flex items-center gap-1 transition"
            :class="communityOpen || route.path.startsWith('/community') ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            :aria-expanded="communityOpen"
            @click="communityOpen = !communityOpen"
          >
            커뮤니티
            <UIcon :name="communityOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4" />
          </button>
          <div
            v-if="communityOpen"
            ref="communityMenuRef"
            class="absolute left-0 top-full z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-neutral-150 bg-white py-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
          >
            <NuxtLink
              v-for="link in communityLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            >
              <UIcon :name="link.icon" class="size-4 text-neutral-500" />
              {{ link.label }}
            </NuxtLink>
          </div>
        </div>
      </nav>

      <div class="ml-auto flex items-center gap-3">
        <button
          v-if="!isHome"
          type="button"
          class="hidden sm:flex size-10 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
          aria-label="검색"
          @click="goHomeSearch"
        >
          <UIcon name="i-lucide-search" class="size-5" />
        </button>

        <button
          type="button"
          class="hidden sm:inline-flex items-center justify-center rounded-full bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium leading-none text-white transition hover:bg-[#262626]"
          @click="handleSubmitClick"
        >
          등록하기
        </button>

        <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
          <button
            class="hidden sm:flex size-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
            aria-label="메뉴"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-5" aria-hidden="true">
              <circle cx="4" cy="4" r="1.6" />
              <circle cx="10" cy="4" r="1.6" />
              <circle cx="16" cy="4" r="1.6" />
              <circle cx="4" cy="10" r="1.6" />
              <circle cx="10" cy="10" r="1.6" />
              <circle cx="16" cy="10" r="1.6" />
              <circle cx="4" cy="16" r="1.6" />
              <circle cx="10" cy="16" r="1.6" />
              <circle cx="16" cy="16" r="1.6" />
            </svg>
          </button>
        </UDropdownMenu>

        <button
          class="ml-1 flex size-9 items-center justify-center rounded-full bg-neutral-100 md:hidden dark:bg-neutral-800"
          :aria-expanded="mobileOpen"
          aria-label="메뉴"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-4" />
        </button>
      </div>
    </div>

    <!-- 카테고리 메가메뉴 패널 -->
    <div
      v-if="categoriesOpen"
      ref="megamenuRef"
      class="hidden md:block absolute left-0 right-0 top-full border-t border-neutral-150 bg-white shadow-lg dark:bg-neutral-950"
    >
      <div class="mx-auto max-w-[1280px] px-6 py-8">
        <div class="mb-4 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          Categories
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
          <button
            v-for="c in categories"
            :key="c.slug"
            type="button"
            class="group rounded-xl px-3 py-3 text-left text-[15px] font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            @click="onCategoryClick(c.slug)"
          >
            {{ c.name }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mobileOpen" class="md:hidden">
      <div class="mx-auto max-w-[1280px] space-y-4 px-6 py-4">
        <form @submit.prevent="submitSearch">
          <div class="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
            <UIcon name="i-lucide-search" class="size-4 text-neutral-400" />
            <input
              v-model="searchInput"
              type="text"
              placeholder="이름, 태그, 설명 검색"
              class="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            >
          </div>
        </form>

        <nav class="flex flex-col gap-1 text-base font-semibold">
          <NuxtLink
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="rounded-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            {{ item.label }}
          </NuxtLink>
          <button
            type="button"
            class="rounded-full px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"
            @click="handleSubmitClick"
          >
            등록하기
          </button>
          <NuxtLink v-if="user" to="/me/bookmarks" class="rounded-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            내 북마크
          </NuxtLink>
          <NuxtLink v-if="user" to="/settings" class="rounded-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            설정
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="rounded-full px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            관리자
          </NuxtLink>

          <!-- 커뮤니티 (모바일: 섹션으로 펼침) -->
          <div class="mt-3 border-t border-neutral-150 pt-3 dark:border-neutral-800">
            <div class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              커뮤니티
            </div>
            <NuxtLink
              v-for="link in communityLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <UIcon :name="link.icon" class="size-4 text-neutral-500" />
              {{ link.label }}
            </NuxtLink>
          </div>

          <!-- 카테고리 (모바일: 아코디언 대신 바로 그리드로 노출) -->
          <div class="mt-3 border-t border-neutral-150 pt-3 dark:border-neutral-800">
            <div class="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
              카테고리
            </div>
            <div class="grid grid-cols-2 gap-1">
              <NuxtLink
                v-for="c in categories"
                :key="c.slug"
                :to="`/categories/${c.slug}`"
                class="rounded-full px-3 py-2 text-sm font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {{ c.name }}
              </NuxtLink>
            </div>
          </div>
        </nav>

        <div class="pt-2">
          <UButton
            v-if="!user"
            to="/login"
            block
            color="neutral"
            variant="solid"
            size="sm"
          >
            로그인
          </UButton>
          <UButton
            v-else
            block
            color="neutral"
            variant="outline"
            size="sm"
            @click="logout"
          >
            로그아웃
          </UButton>
        </div>
      </div>
    </div>
  </header>
</template>
