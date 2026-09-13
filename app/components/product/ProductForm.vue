<script setup lang="ts">
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { PricingModel, ProductSource, ProductStatus } from '~/types/product'

const props = defineProps<{
  source: ProductSource
  status: ProductStatus
  submitLabel?: string
}>()

const emit = defineEmits<{
  submitted: [productId: string]
}>()

const { data: categories } = useCategories()
const { uploadThumbnail } = useProductUpload()
const db = useFirestore()
const user = useCurrentUser()

const form = reactive({
  name: '',
  tagline: '',
  description: '',
  category: '',
  tags: '',
  pricing: 'free' as PricingModel,
  linkLabel: '웹사이트',
  linkUrl: '',
  maker: ''
})

const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const pricingOptions: Array<{ label: string, value: PricingModel }> = [
  { label: '무료', value: 'free' },
  { label: '프리미엄', value: 'freemium' },
  { label: '유료', value: 'paid' },
  { label: '구독', value: 'subscription' }
]

const categoryOptions = computed(() =>
  (categories.value || []).map(c => ({ label: c.name, value: c.slug }))
)

function onFilePick(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  thumbnailFile.value = file
  thumbnailPreview.value = URL.createObjectURL(file)
}

async function submit() {
  errorMessage.value = null
  if (!user.value) {
    errorMessage.value = '로그인이 필요합니다.'
    return
  }
  if (!form.name || !form.tagline || !form.category || !form.linkUrl || !thumbnailFile.value) {
    errorMessage.value = '필수 항목을 모두 채워 주세요. (이름 · 한줄소개 · 카테고리 · 링크 · 대표 이미지)'
    return
  }

  isSubmitting.value = true
  try {
    const productRef = doc(collection(db, 'products'))
    const id = productRef.id

    const thumbnailUrl = await uploadThumbnail(thumbnailFile.value, id)

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

    await setDoc(productRef, {
      slug: id,
      name: form.name.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      category: form.category,
      tags,
      platforms: [],
      pricing: form.pricing,
      links: form.linkUrl ? [{ label: form.linkLabel || '웹사이트', url: form.linkUrl.trim() }] : [],
      thumbnailUrl,
      screenshots: [],
      maker: form.maker.trim() || null,

      status: props.status,
      source: props.source,
      submittedBy: user.value.uid,
      submittedAt: serverTimestamp(),
      publishedAt: props.status === 'published' ? serverTimestamp() : null,

      upvoteCount: 0,
      commentCount: 0,
      bookmarkCount: 0
    })

    emit('submitted', id)
  } catch (e: any) {
    errorMessage.value = e?.message || '등록 중 오류가 발생했어요.'
    console.error('[ProductForm] submit failed:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <div>
      <label class="mb-1.5 block text-sm font-medium">대표 이미지 <span class="text-error">*</span></label>
      <div class="flex items-start gap-4">
        <div class="size-24 shrink-0 rounded-md border border-dashed border-default bg-elevated overflow-hidden">
          <img v-if="thumbnailPreview" :src="thumbnailPreview" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-dimmed">
            <UIcon name="i-lucide-image" class="size-6" />
          </div>
        </div>
        <div class="flex-1">
          <input
            id="thumb-input"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFilePick"
          >
          <UButton
            as="label"
            for="thumb-input"
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-upload"
          >
            이미지 선택
          </UButton>
          <p class="mt-1.5 text-xs text-dimmed">5MB 이하, 정사각형 권장</p>
        </div>
      </div>
    </div>

    <UFormField label="이름" required>
      <UInput v-model="form.name" placeholder="프로덕트 이름" size="lg" />
    </UFormField>

    <UFormField label="한줄 소개" required help="검색 결과와 카드에 보여져요">
      <UInput v-model="form.tagline" placeholder="어떤 프로덕트인지 한 줄로" size="lg" maxlength="80" />
    </UFormField>

    <UFormField label="상세 설명" help="Markdown 지원 예정 · 지금은 일반 텍스트">
      <UTextarea v-model="form.description" :rows="6" placeholder="주요 기능, 만든 이유, 사용 팁 등" />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="카테고리" required>
        <USelectMenu
          v-model="form.category"
          :items="categoryOptions"
          value-key="value"
          placeholder="선택하세요"
        />
      </UFormField>
      <UFormField label="가격 모델">
        <USelectMenu
          v-model="form.pricing"
          :items="pricingOptions"
          value-key="value"
        />
      </UFormField>
    </div>

    <UFormField label="태그" help="쉼표(,) 로 구분 · 예: chatgpt, 무료, macos">
      <UInput v-model="form.tags" placeholder="tag1, tag2, tag3" />
    </UFormField>

    <div class="grid gap-4 sm:grid-cols-[1fr_2fr]">
      <UFormField label="링크 이름">
        <UInput v-model="form.linkLabel" placeholder="웹사이트" />
      </UFormField>
      <UFormField label="링크 URL" required>
        <UInput v-model="form.linkUrl" type="url" placeholder="https://" />
      </UFormField>
    </div>

    <UFormField label="메이커 (선택)">
      <UInput v-model="form.maker" placeholder="예: OpenAI, 홍길동" />
    </UFormField>

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
        {{ submitLabel ?? '등록' }}
      </UButton>
    </div>
  </form>
</template>
