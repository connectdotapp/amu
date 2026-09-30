<script setup lang="ts">
import type { MonthlyRevenueRange, MonthlyUsersRange, ProductShowroom } from '~/types/product'

const props = defineProps<{
  showroom: ProductShowroom
}>()

const monthlyUsersLabel: Record<MonthlyUsersRange, string> = {
  '~100': '100명 미만',
  '100~1K': '100~1,000명',
  '1K~10K': '1,000~10,000명',
  '10K~100K': '1만~10만명',
  '100K~1M': '10만~100만명',
  '1M+': '100만명 이상'
}

const monthlyRevenueLabel: Record<MonthlyRevenueRange, string> = {
  '없음': '아직 없음',
  '~100만': '월 100만원 미만',
  '100~500만': '월 100~500만원',
  '500만~1천만': '월 500~1,000만원',
  '1천~5천만': '월 1,000~5,000만원',
  '5천만~1억': '월 5,000만~1억원',
  '1억+': '월 1억원 이상'
}

const hasAny = computed(() => {
  const s = props.showroom
  return !!(
    s.investorPitch
    || s.monthlyUsersRange
    || s.monthlyRevenueRange
    || s.teamSize
    || s.foundedAt
    || s.location
  )
})

const stats = computed(() => {
  const s = props.showroom
  const items: Array<{ label: string, value: string }> = []
  if (s.monthlyUsersRange) items.push({ label: '월간 사용자', value: monthlyUsersLabel[s.monthlyUsersRange] })
  if (s.monthlyRevenueRange) items.push({ label: '월 매출', value: monthlyRevenueLabel[s.monthlyRevenueRange] })
  if (s.teamSize) items.push({ label: '팀 규모', value: `${s.teamSize}명` })
  if (s.foundedAt) items.push({ label: '시작', value: s.foundedAt })
  if (s.location) items.push({ label: '위치', value: s.location })
  return items
})
</script>

<template>
  <section v-if="hasAny" class="rounded-3xl bg-neutral-150 p-8 dark:bg-neutral-800">
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-neutral-500">쇼룸</h2>
      <span class="text-xs text-neutral-400">메이커 제공 정보</span>
    </div>

    <p
      v-if="showroom.investorPitch"
      class="mt-4 border-l-[3px] border-[var(--color-amu-pink)] pl-4 text-lg font-semibold tracking-tight sm:text-xl"
    >
      {{ showroom.investorPitch }}
    </p>

    <dl
      v-if="stats.length"
      class="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div v-for="s in stats" :key="s.label">
        <dt class="text-xs text-neutral-500">{{ s.label }}</dt>
        <dd class="mt-1 text-base font-semibold tracking-tight">{{ s.value }}</dd>
      </div>
    </dl>
  </section>
</template>
