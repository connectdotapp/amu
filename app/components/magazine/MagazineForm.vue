<script setup lang="ts">
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { MagazinePost, MagazineStatus } from '~/types/magazine'

const props = defineProps<{
  post?: MagazinePost
}>()

const emit = defineEmits<{
  saved: [postId: string, status: MagazineStatus]
  deleted: []
}>()

const isEdit = computed(() => !!props.post)
const db = useFirestore()
const { uploadImage } = useMagazineUpload()

const categoryPresets = ['가이드', '메이커 인터뷰', '큐레이션 비교', '큐레이터 노트', '디자인', '창업']

const form = reactive({
  title: props.post?.title ?? '',
  slug: props.post?.slug ?? '',
  subtitle: props.post?.subtitle ?? '',
  category: props.post?.category ?? '가이드',
  authorName: props.post?.authorName ?? '조은솔',
  body: props.post?.body ?? ''
})

const coverUrl = ref<string | null>(props.post?.coverImageUrl ?? null)
const tab = ref<'write' | 'preview'>('write')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const busy = ref<'cover' | 'image' | 'save' | 'delete' | null>(null)
const errorMessage = ref<string | null>(null)

const readMinutes = computed(() => estimateReadMinutes(form.body))

// 한글 제목은 그대로 쓰면 URL 이 길게 인코딩되므로 영문 슬러그를 권장.
function slugify(v: string) {
  return v.toLowerCase().trim()
    .replace(/[^\w\s\-가-힣]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

const slugValid = computed(() => /^[a-z0-9가-힣]+(?:-[a-z0-9가-힣]+)*$/.test(form.slug))

async function onCoverPick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  busy.value = 'cover'
  errorMessage.value = null
  try {
    coverUrl.value = await uploadImage(file)
  } catch (err: any) {
    errorMessage.value = `표지 업로드 실패: ${err?.message ?? err}`
  } finally {
    busy.value = null
  }
}

// 커서 위치에 텍스트 삽입. 선택된 글자가 있으면 before/after 로 감쌈.
function wrap(before: string, after = '', placeholder = '') {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = form.body.slice(start, end) || placeholder
  form.body = form.body.slice(0, start) + before + selected + after + form.body.slice(end)
  nextTick(() => {
    el.focus()
    const cursor = start + before.length
    el.setSelectionRange(cursor, cursor + selected.length)
  })
}

// 줄 맨 앞에 접두어 (제목·인용·목록).
function linePrefix(prefix: string) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const lineStart = form.body.lastIndexOf('\n', start - 1) + 1
  form.body = form.body.slice(0, lineStart) + prefix + form.body.slice(lineStart)
  nextTick(() => {
    el.focus()
    el.setSelectionRange(start + prefix.length, start + prefix.length)
  })
}

async function onBodyImagePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  busy.value = 'image'
  errorMessage.value = null
  try {
    const url = await uploadImage(file)
    wrap(`\n![`, `](${url})\n`, '이미지 설명')
  } catch (err: any) {
    errorMessage.value = `이미지 업로드 실패: ${err?.message ?? err}`
  } finally {
    busy.value = null
  }
}

async function save(status: MagazineStatus) {
  errorMessage.value = null
  if (!form.title.trim() || !form.body.trim()) {
    errorMessage.value = '제목과 본문은 꼭 써주세요.'
    return
  }
  if (!isEdit.value && !slugValid.value) {
    errorMessage.value = '주소(슬러그)는 영문 소문자·숫자·하이픈으로 써주세요. 예: app-icon-36px'
    return
  }
  busy.value = 'save'
  try {
    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category.trim() || '가이드',
      authorName: form.authorName.trim() || '조은솔',
      body: form.body,
      coverImageUrl: coverUrl.value,
      status,
      readMinutes: readMinutes.value,
      updatedAt: serverTimestamp()
    }

    if (isEdit.value && props.post) {
      const firstPublish = status === 'published' && props.post.status !== 'published'
      await updateDoc(doc(db, 'magazine', props.post.id), {
        ...payload,
        publishedAt: firstPublish ? serverTimestamp() : (props.post.publishedAt ?? null)
      })
      emit('saved', props.post.id, status)
    } else {
      const id = form.slug.trim()
      const ref = doc(db, 'magazine', id)
      if ((await getDoc(ref)).exists()) {
        errorMessage.value = '같은 주소의 글이 이미 있어요. 주소를 바꿔주세요.'
        return
      }
      await setDoc(ref, {
        ...payload,
        slug: id,
        createdAt: serverTimestamp(),
        publishedAt: status === 'published' ? serverTimestamp() : null
      })
      emit('saved', id, status)
    }
  } catch (err: any) {
    errorMessage.value = err?.message || '저장 중 오류가 발생했어요.'
    console.error('[MagazineForm] save failed:', err)
  } finally {
    busy.value = null
  }
}

async function remove() {
  if (!props.post) return
  if (!confirm(`"${props.post.title}" 글을 삭제할까요? 되돌릴 수 없어요.`)) return
  busy.value = 'delete'
  try {
    await deleteDoc(doc(db, 'magazine', props.post.id))
    emit('deleted')
  } catch (err: any) {
    errorMessage.value = err?.message || '삭제 중 오류가 발생했어요.'
  } finally {
    busy.value = null
  }
}

const toolbar = [
  { label: '제목', icon: 'i-lucide-heading-2', run: () => linePrefix('## ') },
  { label: '소제목', icon: 'i-lucide-heading-3', run: () => linePrefix('### ') },
  { label: '굵게', icon: 'i-lucide-bold', run: () => wrap('**', '**', '굵은 글씨') },
  { label: '강조', icon: 'i-lucide-highlighter', run: () => wrap('*', '*', '강조') },
  { label: '인용', icon: 'i-lucide-quote', run: () => linePrefix('> ') },
  { label: '목록', icon: 'i-lucide-list', run: () => linePrefix('- ') },
  { label: '번호', icon: 'i-lucide-list-ordered', run: () => linePrefix('1. ') },
  { label: '링크', icon: 'i-lucide-link', run: () => wrap('[', '](https://)', '링크 글자') },
  { label: '구분선', icon: 'i-lucide-minus', run: () => wrap('\n\n---\n\n') }
]
</script>

<template>
  <div class="space-y-6">
    <!-- 표지 -->
    <div>
      <label class="mb-1.5 block text-sm font-medium">표지 이미지</label>
      <div class="flex items-start gap-4">
        <div class="aspect-[16/10] w-44 shrink-0 overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <img
            v-if="coverUrl"
            :src="coverUrl"
            alt=""
            class="size-full object-cover"
          >
          <div
            v-else
            class="flex size-full items-center justify-center text-neutral-400"
          >
            <UIcon
              name="i-lucide-image"
              class="size-6"
            />
          </div>
        </div>
        <div class="flex flex-col items-start gap-2">
          <input
            id="mag-cover"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onCoverPick"
          >
          <UButton
            as="label"
            for="mag-cover"
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-upload"
            :loading="busy === 'cover'"
          >
            {{ coverUrl ? '표지 바꾸기' : '표지 올리기' }}
          </UButton>
          <UButton
            v-if="coverUrl"
            size="sm"
            color="neutral"
            variant="ghost"
            @click="coverUrl = null"
          >
            표지 빼기
          </UButton>
          <p class="text-xs text-neutral-500">
            16:10 비율 권장 · 5MB 이하
          </p>
        </div>
      </div>
    </div>

    <UFormField
      label="제목"
      required
    >
      <UInput
        v-model="form.title"
        size="lg"
        placeholder="예: 앱 아이콘 36px에서 살아남는 법"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="부제"
      help="카드와 글 상단에 보이는 한 줄 소개"
    >
      <UInput
        v-model="form.subtitle"
        placeholder="예: iOS 홈 화면 디자인 치트시트"
        class="w-full"
      />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField
        label="주소 (슬러그)"
        :required="!isEdit"
        :help="isEdit ? '발행된 주소는 바꿀 수 없어요' : 'amuhunter.com/magazine/이주소'"
      >
        <div class="flex gap-2">
          <UInput
            v-model="form.slug"
            :disabled="isEdit"
            placeholder="app-icon-36px"
            class="flex-1"
          />
          <UButton
            v-if="!isEdit"
            type="button"
            color="neutral"
            variant="outline"
            :disabled="!form.title.trim()"
            @click="form.slug = slugify(form.title)"
          >
            제목에서
          </UButton>
        </div>
      </UFormField>
      <UFormField label="카테고리">
        <UInput
          v-model="form.category"
          list="mag-categories"
          placeholder="가이드"
          class="w-full"
        />
        <datalist id="mag-categories">
          <option
            v-for="c in categoryPresets"
            :key="c"
            :value="c"
          />
        </datalist>
      </UFormField>
    </div>

    <UFormField label="글쓴이">
      <UInput
        v-model="form.authorName"
        placeholder="조은솔"
        class="w-full sm:w-1/2"
      />
    </UFormField>

    <!-- 본문 -->
    <div>
      <div class="mb-2 flex items-center justify-between">
        <label class="text-sm font-medium">본문 <span class="text-error">*</span></label>
        <div class="flex rounded-full bg-white p-0.5 text-xs font-bold dark:bg-neutral-900">
          <button
            type="button"
            class="rounded-full px-3 py-1.5"
            :class="tab === 'write' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500'"
            @click="tab = 'write'"
          >
            쓰기
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1.5"
            :class="tab === 'preview' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500'"
            @click="tab = 'preview'"
          >
            미리보기
          </button>
        </div>
      </div>

      <div
        v-show="tab === 'write'"
        class="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div class="no-scrollbar flex gap-0.5 overflow-x-auto border-b border-neutral-100 p-1.5 dark:border-neutral-800">
          <button
            v-for="t in toolbar"
            :key="t.label"
            type="button"
            :title="t.label"
            class="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            @click="t.run"
          >
            <UIcon
              :name="t.icon"
              class="size-4"
            />
            <span class="hidden sm:inline">{{ t.label }}</span>
          </button>
          <input
            id="mag-body-image"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onBodyImagePick"
          >
          <label
            for="mag-body-image"
            class="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <UIcon
              :name="busy === 'image' ? 'i-lucide-loader-circle' : 'i-lucide-image-plus'"
              class="size-4"
              :class="busy === 'image' && 'animate-spin'"
            />
            <span class="hidden sm:inline">사진</span>
          </label>
        </div>
        <textarea
          ref="textareaRef"
          v-model="form.body"
          rows="22"
          class="block w-full resize-y bg-transparent px-4 py-3 text-[15px] leading-relaxed outline-none"
          placeholder="여기에 글을 쓰세요.&#10;&#10;## 큰 제목&#10;### 작은 제목&#10;**굵게**  *강조*&#10;> 인용문&#10;- 목록"
        />
      </div>

      <div
        v-show="tab === 'preview'"
        class="rounded-2xl bg-white p-5 sm:p-8 dark:bg-neutral-950"
      >
        <MagazineBody
          v-if="form.body.trim()"
          :source="form.body"
        />
        <p
          v-else
          class="py-10 text-center text-sm text-neutral-400"
        >
          본문을 쓰면 여기서 미리 볼 수 있어요.
        </p>
      </div>

      <p class="mt-2 text-xs text-neutral-500">
        약 {{ readMinutes }}분 분량 · 툴바 버튼을 쓰거나 마크다운 기호를 직접 입력해도 돼요
      </p>
    </div>

    <div
      v-if="errorMessage"
      class="rounded-xl bg-error/10 p-3 text-sm text-error"
    >
      {{ errorMessage }}
    </div>

    <div class="flex flex-wrap items-center gap-2 pt-2">
      <UButton
        v-if="isEdit"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        :loading="busy === 'delete'"
        @click="remove"
      >
        삭제
      </UButton>
      <div class="ml-auto flex gap-2">
        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          :loading="busy === 'save'"
          @click="save('draft')"
        >
          {{ isEdit && post?.status === 'published' ? '비공개로 전환' : '초안 저장' }}
        </UButton>
        <UButton
          color="neutral"
          size="lg"
          icon="i-lucide-send"
          :loading="busy === 'save'"
          @click="save('published')"
        >
          {{ isEdit && post?.status === 'published' ? '수정 반영' : '발행하기' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
