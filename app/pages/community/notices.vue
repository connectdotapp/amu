<script setup lang="ts">
useSeoMeta({
  title: '공지사항',
  description: 'AMU 운영 공지사항'
})

// 추후 Firestore `notices` 컬렉션으로 마이그레이션 가능. 지금은 하드코딩 샘플 유지.
type Notice = {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
}

const notices = ref<Notice[]>([
  {
    id: '2026-10-07-launch',
    title: 'AMU 베타 오픈 안내',
    body: '아무거나 먹지 않는 새, 아무가 큐레이션하는 앱·웹·프로그램 발견 공간 AMU가 베타 오픈했어요. 매주 새로운 컬렉션과 신상 앱 소개를 업데이트할 예정이에요. 피드백은 언제든 환영이에요.',
    date: '2026.10.07',
    pinned: true
  }
])
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-14">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Community</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">공지사항</h1>
      </div>
    </div>

    <section v-if="notices.length" class="mt-10 space-y-4">
      <article
        v-for="n in notices"
        :key="n.id"
        class="rounded-3xl border border-neutral-150 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-center gap-2 text-xs text-neutral-500">
          <span v-if="n.pinned" class="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600 dark:bg-red-950/40">
            고정
          </span>
          <time>{{ n.date }}</time>
        </div>
        <h2 class="mt-2 text-lg font-bold tracking-tight">{{ n.title }}</h2>
        <p class="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          {{ n.body }}
        </p>
      </article>
    </section>

    <div v-else class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-megaphone" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 공지사항이 없어요</p>
    </div>
  </div>
</template>
