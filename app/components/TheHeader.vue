<script setup lang="ts">
import { signOut } from 'firebase/auth'

const route = useRoute()
const router = useRouter()

const productType = ref<'web' | 'app'>('web')

// Mobile-only search input (desktop search lives on the home hero)
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
  if (!user.value) {
    isAdmin.value = false
    return
  }
  try {
    const token = await user.value.getIdTokenResult()
    isAdmin.value = !!token.claims.admin
  } catch {
    isAdmin.value = false
  }
})

const userMenuItems = computed(() => {
  const items: any[][] = [[{ label: user.value?.email ?? '', type: 'label' as const }]]
  const main: any[] = [
    { label: '북마크', to: '/me/bookmarks', icon: 'i-lucide-bookmark' }
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

async function logout() {
  if (!auth) return
  await signOut(auth)
  await navigateTo('/')
}

const mobileOpen = ref(false)
watch(() => route.fullPath, () => { mobileOpen.value = false })

const isHome = computed(() => route.path === '/')

function goHomeSearch() {
  router.push({ path: '/', query: { ...route.query, focus: 'search' } })
}
</script>

<template>
  <header class="w-full">
    <div class="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-4">
      <!-- Left: Logo + type tabs -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="block" aria-label="AMU 홈">
          <img src="/logo_amu.png" alt="AMU" class="h-6 w-auto">
        </NuxtLink>
        <nav class="hidden sm:flex items-center gap-4 text-sm font-semibold">
          <button
            class="transition"
            :class="productType === 'web' ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            @click="productType = 'web'"
          >
            웹
          </button>
          <button
            class="transition"
            :class="productType === 'app' ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400 hover:text-neutral-600'"
            @click="productType = 'app'"
          >
            앱
          </button>
        </nav>
      </div>

      <!-- Right: Actions -->
      <div class="ml-auto flex items-center gap-2">
        <!-- Search icon (only on non-home pages) — leads to home hero search -->
        <button
          v-if="!isHome"
          type="button"
          class="hidden sm:flex size-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
          aria-label="검색"
          @click="goHomeSearch"
        >
          <UIcon name="i-lucide-search" class="size-4" />
        </button>

        <UButton
          to="/submit"
          color="neutral"
          variant="outline"
          size="sm"
          class="hidden sm:inline-flex"
        >
          등록하기
        </UButton>

        <template v-if="user">
          <UDropdownMenu :items="userMenuItems" :content="{ align: 'end' }">
            <button
              class="flex size-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200 ring-1 ring-neutral-300 dark:bg-neutral-700 dark:ring-neutral-600"
              aria-label="계정 메뉴"
            >
              <img
                v-if="user.photoURL"
                :src="user.photoURL"
                :alt="user.displayName || 'user'"
                class="size-full object-cover"
                referrerpolicy="no-referrer"
              >
              <UIcon v-else name="i-lucide-user" class="size-4 text-neutral-500" />
            </button>
          </UDropdownMenu>
        </template>

        <template v-else>
          <UButton
            to="/login"
            color="neutral"
            variant="solid"
            size="sm"
            class="hidden sm:inline-flex"
          >
            로그인
          </UButton>
        </template>

        <!-- Mobile toggle -->
        <button
          class="ml-1 flex size-8 items-center justify-center rounded-full ring-1 ring-neutral-300 md:hidden dark:ring-neutral-700"
          :aria-expanded="mobileOpen"
          aria-label="메뉴"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Mobile menu panel -->
    <div v-if="mobileOpen" class="md:hidden border-t border-neutral-200 dark:border-neutral-800">
      <div class="mx-auto max-w-[1280px] space-y-4 px-6 py-4">
        <form @submit.prevent="submitSearch">
          <div class="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
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
          <NuxtLink to="/" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            둘러보기
          </NuxtLink>
          <NuxtLink to="/collections" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            컬렉션
          </NuxtLink>
          <NuxtLink to="/compare" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            비교하기
          </NuxtLink>
          <NuxtLink to="/submit" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            등록하기
          </NuxtLink>
          <NuxtLink to="/about" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            About
          </NuxtLink>
          <NuxtLink v-if="user" to="/me/bookmarks" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            내 북마크
          </NuxtLink>
          <NuxtLink v-if="isAdmin" to="/admin" class="rounded-full px-3 py-2 hover:bg-neutral-150 dark:hover:bg-neutral-800">
            관리자
          </NuxtLink>
        </nav>

        <div class="border-t border-neutral-200 pt-4 dark:border-neutral-800">
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
