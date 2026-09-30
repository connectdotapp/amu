<script setup lang="ts">
import { collection as fsCollection, doc, serverTimestamp, setDoc, updateDoc, increment } from 'firebase/firestore'
import type { Collection, CollectionStatus } from '~/types/collection'
import type { Product } from '~/types/product'

const props = defineProps<{
  collection?: Collection
  submitLabel?: string
}>()

const emit = defineEmits<{
  submitted: [collectionId: string]
}>()

const isEdit = computed(() => !!props.collection)

const { uploadCover } = useCollectionUpload()
const db = useFirestore()

// Pool of products to pick from (published only)
const { data: pool } = useAllPublishedProducts(200)

const form = reactive({
  title: props.collection?.title ?? '',
  slug: props.collection?.slug ?? '',
  description: props.collection?.description ?? '',
  curatorName: props.collection?.curatorName ?? '아무',
  status: (props.collection?.status ?? 'draft') as CollectionStatus,
  order: props.collection?.order ?? 0
})

const selectedIds = ref<string[]>([...(props.collection?.productIds ?? [])])
const coverFile = ref<File | null>(null)
const coverPreview = ref<string | null>(props.collection?.coverImageUrl ?? null)
const search = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

function slugify(v: string) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\-가-힣]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function generateSlugFromTitle() {
  if (!form.title.trim()) return
  form.slug = slugify(form.title)
}

const selectedProducts = computed<Product[]>(() => {
  const map = new Map((pool.value || []).map(p => [p.id, p]))
  return selectedIds.value
    .map(id => map.get(id))
    .filter((p): p is Product => !!p)
})

const searchResults = computed<Product[]>(() => {
  const q = search.value.toLowerCase().trim()
  const already = new Set(selectedIds.value)
  return (pool.value || [])
    .filter(p => !already.has(p.id))
    .filter(p => !q || p.name?.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q))
    .slice(0, 8)
})

function onCoverPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverFile.value = file
  coverPreview.value = URL.createObjectURL(file)
}

function addProduct(id: string) {
  if (selectedIds.value.includes(id)) return
  selectedIds.value.push(id)
  search.value = ''
}

function removeProduct(id: string) {
  selectedIds.value = selectedIds.value.filter(x => x !== id)
}

function moveUp(idx: number) {
  if (idx <= 0) return
  const arr = [...selectedIds.value]
  ;[arr[idx - 1], arr[idx]] = [arr[idx]!, arr[idx - 1]!]
  selectedIds.value = arr
}

function moveDown(idx: number) {
  if (idx >= selectedIds.value.length - 1) return
  const arr = [...selectedIds.value]
  ;[arr[idx], arr[idx + 1]] = [arr[idx + 1]!, arr[idx]!]
  selectedIds.value = arr
}

async function submit() {
  errorMessage.value = null
  if (!form.title.trim() || !form.slug.trim() || !form.description.trim()) {
    errorMessage.value = '제목, 슬러그, 설명은 필수예요.'
    return
  }
  if (selectedIds.value.length === 0) {
    errorMessage.value = '프로덕트를 최소 1개 이상 추가해 주세요.'
    return
  }
  isSubmitting.value = true
  try {
    const collectionId = isEdit.value ? props.collection!.id : form.slug.trim()

    let coverImageUrl = props.collection?.coverImageUrl ?? null
    if (coverFile.value) {
      coverImageUrl = await uploadCover(coverFile.value, collectionId)
    }

    const publishing = form.status === 'published'
    const wasPublished = props.collection?.status === 'published'

    if (isEdit.value && props.collection) {
      await updateDoc(doc(db, 'collections', props.collection.id), {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        curatorName: form.curatorName.trim() || '아무',
        status: form.status,
        order: Number(form.order) || 0,
        productIds: selectedIds.value,
        productCount: selectedIds.value.length,
        coverImageUrl,
        updatedAt: serverTimestamp(),
        publishedAt: publishing && !wasPublished ? serverTimestamp() : (props.collection.publishedAt ?? null)
      })
      emit('submitted', props.collection.id)
    } else {
      await setDoc(doc(db, 'collections', collectionId), {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        curatorName: form.curatorName.trim() || '아무',
        status: form.status,
        order: Number(form.order) || 0,
        productIds: selectedIds.value,
        productCount: selectedIds.value.length,
        coverImageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: publishing ? serverTimestamp() : null
      })
      emit('submitted', collectionId)
    }
  } catch (e: any) {
    errorMessage.value = e?.message || '저장 중 오류가 발생했어요.'
    console.error('[CollectionForm] submit failed:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <!-- Cover image -->
    <div>
      <label class="mb-1.5 block text-sm font-medium">
        커버 이미지 <span class="text-neutral-400 text-xs">(선택, 카드에 노출)</span>
      </label>
      <div class="flex items-start gap-4">
        <div class="aspect-[16/9] w-40 shrink-0 overflow-hidden rounded-lg border border-dashed border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <img v-if="coverPreview" :src="coverPreview" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-neutral-400">
            <UIcon name="i-lucide-image" class="size-6" />
          </div>
        </div>
        <div class="flex-1">
          <input
            id="cover-input"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onCoverPick"
          >
          <UButton as="label" for="cover-input" size="sm" color="neutral" variant="outline" icon="i-lucide-upload">
            이미지 선택
          </UButton>
          <p class="mt-1.5 text-xs text-neutral-500">16:9 비율 권장, 5MB 이하</p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="제목" required>
        <UInput v-model="form.title" placeholder="예: 1인 개발자 필수 도구 10선" size="lg" />
      </UFormField>
      <UFormField label="슬러그 (URL)" required help="영문/한글/숫자/하이픈. URL에 그대로 노출돼요">
        <div class="flex gap-2">
          <UInput v-model="form.slug" placeholder="indie-dev-essentials" class="flex-1" />
          <UButton
            v-if="!isEdit"
            type="button"
            color="neutral"
            variant="outline"
            size="md"
            :disabled="!form.title.trim()"
            @click="generateSlugFromTitle"
          >
            제목에서 생성
          </UButton>
        </div>
      </UFormField>
    </div>

    <UFormField label="설명" required help="이 컬렉션의 관점을 짧게">
      <UTextarea v-model="form.description" :rows="3" placeholder="어떤 주제로 골랐는지 짧게 설명" />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-3">
      <UFormField label="큐레이터 이름">
        <UInput v-model="form.curatorName" placeholder="아무" />
      </UFormField>
      <UFormField label="공개 상태">
        <USelectMenu
          v-model="form.status"
          :items="[{ label: '초안', value: 'draft' }, { label: '게시', value: 'published' }]"
          value-key="value"
        />
      </UFormField>
      <UFormField label="정렬 순서">
        <UInput v-model.number="form.order" type="number" placeholder="0" />
      </UFormField>
    </div>

    <!-- Product picker -->
    <div>
      <label class="mb-1.5 block text-sm font-medium">
        프로덕트 <span class="text-error">*</span>
        <span class="ml-2 text-xs text-neutral-500">({{ selectedProducts.length }}개 선택됨)</span>
      </label>

      <!-- Search -->
      <div class="mt-2 relative">
        <UInput v-model="search" placeholder="프로덕트 이름/태그라인 검색" icon="i-lucide-search" size="md" />
        <ul v-if="search && searchResults.length" class="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <li
            v-for="p in searchResults"
            :key="p.id"
            class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            @click="addProduct(p.id)"
          >
            <img :src="p.thumbnailUrl" :alt="p.name" class="size-8 rounded-md bg-neutral-100 object-cover">
            <span class="flex-1 truncate font-medium">{{ p.name }}</span>
            <span class="truncate text-xs text-neutral-500">{{ p.tagline }}</span>
          </li>
        </ul>
      </div>

      <!-- Selected list -->
      <ul v-if="selectedProducts.length" class="mt-3 space-y-2">
        <li
          v-for="(p, idx) in selectedProducts"
          :key="p.id"
          class="flex items-center gap-3 rounded-xl bg-neutral-150 p-3 dark:bg-neutral-800"
        >
          <span class="w-6 text-xs text-neutral-500 tabular-nums">{{ idx + 1 }}</span>
          <img :src="p.thumbnailUrl" :alt="p.name" class="size-10 shrink-0 rounded-md bg-white object-cover">
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold">{{ p.name }}</div>
            <div class="truncate text-xs text-neutral-500">{{ p.tagline }}</div>
          </div>
          <div class="flex gap-1">
            <button type="button" class="rounded-md p-1.5 hover:bg-white dark:hover:bg-neutral-700" @click="moveUp(idx)"><UIcon name="i-lucide-arrow-up" class="size-3.5" /></button>
            <button type="button" class="rounded-md p-1.5 hover:bg-white dark:hover:bg-neutral-700" @click="moveDown(idx)"><UIcon name="i-lucide-arrow-down" class="size-3.5" /></button>
            <button type="button" class="rounded-md p-1.5 text-neutral-500 hover:bg-white hover:text-error dark:hover:bg-neutral-700" @click="removeProduct(p.id)"><UIcon name="i-lucide-x" class="size-3.5" /></button>
          </div>
        </li>
      </ul>
      <div v-else class="mt-3 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700">
        아직 추가된 프로덕트가 없어요.
      </div>
    </div>

    <div v-if="errorMessage" class="rounded-md bg-error/10 p-3 text-sm text-error">
      {{ errorMessage }}
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <UButton
        type="submit"
        size="lg"
        color="neutral"
        :loading="isSubmitting"
        icon="i-lucide-check"
      >
        {{ submitLabel ?? (isEdit ? '저장' : '컬렉션 만들기') }}
      </UButton>
    </div>
  </form>
</template>
