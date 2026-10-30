<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { MagazinePost, MagazineStatus } from '~/types/magazine'

definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '글 수정',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const id = String(route.params.id)
const db = useFirestore()
const toast = useToast()

// 초안은 관리자만 읽을 수 있어서 서버 렌더(비로그인)가 아닌 클라이언트에서 불러옴.
const { data: post, pending } = useAsyncData<MagazinePost | null>(
  `magazine:admin:${id}`,
  async () => {
    try {
      const snap = await getDoc(doc(db, 'magazine', id))
      return snap.exists() ? ({ id: snap.id, ...snap.data() } as MagazinePost) : null
    } catch (e) {
      console.warn('[magazine edit] fetch failed:', e)
      return null
    }
  },
  { default: () => null, server: false }
)

function onSaved(postId: string, status: MagazineStatus) {
  toast.add({ title: status === 'published' ? '사이트에 반영됐어요' : '초안으로 저장됐어요', color: 'success' })
  if (status === 'published') navigateTo(`/magazine/${postId}`)
  else refreshNuxtData(`magazine:admin:${id}`)
}

function onDeleted() {
  toast.add({ title: '삭제됐어요', color: 'neutral' })
  navigateTo('/admin/magazine')
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-5 py-10 md:px-6">
    <NuxtLink
      to="/admin/magazine"
      class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      매거진 관리
    </NuxtLink>

    <div class="mt-6 flex items-end justify-between gap-4">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        글 수정
      </h1>
      <UButton
        v-if="post?.status === 'published'"
        :to="`/magazine/${post.slug}`"
        target="_blank"
        color="neutral"
        variant="ghost"
        icon="i-lucide-external-link"
      >
        사이트에서 보기
      </UButton>
    </div>

    <div
      v-if="pending"
      class="mt-10 py-10 text-center text-sm text-neutral-400"
    >
      불러오는 중…
    </div>

    <div
      v-else-if="post"
      class="mt-8 rounded-3xl bg-neutral-150 p-5 sm:p-8 dark:bg-neutral-800"
    >
      <MagazineForm
        :key="post.id + String((post.updatedAt as any)?.toMillis?.() ?? '')"
        :post="post"
        @saved="onSaved"
        @deleted="onDeleted"
      />
    </div>

    <div
      v-else
      class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800"
    >
      <p class="text-neutral-500">
        글을 찾을 수 없어요.
      </p>
    </div>
  </div>
</template>
