<script setup lang="ts">
import type { MonthlyRevenueRange, MonthlyUsersRange, ProductShowroom } from '~/types/product'

const props = defineProps<{
  showroom: ProductShowroom
  maker?: string
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

type Stat = { label: string, value: string, sub?: string }
const stats = computed<Stat[]>(() => {
  const s = props.showroom
  const items: Stat[] = []
  if (s.monthlyUsersRange) items.push({ label: 'Monthly Users', value: monthlyUsersLabel[s.monthlyUsersRange], sub: 'MAU 기준' })
  if (s.monthlyRevenueRange) items.push({ label: 'Revenue', value: monthlyRevenueLabel[s.monthlyRevenueRange] })
  if (s.teamSize) items.push({ label: 'Team', value: `${s.teamSize}명` })
  if (s.foundedAt) items.push({ label: 'Founded', value: s.foundedAt })
  if (s.location) items.push({ label: 'Location', value: s.location })
  return items
})
</script>

<template>
  <div>
    <div
      v-if="showroom.investorPitch"
      class="rounded-2xl border-l-[3px] border-[var(--color-amu-pink)] bg-neutral-100 px-8 py-7 dark:bg-neutral-900"
    >
      <p class="text-lg font-bold leading-snug tracking-tight sm:text-[18px]">
        {{ showroom.investorPitch }}
      </p>
      <p v-if="maker" class="mt-2.5 text-xs text-neutral-500">
        by {{ maker }}
      </p>
    </div>

    <div
      v-if="stats.length"
      class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="s in stats"
        :key="s.label"
        class="rounded-2xl bg-neutral-100 px-6 py-5 dark:bg-neutral-900"
      >
        <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          {{ s.label }}
        </div>
        <div class="mt-1.5 text-xl font-extrabold leading-tight tracking-tight">
          {{ s.value }}
        </div>
        <div v-if="s.sub" class="mt-1 text-xs text-neutral-500">
          {{ s.sub }}
        </div>
      </div>
    </div>
  </div>
</template>
