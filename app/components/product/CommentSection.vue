<script setup lang="ts">
import type { Timestamp } from 'firebase/firestore'

const props = defineProps<{
  productId: string
}>()

const user = useCurrentUser()
const { comments, submitting, add } = useComments(props.productId)

const body = ref('')

async function submit() {
  if (!body.value.trim()) return
  await add(body.value)
  body.value = ''
}

function formatDate(ts?: Timestamp) {
  if (!ts) return ''
  const d = ts.toDate()
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}시간 전`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}일 전`
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <section class="rounded-3xl bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-800">
    <h2 class="text-sm font-semibold text-neutral-500">
      댓글 {{ comments.length }}
    </h2>

    <!-- Compose -->
    <div v-if="user" class="mt-4 flex gap-3">
      <div class="size-9 shrink-0 overflow-hidden rounded-full bg-neutral-150 dark:bg-neutral-700">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          class="size-full object-cover"
          referrerpolicy="no-referrer"
        >
      </div>
      <div class="flex-1">
        <textarea
          v-model="body"
          rows="2"
          placeholder="아무의 관점을 남겨보세요"
          class="w-full resize-none rounded-2xl bg-white p-3 text-sm outline-none dark:bg-neutral-900"
        />
        <div class="mt-2 flex justify-end">
          <UButton
            size="sm"
            color="neutral"
            variant="solid"
            :loading="submitting"
            :disabled="!body.trim()"
            @click="submit"
          >
            등록
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 text-sm dark:bg-neutral-900">
      <span class="text-neutral-500">댓글을 남기려면 로그인 필요</span>
      <UButton to="/login" size="xs" color="neutral" variant="solid">로그인</UButton>
    </div>

    <!-- List -->
    <ul v-if="comments.length" class="mt-6 space-y-4">
      <li v-for="c in comments" :key="c.id" class="flex gap-3">
        <div class="size-9 shrink-0 overflow-hidden rounded-full bg-neutral-150 dark:bg-neutral-700">
          <img
            v-if="c.authorPhotoURL"
            :src="c.authorPhotoURL"
            :alt="c.authorName"
            class="size-full object-cover"
            referrerpolicy="no-referrer"
          >
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 text-xs">
            <span class="font-semibold">{{ c.authorName }}</span>
            <span class="text-neutral-400">·</span>
            <span class="text-neutral-400">{{ formatDate(c.createdAt) }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm">{{ c.body }}</p>
        </div>
      </li>
    </ul>

    <p v-else class="mt-6 text-sm text-neutral-500">
      가장 먼저 이야기해 보세요.
    </p>
  </section>
</template>
