<script setup lang="ts">
import { signOut } from 'firebase/auth'

const productType = ref<'web' | 'app'>('web')
const searchQuery = ref('')

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
</script>

<template>
  <header class="w-full">
    <div class="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-4">
      <!-- Left: Logo + type tabs -->
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="text-xl font-black tracking-tighter">
          AMU
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

      <!-- Center: Search -->
      <div class="mx-auto hidden w-full max-w-md md:block">
        <div class="flex items-center gap-2 rounded-full bg-white px-4 py-2 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:ring-neutral-700">
          <UIcon name="i-lucide-search" class="size-4 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search on Web..."
            class="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
          >
          <kbd class="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-400 dark:bg-neutral-700">
            ⌘K
          </kbd>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="ml-auto flex items-center gap-2">
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
          >
            로그인
          </UButton>
        </template>
      </div>
    </div>
  </header>
</template>
