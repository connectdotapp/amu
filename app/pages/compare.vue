<script setup lang="ts">
import type { Product } from '~/types/product'

useSeoMeta({
  title: '프로덕트 비교',
  description: '관심 있는 앱·웹·프로그램을 나란히 놓고 비교해요.',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const router = useRouter()

const MAX_COMPARE = 4

const selectedIds = computed<string[]>(() => {
  const raw = route.query.ids
  if (!raw) return []
  const arr = (Array.isArray(raw) ? raw.join(',') : String(raw))
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return Array.from(new Set(arr)).slice(0, MAX_COMPARE)
})

const { data: products } = useCompareProducts(selectedIds)

function updateIds(next: string[]) {
  router.push({
    query: { ...route.query, ids: next.length ? next.join(',') : undefined }
  })
}

function addProduct(id: string) {
  if (selectedIds.value.includes(id)) return
  if (selectedIds.value.length >= MAX_COMPARE) return
  updateIds([...selectedIds.value, id])
  search.value = ''
}

function removeProduct(id: string) {
  updateIds(selectedIds.value.filter(x => x !== id))
}

function clearAll() {
  updateIds([])
}

// Pool for picker
const { data: pool } = useAllPublishedProducts(200)
const search = ref('')

const searchResults = computed<Product[]>(() => {
  const q = search.value.toLowerCase().trim()
  const already = new Set(selectedIds.value)
  return (pool.value || [])
    .filter(p => !already.has(p.id))
    .filter(p => !q || p.name?.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q))
    .slice(0, 8)
})

const remainingSlots = computed(() => MAX_COMPARE - selectedIds.value.length)
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-5 py-6 md:px-6 md:py-10">
    <header class="mx-auto max-w-3xl text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">비교</h1>
    </header>

    <!-- Picker -->
    <section class="mx-auto mt-10 max-w-2xl">
      <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-sm font-semibold">
            {{ selectedIds.length }}/{{ MAX_COMPARE }}개 선택됨
          </div>
          <button
            v-if="selectedIds.length > 0"
            type="button"
            class="text-xs text-neutral-500 underline underline-offset-2 hover:text-neutral-950 dark:hover:text-neutral-50"
            @click="clearAll"
          >
            모두 지우기
          </button>
        </div>

        <div class="relative">
          <UInput
            v-model="search"
            :placeholder="remainingSlots > 0 ? '프로덕트 이름/태그라인으로 검색' : '최대 개수에 도달했어요'"
            :disabled="remainingSlots === 0"
            icon="i-lucide-search"
          />
          <ul
            v-if="search && searchResults.length"
            class="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-auto rounded-xl bg-neutral-50 shadow-lg dark:bg-neutral-900"
          >
            <li
              v-for="p in searchResults"
              :key="p.id"
              class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-150 dark:hover:bg-neutral-800"
              @click="addProduct(p.id)"
            >
              <img :src="p.thumbnailUrl" :alt="p.name" class="size-8 rounded-md bg-neutral-100 object-cover">
              <span class="flex-1 truncate font-medium">{{ p.name }}</span>
              <span class="truncate text-xs text-neutral-500">{{ p.tagline }}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Comparison table or empty state -->
    <section class="mt-10">
      <ProductComparisonTable
        v-if="(products?.length ?? 0) >= 2"
        :products="products || []"
        @remove="removeProduct"
      />

      <div v-else-if="(products?.length ?? 0) === 1" class="mx-auto max-w-xl rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
        <UIcon name="i-lucide-scale" class="mx-auto size-8 text-neutral-400" />
        <p class="mt-4 text-neutral-500">하나 더 골라주세요. 최소 2개부터 비교할 수 있어요.</p>
      </div>

      <div v-else class="mx-auto max-w-xl rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
        <UIcon name="i-lucide-scale" class="mx-auto size-8 text-neutral-400" />
        <p class="mt-4 text-neutral-500">
          비교하고 싶은 프로덕트를 위 검색창에서 골라주세요.
        </p>
        <UButton to="/" color="neutral" variant="outline" class="mt-6">
          둘러보러 가기
        </UButton>
      </div>
    </section>

    <!-- Share hint -->
    <p v-if="selectedIds.length >= 2" class="mx-auto mt-10 max-w-2xl text-center text-xs text-neutral-500">
      💡 지금 URL을 공유하면 상대방도 같은 비교 화면을 볼 수 있어요.
    </p>
  </div>
</template>
