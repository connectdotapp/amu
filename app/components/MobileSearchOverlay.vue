<script setup lang="ts">
// 모바일 전체 화면 검색. 제출 시 홈 ?q= 로 이동 (기존 검색 로직 재사용).
const open = defineModel<boolean>('open', { default: false })

const router = useRouter()
const { data: categories } = useCategories()

const input = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const RECENT_KEY = 'amu:recent-searches'
const recent = ref<string[]>([])

const popularTags = ['일기', '공부', '무료', '1인개발', 'AI', '습관']

function loadRecent() {
  try {
    recent.value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    recent.value = []
  }
}

function saveRecent(list: string[]) {
  recent.value = list
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch { /* storage 불가 환경 무시 */ }
}

function search(term: string) {
  const q = term.trim()
  if (!q) return
  saveRecent([q, ...recent.value.filter(r => r !== q)].slice(0, 8))
  open.value = false
  router.push({ path: '/', query: { q } })
}

function removeRecent(term: string) {
  saveRecent(recent.value.filter(r => r !== term))
}

watch(open, async (v) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  if (v) {
    loadRecent()
    input.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) document.documentElement.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white pt-[env(safe-area-inset-top)] md:hidden dark:bg-neutral-950"
      role="dialog"
      aria-modal="true"
      aria-label="검색"
    >
      <form
        class="flex items-center gap-2 py-1.5 pl-5 pr-3"
        @submit.prevent="search(input)"
      >
        <div class="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-neutral-100 px-[18px] dark:bg-neutral-800">
          <UIcon
            name="i-lucide-search"
            class="size-5 shrink-0 text-neutral-950 dark:text-neutral-50"
          />
          <input
            ref="inputRef"
            v-model="input"
            type="search"
            enterkeyhint="search"
            placeholder="앱 이름, 태그, 설명 검색"
            class="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-400"
          >
        </div>
        <button
          type="button"
          class="flex h-11 shrink-0 items-center px-2 text-[15px] font-semibold"
          @click="open = false"
        >
          취소
        </button>
      </form>

      <section
        v-if="recent.length"
        class="mt-6"
      >
        <div class="mb-1 flex items-center justify-between px-5 text-[13px] font-bold text-neutral-500">
          <span>최근 검색어</span>
          <button
            type="button"
            class="flex h-11 items-center font-medium"
            @click="saveRecent([])"
          >
            모두 지우기
          </button>
        </div>
        <ul>
          <li
            v-for="r in recent"
            :key="r"
            class="flex h-[52px] items-center gap-3 px-5 text-[15px]"
          >
            <UIcon
              name="i-lucide-clock"
              class="size-[18px] text-neutral-400"
            />
            <button
              type="button"
              class="min-w-0 flex-1 truncate text-left"
              @click="search(r)"
            >
              {{ r }}
            </button>
            <button
              type="button"
              class="flex size-11 items-center justify-center text-neutral-400"
              :aria-label="`${r} 삭제`"
              @click="removeRecent(r)"
            >
              <UIcon
                name="i-lucide-x"
                class="size-4"
              />
            </button>
          </li>
        </ul>
      </section>

      <section class="mt-6">
        <div class="mb-2.5 px-5 text-[13px] font-bold text-neutral-500">
          인기 태그
        </div>
        <div class="flex flex-wrap gap-2 px-5">
          <button
            v-for="t in popularTags"
            :key="t"
            type="button"
            class="flex h-9 items-center rounded-full bg-neutral-100 px-[15px] text-[13px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            @click="search(t)"
          >
            #{{ t }}
          </button>
        </div>
      </section>

      <section
        v-if="categories?.length"
        class="mt-6 pb-10"
      >
        <div class="mb-2.5 px-5 text-[13px] font-bold text-neutral-500">
          카테고리
        </div>
        <div class="grid grid-cols-2 gap-x-2 gap-y-1 px-5">
          <NuxtLink
            v-for="c in categories"
            :key="c.slug"
            :to="`/categories/${c.slug}`"
            class="flex h-11 items-center rounded-xl bg-neutral-100 px-3.5 text-[15px] font-semibold dark:bg-neutral-900"
            @click="open = false"
          >
            {{ c.name }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </Teleport>
</template>
