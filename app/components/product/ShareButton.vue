<script setup lang="ts">
const props = defineProps<{
  url: string
  title?: string
  text?: string
}>()

const toast = useToast()
const open = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

const canNativeShare = computed(() => {
  if (!import.meta.client) return false
  return typeof navigator !== 'undefined' && !!navigator.share
})

const absoluteUrl = computed(() => {
  if (!import.meta.client) return props.url
  try {
    return new URL(props.url, location.origin).href
  } catch {
    return props.url
  }
})

async function nativeShare() {
  try {
    await navigator.share({
      url: absoluteUrl.value,
      title: props.title,
      text: props.text
    })
  } catch {
    // 유저가 취소했거나 공유 실패. 조용히 넘김.
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(absoluteUrl.value)
    toast.add({ title: '링크 복사됨', color: 'success' })
  } catch {
    toast.add({ title: '복사 실패', description: '브라우저가 지원하지 않아요', color: 'error' })
  }
  open.value = false
}

function shareX() {
  const text = props.text || props.title || ''
  const u = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(absoluteUrl.value)}`
  window.open(u, '_blank', 'noopener,width=640,height=520')
  open.value = false
}

function shareKakao() {
  // 카카오톡 공식 공유는 JSDK 가 필요해 비용 큼. 임시로 공유 URL 복사 → 수동 붙여넣기 안내.
  copyLink()
  toast.add({
    title: '링크를 복사했어요',
    description: '카카오톡에 붙여넣어 공유해주세요',
    color: 'info'
  })
}

function handleClick() {
  if (canNativeShare.value) {
    nativeShare()
  } else {
    open.value = !open.value
  }
}

function handleOutside(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (panelRef.value?.contains(target)) return
  if (btnRef.value?.contains(target)) return
  open.value = false
}

onMounted(() => document.addEventListener('mousedown', handleOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleOutside))
</script>

<template>
  <div class="relative inline-flex">
    <button
      ref="btnRef"
      type="button"
      class="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-700"
      aria-label="공유"
      @click="handleClick"
    >
      <UIcon name="i-lucide-share-2" class="size-4" />
      공유
    </button>

    <div
      v-if="open"
      ref="panelRef"
      class="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
    >
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @click="shareKakao"
      >
        <UIcon name="i-lucide-message-circle" class="size-4" />
        카카오톡 (링크 복사)
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @click="shareX"
      >
        <UIcon name="i-lucide-twitter" class="size-4" />
        X (Twitter)
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @click="copyLink"
      >
        <UIcon name="i-lucide-link" class="size-4" />
        링크 복사
      </button>
    </div>
  </div>
</template>
