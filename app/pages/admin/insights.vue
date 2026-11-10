<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '인사이트',
  robots: 'noindex, nofollow'
})

type Insights = {
  days: number
  site: {
    products: { published: number, pending: number, newInRange: number, userSubmittedPending: number }
    users: number | null
    upvotes: number
    bookmarks: number
    comments: number
    byCategory: Array<{ category: string, count: number }>
    topUpvoted: Array<{ id: string, slug?: string, name: string, upvotes: number, bookmarks: number }>
  }
  ga: {
    configured: boolean
    reason?: 'property' | 'permission' | 'api' | 'error'
    message?: string
    serviceAccount?: string
    totals?: { activeUsers: number, newUsers: number, sessions: number, pageViews: number, prev: { activeUsers: number, sessions: number, pageViews: number } }
    daily?: Array<{ date: string, activeUsers: number, sessions: number, pageViews: number }>
    channels?: Array<{ name: string, sessions: number, activeUsers: number }>
    sources?: Array<{ name: string, sessions: number }>
    pages?: Array<{ path: string, pageViews: number, activeUsers: number }>
    events?: Record<string, number>
  }
}

const user = useCurrentUser()
const { data: categories } = useCategories()
const days = ref(28)
const data = ref<Insights | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  if (!user.value) return
  loading.value = true
  error.value = null
  try {
    const token = await user.value.getIdToken()
    data.value = await $fetch<Insights>('/api/admin/insights', {
      query: { days: days.value },
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || '불러오지 못했어요'
  } finally {
    loading.value = false
  }
}
watch([user, days], load, { immediate: true })

const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('ko-KR')
function delta(cur: number, prev: number) {
  if (!prev) return null
  return Math.round(((cur - prev) / prev) * 100)
}
const categoryName = (slug: string) => categories.value?.find(c => c.id === slug)?.name || slug

const channelLabel: Record<string, string> = {
  'Direct': '직접 방문',
  'Organic Search': '검색 (자연)',
  'Organic Social': 'SNS',
  'Referral': '다른 사이트',
  'Paid Search': '검색 광고',
  'Paid Social': 'SNS 광고',
  'Email': '이메일',
  'Unassigned': '분류 안 됨',
  '(other)': '기타'
}

// 일별 방문자 막대 (단일 계열이라 범례 없이 제목이 이름 역할)
const daily = computed(() => data.value?.ga.daily || [])
const dailyMax = computed(() => Math.max(1, ...daily.value.map(d => d.activeUsers)))
const hovered = ref<number | null>(null)
const dateLabel = (d: string) => `${Number(d.slice(4, 6))}/${Number(d.slice(6, 8))}`

const kpis = computed(() => {
  const t = data.value?.ga.totals
  if (!t) return []
  return [
    { label: '방문자', value: t.activeUsers, delta: delta(t.activeUsers, t.prev.activeUsers) },
    { label: '신규 방문자', value: t.newUsers, delta: null },
    { label: '방문 횟수', value: t.sessions, delta: delta(t.sessions, t.prev.sessions) },
    { label: '페이지뷰', value: t.pageViews, delta: delta(t.pageViews, t.prev.pageViews) }
  ]
})

const eventLabels: Array<[string, string]> = [
  ['product_view', '프로덕트 상세 조회'],
  ['external_link_click', '바로가기 클릭'],
  ['product_upvote', '업보트'],
  ['product_bookmark', '북마크'],
  ['search', '검색'],
  ['product_submit', '등록 제출']
]

function barWidth(v: number, list: Array<{ [k: string]: any }>, key: string) {
  const max = Math.max(1, ...list.map(x => x[key] as number))
  return `${Math.max(2, (v / max) * 100)}%`
}
</script>

<template>
  <div class="mx-auto max-w-[1100px] px-6 py-10">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      관리자
    </NuxtLink>

    <header class="mt-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">인사이트</h1>
        <p class="mt-2 text-sm text-neutral-500">방문·유입은 GA4(쿠키 동의한 방문자 기준), 나머지는 사이트 데이터예요.</p>
      </div>
      <div class="inline-flex rounded-full bg-neutral-100 p-1 text-sm font-semibold dark:bg-neutral-800">
        <button
          v-for="d in [7, 28, 90]"
          :key="d"
          type="button"
          class="rounded-full px-4 py-1.5 transition"
          :class="days === d ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
          @click="days = d"
        >
          {{ d }}일
        </button>
      </div>
    </header>

    <p v-if="error" class="mt-8 rounded-2xl bg-error/10 p-4 text-sm text-error">{{ error }}</p>
    <p v-else-if="loading && !data" class="mt-8 text-sm text-neutral-500">불러오는 중…</p>

    <template v-if="data">
      <!-- ── 방문·유입 (GA4) ── -->
      <section class="mt-10">
        <h2 class="text-lg font-bold tracking-tight">방문·유입 <span class="text-sm font-normal text-neutral-400">최근 {{ data.days }}일</span></h2>

        <!-- GA4 미연결 안내 -->
        <div v-if="!data.ga.configured" class="mt-4 rounded-3xl border border-neutral-200 p-6 text-sm leading-relaxed dark:border-neutral-700">
          <p class="font-semibold">GA4 연결이 필요해요</p>
          <ol class="mt-3 list-decimal space-y-1.5 pl-5 text-neutral-600 dark:text-neutral-300">
            <li :class="data.ga.reason === 'property' ? 'font-semibold text-neutral-950 dark:text-white' : ''">
              GA4 관리 → 속성 설정에서 <b>속성 ID</b>(숫자)를 확인해 <code>.env</code> 의 <code>GA4_PROPERTY_ID</code> 에 넣고 다시 배포
            </li>
            <li :class="data.ga.reason === 'api' ? 'font-semibold text-neutral-950 dark:text-white' : ''">
              Google Cloud 콘솔에서 <b>Google Analytics Data API</b> 사용 설정
            </li>
            <li :class="data.ga.reason === 'permission' ? 'font-semibold text-neutral-950 dark:text-white' : ''">
              GA4 관리 → 속성 액세스 관리에서 아래 서버 계정을 <b>뷰어</b>로 추가
              <div v-if="data.ga.serviceAccount" class="mt-1 select-all rounded-lg bg-neutral-100 px-3 py-2 font-mono text-xs dark:bg-neutral-800">{{ data.ga.serviceAccount }}</div>
            </li>
          </ol>
          <p v-if="data.ga.message" class="mt-3 text-xs text-neutral-400">오류: {{ data.ga.message }}</p>
        </div>

        <template v-else>
          <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div v-for="k in kpis" :key="k.label" class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
              <div class="text-xs text-neutral-500">{{ k.label }}</div>
              <div class="mt-2 text-3xl font-bold tabular-nums tracking-tight">{{ fmt(k.value) }}</div>
              <div v-if="k.delta !== null" class="mt-1 text-xs tabular-nums text-neutral-500">
                이전 {{ data.days }}일 대비 {{ k.delta > 0 ? '+' : '' }}{{ k.delta }}%
              </div>
            </div>
          </div>

          <!-- 일별 방문자 -->
          <div class="mt-6 rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="flex items-baseline justify-between">
              <div class="text-sm font-semibold">일별 방문자</div>
              <div class="text-xs tabular-nums text-neutral-500">
                <template v-if="hovered !== null && daily[hovered]">
                  {{ dateLabel(daily[hovered]!.date) }} · 방문자 {{ fmt(daily[hovered]!.activeUsers) }} · 페이지뷰 {{ fmt(daily[hovered]!.pageViews) }}
                </template>
                <template v-else>최대 {{ fmt(dailyMax) }}명</template>
              </div>
            </div>
            <div class="mt-4 flex h-40 items-end gap-[2px]" @mouseleave="hovered = null">
              <div
                v-for="(d, i) in daily"
                :key="d.date"
                class="flex h-full flex-1 cursor-default items-end"
                @mouseenter="hovered = i"
              >
                <div
                  class="w-full rounded-t-[4px] transition-colors"
                  :class="hovered === i ? 'bg-neutral-950 dark:bg-white' : 'bg-neutral-400 dark:bg-neutral-500'"
                  :style="{ height: `${Math.max(2, (d.activeUsers / dailyMax) * 100)}%` }"
                />
              </div>
            </div>
            <div v-if="daily.length" class="mt-2 flex justify-between text-[11px] tabular-nums text-neutral-400">
              <span>{{ dateLabel(daily[0]!.date) }}</span>
              <span>{{ dateLabel(daily[daily.length - 1]!.date) }}</span>
            </div>
          </div>

          <!-- 유입 경로 / 소스 / 인기 페이지 -->
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
              <div class="text-sm font-semibold">유입 경로</div>
              <ul class="mt-3 space-y-2.5">
                <li v-for="c in data.ga.channels" :key="c.name" class="text-sm">
                  <div class="flex justify-between gap-2"><span class="truncate">{{ channelLabel[c.name] || c.name }}</span><span class="tabular-nums text-neutral-500">{{ fmt(c.sessions) }}</span></div>
                  <div class="mt-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700"><div class="h-full rounded-full bg-neutral-950 dark:bg-white" :style="{ width: barWidth(c.sessions, data.ga.channels!, 'sessions') }" /></div>
                </li>
                <li v-if="!data.ga.channels?.length" class="text-sm text-neutral-400">아직 데이터가 없어요</li>
              </ul>
            </div>
            <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
              <div class="text-sm font-semibold">유입 사이트</div>
              <ul class="mt-3 space-y-2.5">
                <li v-for="s in data.ga.sources" :key="s.name" class="text-sm">
                  <div class="flex justify-between gap-2"><span class="truncate">{{ s.name === '(direct)' ? '직접 방문' : s.name }}</span><span class="tabular-nums text-neutral-500">{{ fmt(s.sessions) }}</span></div>
                  <div class="mt-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700"><div class="h-full rounded-full bg-neutral-950 dark:bg-white" :style="{ width: barWidth(s.sessions, data.ga.sources!, 'sessions') }" /></div>
                </li>
                <li v-if="!data.ga.sources?.length" class="text-sm text-neutral-400">아직 데이터가 없어요</li>
              </ul>
            </div>
            <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
              <div class="text-sm font-semibold">많이 본 페이지</div>
              <ul class="mt-3 space-y-2">
                <li v-for="p in data.ga.pages" :key="p.path" class="flex justify-between gap-2 text-sm">
                  <NuxtLink :to="p.path" class="truncate hover:underline">{{ p.path }}</NuxtLink>
                  <span class="shrink-0 tabular-nums text-neutral-500">{{ fmt(p.pageViews) }}</span>
                </li>
                <li v-if="!data.ga.pages?.length" class="text-sm text-neutral-400">아직 데이터가 없어요</li>
              </ul>
            </div>
          </div>

          <!-- 행동 -->
          <div class="mt-6 rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-sm font-semibold">방문자 행동</div>
            <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div v-for="[key, label] in eventLabels" :key="key">
                <div class="text-xs text-neutral-500">{{ label }}</div>
                <div class="mt-1 text-xl font-bold tabular-nums">{{ fmt(data.ga.events?.[key]) }}</div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ── 사이트 데이터 ── -->
      <section class="mt-12">
        <h2 class="text-lg font-bold tracking-tight">사이트 데이터</h2>
        <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-xs text-neutral-500">공개 프로덕트</div>
            <div class="mt-2 text-3xl font-bold tabular-nums">{{ fmt(data.site.products.published) }}</div>
            <div class="mt-1 text-xs text-neutral-500">최근 {{ data.days }}일 +{{ fmt(data.site.products.newInRange) }}</div>
          </div>
          <NuxtLink to="/admin/queue" class="rounded-3xl bg-neutral-100 p-5 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700">
            <div class="text-xs text-neutral-500">승인 대기</div>
            <div class="mt-2 text-3xl font-bold tabular-nums">{{ fmt(data.site.products.pending) }}</div>
            <div class="mt-1 text-xs text-neutral-500">검토하러 가기 →</div>
          </NuxtLink>
          <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-xs text-neutral-500">가입자</div>
            <div class="mt-2 text-3xl font-bold tabular-nums">{{ data.site.users === null ? '-' : fmt(data.site.users) }}</div>
          </div>
          <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-xs text-neutral-500">업보트 · 북마크 · 댓글</div>
            <div class="mt-2 text-3xl font-bold tabular-nums">{{ fmt(data.site.upvotes) }}</div>
            <div class="mt-1 text-xs tabular-nums text-neutral-500">북마크 {{ fmt(data.site.bookmarks) }} · 댓글 {{ fmt(data.site.comments) }}</div>
          </div>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-sm font-semibold">업보트 많은 프로덕트</div>
            <ol class="mt-3 space-y-2">
              <li v-for="(p, i) in data.site.topUpvoted" :key="p.id" class="flex items-center gap-3 text-sm">
                <span class="w-4 tabular-nums text-neutral-400">{{ i + 1 }}</span>
                <NuxtLink :to="`/products/${p.slug || p.id}`" class="min-w-0 flex-1 truncate hover:underline">{{ p.name }}</NuxtLink>
                <span class="tabular-nums text-neutral-500">↑ {{ fmt(p.upvotes) }}</span>
              </li>
            </ol>
          </div>
          <div class="rounded-3xl bg-neutral-100 p-5 dark:bg-neutral-800">
            <div class="text-sm font-semibold">카테고리별 프로덕트</div>
            <ul class="mt-3 space-y-2.5">
              <li v-for="c in data.site.byCategory" :key="c.category" class="text-sm">
                <div class="flex justify-between gap-2"><span>{{ categoryName(c.category) }}</span><span class="tabular-nums text-neutral-500">{{ c.count }}</span></div>
                <div class="mt-1 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700"><div class="h-full rounded-full bg-neutral-950 dark:bg-white" :style="{ width: barWidth(c.count, data.site.byCategory, 'count') }" /></div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
