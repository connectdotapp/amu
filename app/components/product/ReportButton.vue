<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

const props = defineProps<{
  targetType: 'product' | 'comment'
  targetId: string
  targetLabel?: string  // 예: 프로덕트 이름 또는 댓글 id
}>()

const user = useCurrentUser()
const db = useFirestore()
const toast = useToast()

const open = ref(false)
const submitting = ref(false)
const reason = ref<string>('')
const detail = ref('')

const reasons = [
  { value: 'spam', label: '스팸·광고' },
  { value: 'inappropriate', label: '부적절한 콘텐츠' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'misleading', label: '정보 오류·허위' },
  { value: 'other', label: '기타' }
]

async function submit() {
  if (!user.value) {
    toast.add({ title: '로그인 후 신고할 수 있어요', color: 'warning' })
    return
  }
  if (!reason.value) {
    toast.add({ title: '사유를 선택해주세요', color: 'warning' })
    return
  }

  submitting.value = true
  try {
    await addDoc(collection(db, 'reports'), {
      targetType: props.targetType,
      targetId: props.targetId,
      targetLabel: props.targetLabel ?? '',
      reason: reason.value,
      detail: detail.value.trim(),
      reporterId: user.value.uid,
      reporterEmail: user.value.email ?? '',
      status: 'pending',
      createdAt: serverTimestamp()
    })
    toast.add({ title: '신고가 접수됐어요', description: '검토 후 조치할게요', color: 'success' })
    open.value = false
    reason.value = ''
    detail.value = ''
  } catch (e: any) {
    toast.add({ title: '신고 실패', description: e?.message, color: 'error' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 text-xs text-neutral-500 transition hover:text-neutral-950 dark:hover:text-neutral-50"
      @click="open = true"
    >
      <UIcon name="i-lucide-flag" class="size-3.5" />
      신고
    </button>

    <!-- Modal -->
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-4"
      @click.self="open = false"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-6 dark:bg-neutral-900">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold tracking-tight">신고하기</h3>
          <button
            type="button"
            class="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="닫기"
            @click="open = false"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <p class="mt-2 text-sm text-neutral-500">
          <span v-if="targetType === 'product'">이 프로덕트의</span>
          <span v-else>이 댓글의</span>
          어떤 점이 문제인가요?
        </p>

        <div class="mt-5 space-y-2">
          <label
            v-for="r in reasons"
            :key="r.value"
            class="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 p-3 text-sm transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            :class="reason === r.value && 'border-neutral-950 bg-neutral-100 dark:border-neutral-50 dark:bg-neutral-800'"
          >
            <input
              v-model="reason"
              type="radio"
              :value="r.value"
              class="size-4 accent-neutral-950 dark:accent-neutral-50"
            >
            {{ r.label }}
          </label>
        </div>

        <div class="mt-4">
          <label class="mb-1.5 block text-xs font-semibold text-neutral-500">
            상세 설명 (선택)
          </label>
          <textarea
            v-model="detail"
            rows="3"
            maxlength="500"
            placeholder="구체적으로 알려주시면 검토에 도움이 돼요"
            class="w-full resize-none rounded-2xl bg-neutral-100 p-3 text-sm outline-none dark:bg-neutral-800"
          />
        </div>

        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-full px-5 py-2.5 text-sm font-semibold text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            @click="open = false"
          >
            취소
          </button>
          <button
            type="button"
            :disabled="submitting || !reason"
            class="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950"
            @click="submit"
          >
            {{ submitting ? '전송 중...' : '신고 보내기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
