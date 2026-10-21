<script setup lang="ts">
// 모바일(md 미만) 전용 하단 탭바. 상품 상세·등록 화면은 자체 하단 액션바를 쓰므로 숨김.
const route = useRoute()
const user = useCurrentUser()

const hidden = computed(() =>
  route.path.startsWith('/products/')
  || route.path === '/submit'
  || route.path.startsWith('/admin')
  || route.path.startsWith('/auth/')
)

const tabs = computed(() => [
  { label: '홈', to: '/', icon: 'i-lucide-house', match: (p: string) => p === '/' },
  { label: '카테고리', to: '/categories', icon: 'i-lucide-layout-grid', match: (p: string) => p.startsWith('/categories') },
  { label: '등록', to: user.value ? '/submit' : '/login?redirect=/submit', icon: 'i-lucide-plus', primary: true, match: (p: string) => p === '/submit' },
  { label: '컬렉션', to: '/collections', icon: 'i-lucide-library', match: (p: string) => p.startsWith('/collections') },
  {
    label: '마이',
    to: user.value ? '/me/bookmarks' : '/login',
    icon: 'i-lucide-user',
    match: (p: string) => p.startsWith('/me') || p === '/settings' || p === '/login'
  }
])
</script>

<template>
  <div
    v-if="!hidden"
    class="md:hidden"
  >
    <!-- 문서 흐름상 탭바 높이만큼 공간 확보 (푸터 색과 이어지도록 검정) -->
    <div
      class="h-[calc(var(--mobile-tabbar-h)+var(--safe-bottom))] bg-[#0A0A0A]"
      aria-hidden="true"
    />

    <nav
      class="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-150 bg-white/95 pb-safe backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95"
      aria-label="하단 메뉴"
    >
      <ul class="grid h-14 grid-cols-5">
        <li
          v-for="t in tabs"
          :key="t.label"
        >
          <NuxtLink
            :to="t.to"
            class="flex h-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition active:opacity-60"
            :class="t.match(route.path) ? 'text-neutral-950 dark:text-neutral-50' : 'text-neutral-400'"
            :aria-label="t.label"
          >
            <span
              v-if="t.primary"
              class="flex size-10 items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
            >
              <UIcon
                :name="t.icon"
                class="size-[22px]"
              />
            </span>
            <template v-else>
              <UIcon
                :name="t.icon"
                class="size-6"
              />
              {{ t.label }}
            </template>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </div>
</template>
