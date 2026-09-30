<script setup lang="ts">
import { collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type {
  MonthlyRevenueRange,
  MonthlyUsersRange,
  PricingModel,
  Product,
  ProductShowroom,
  ProductSource,
  ProductStatus
} from '~/types/product'

const props = defineProps<{
  // Create mode: source + status required. Edit mode: pass product; source/status ignored.
  product?: Product
  source?: ProductSource
  status?: ProductStatus
  submitLabel?: string
}>()

const emit = defineEmits<{
  submitted: [productId: string]
}>()

const isEdit = computed(() => !!props.product)

const { data: categories } = useCategories()
const { uploadThumbnail } = useProductUpload()
const db = useFirestore()
const user = useCurrentUser()

const form = reactive({
  name: props.product?.name ?? '',
  tagline: props.product?.tagline ?? '',
  description: props.product?.description ?? '',
  category: props.product?.category ?? '',
  tags: (props.product?.tags || []).join(', '),
  pricing: (props.product?.pricing ?? 'free') as PricingModel,
  linkLabel: props.product?.links?.[0]?.label ?? '웹사이트',
  linkUrl: props.product?.links?.[0]?.url ?? '',
  maker: props.product?.maker ?? ''
})

// Showroom section — every field optional
const showroom = reactive({
  monthlyUsersRange: (props.product?.showroom?.monthlyUsersRange ?? '') as MonthlyUsersRange | '',
  monthlyRevenueRange: (props.product?.showroom?.monthlyRevenueRange ?? '') as MonthlyRevenueRange | '',
  teamSize: props.product?.showroom?.teamSize ?? null as number | null,
  foundedAt: props.product?.showroom?.foundedAt ?? '',
  location: props.product?.showroom?.location ?? '',
  investorPitch: props.product?.showroom?.investorPitch ?? ''
})

const showroomOpen = ref(
  !!(
    props.product?.showroom?.monthlyUsersRange
    || props.product?.showroom?.monthlyRevenueRange
    || props.product?.showroom?.teamSize
    || props.product?.showroom?.foundedAt
    || props.product?.showroom?.location
    || props.product?.showroom?.investorPitch
  )
)

const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string | null>(props.product?.thumbnailUrl ?? null)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// iTunes 자동 채우기
const itunesInput = ref('')
const itunesFetching = ref(false)
const itunesGenreHint = ref('')
const itunesError = ref<string | null>(null)

type ItunesResult = {
  id: string
  name: string
  tagline: string
  description: string
  maker: string
  genreName: string
  tags: string[]
  pricing: 'free' | 'paid' | 'freemium'
  linkUrl: string
  thumbnailUrl: string
  screenshotUrls: string[]
}

async function fillFromItunes() {
  itunesError.value = null
  const raw = itunesInput.value.trim()
  if (!raw) {
    itunesError.value = 'App Store URL 또는 앱 ID를 입력해주세요'
    return
  }
  itunesFetching.value = true
  try {
    const data = await $fetch<ItunesResult>('/api/itunes', { query: { url: raw } })

    form.name = data.name
    form.tagline = data.tagline
    form.description = data.description
    form.maker = data.maker
    form.pricing = data.pricing
    form.linkUrl = data.linkUrl
    form.linkLabel = 'App Store'
    if (data.tags.length) {
      form.tags = data.tags.join(', ')
    }
    itunesGenreHint.value = data.genreName

    // 썸네일: 서버 프록시로 받아 File 로 변환 → 폼 업로드 파이프라인에 그대로 태움
    if (data.thumbnailUrl) {
      try {
        const proxied = `/api/itunes-image?url=${encodeURIComponent(data.thumbnailUrl)}`
        const res = await fetch(proxied)
        const blob = await res.blob()
        const file = new File([blob], `itunes-${data.id}.jpg`, { type: blob.type || 'image/jpeg' })
        thumbnailFile.value = file
        thumbnailPreview.value = URL.createObjectURL(file)
      } catch {
        thumbnailPreview.value = data.thumbnailUrl
      }
    }
  } catch (e: any) {
    itunesError.value = e?.data?.statusMessage || e?.statusMessage || '조회 실패'
  } finally {
    itunesFetching.value = false
  }
}

const pricingOptions: Array<{ label: string, value: PricingModel }> = [
  { label: '무료', value: 'free' },
  { label: '프리미엄', value: 'freemium' },
  { label: '유료', value: 'paid' },
  { label: '구독', value: 'subscription' }
]

const monthlyUsersOptions: Array<{ label: string, value: MonthlyUsersRange | '' }> = [
  { label: '비공개', value: '' },
  { label: '100명 미만', value: '~100' },
  { label: '100~1,000명', value: '100~1K' },
  { label: '1,000~10,000명', value: '1K~10K' },
  { label: '10,000~100,000명', value: '10K~100K' },
  { label: '100,000~1,000,000명', value: '100K~1M' },
  { label: '1,000,000명 이상', value: '1M+' }
]

const monthlyRevenueOptions: Array<{ label: string, value: MonthlyRevenueRange | '' }> = [
  { label: '비공개', value: '' },
  { label: '아직 없음', value: '없음' },
  { label: '월 100만원 미만', value: '~100만' },
  { label: '월 100~500만원', value: '100~500만' },
  { label: '월 500~1,000만원', value: '500만~1천만' },
  { label: '월 1,000~5,000만원', value: '1천~5천만' },
  { label: '월 5,000만~1억원', value: '5천만~1억' },
  { label: '월 1억원 이상', value: '1억+' }
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

/** Strip empty fields so Firestore doesn't store 'undefined'/'' noise. */
function buildShowroomPayload(): ProductShowroom | null {
  const s: ProductShowroom = {}
  if (showroom.monthlyUsersRange) s.monthlyUsersRange = showroom.monthlyUsersRange
  if (showroom.monthlyRevenueRange) s.monthlyRevenueRange = showroom.monthlyRevenueRange
  if (showroom.teamSize != null && !Number.isNaN(Number(showroom.teamSize))) s.teamSize = Number(showroom.teamSize)
  if (showroom.foundedAt.trim()) s.foundedAt = showroom.foundedAt.trim()
  if (showroom.location.trim()) s.location = showroom.location.trim()
  if (showroom.investorPitch.trim()) s.investorPitch = showroom.investorPitch.trim()
  return Object.keys(s).length > 0 ? s : null
}

async function submit() {
  errorMessage.value = null
  if (!user.value) {
    errorMessage.value = '로그인이 필요합니다.'
    return
  }
  if (!form.name || !form.tagline || !form.category || !form.linkUrl) {
    errorMessage.value = '필수 항목을 모두 채워 주세요.'
    return
  }
  if (!isEdit.value && !thumbnailFile.value) {
    errorMessage.value = '대표 이미지를 선택해 주세요.'
    return
  }

  isSubmitting.value = true
  try {
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const linkArr = form.linkUrl
      ? [{ label: form.linkLabel || '웹사이트', url: form.linkUrl.trim() }]
      : []
    const showroomPayload = buildShowroomPayload()

    if (isEdit.value && props.product) {
      let thumbnailUrl = props.product.thumbnailUrl
      if (thumbnailFile.value) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile.value, props.product.id)
      }
      await updateDoc(doc(db, 'products', props.product.id), {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category,
        tags,
        pricing: form.pricing,
        links: linkArr,
        thumbnailUrl,
        maker: form.maker.trim() || null,
        showroom: showroomPayload
      })
      emit('submitted', props.product.id)
    } else {
      const productRef = doc(collection(db, 'products'))
      const id = productRef.id

      const thumbnailUrl = await uploadThumbnail(thumbnailFile.value!, id)

      await setDoc(productRef, {
        slug: id,
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        description: form.description.trim(),
        category: form.category,
        tags,
        platforms: [],
        pricing: form.pricing,
        links: linkArr,
        thumbnailUrl,
        screenshots: [],
        maker: form.maker.trim() || null,
        showroom: showroomPayload,

        status: props.status!,
        source: props.source!,
        submittedBy: user.value.uid,
        submittedAt: serverTimestamp(),
        publishedAt: props.status === 'published' ? serverTimestamp() : null,

        upvoteCount: 0,
        commentCount: 0,
        bookmarkCount: 0
      })

      emit('submitted', id)
    }
  } catch (e: any) {
    errorMessage.value = e?.message || '저장 중 오류가 발생했어요.'
    console.error('[ProductForm] submit failed:', e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <!-- iTunes 자동 채우기 -->
    <section v-if="!isEdit" class="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <label class="mb-2 flex items-center gap-2 text-sm font-semibold">
        <UIcon name="i-lucide-wand-2" class="size-4 text-[var(--color-amu-pink)]" />
        App Store 링크로 자동 채우기
      </label>
      <div class="flex flex-col gap-2 sm:flex-row">
        <UInput
          v-model="itunesInput"
          placeholder="https://apps.apple.com/kr/app/.../id123456789"
          class="flex-1"
          @keydown.enter.prevent="fillFromItunes"
        />
        <UButton
          color="neutral"
          variant="solid"
          :loading="itunesFetching"
          :disabled="itunesFetching"
          icon="i-lucide-download"
          @click="fillFromItunes"
        >
          가져오기
        </UButton>
      </div>
      <p v-if="itunesError" class="mt-2 text-xs text-error">
        {{ itunesError }}
      </p>
      <p v-else-if="itunesGenreHint" class="mt-2 text-xs text-neutral-500">
        App Store 장르: <span class="font-semibold">{{ itunesGenreHint }}</span> — 아래 카테고리에서 맞춰 골라주세요.
      </p>
      <p v-else class="mt-2 text-xs text-neutral-500">
        iOS/Mac 앱만 가능해요. 채워진 내용은 아래에서 자유롭게 수정하세요.
      </p>
    </section>

    <div>
      <label class="mb-1.5 block text-sm font-medium">
        대표 이미지 <span v-if="!isEdit" class="text-error">*</span>
        <span v-else class="text-neutral-400 text-xs">(교체 시에만 선택)</span>
      </label>
      <div class="flex items-start gap-4">
        <div class="size-24 shrink-0 rounded-md border border-dashed border-neutral-300 bg-white overflow-hidden dark:border-neutral-700 dark:bg-neutral-900">
          <img v-if="thumbnailPreview" :src="thumbnailPreview" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center text-neutral-400">
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
          <p class="mt-1.5 text-xs text-neutral-500">5MB 이하, 정사각형 권장</p>
        </div>
      </div>
    </div>

    <UFormField label="이름" required>
      <UInput v-model="form.name" placeholder="프로덕트 이름" size="lg" />
    </UFormField>

    <UFormField label="한줄 소개" required help="검색 결과와 카드에 보여져요">
      <UInput v-model="form.tagline" placeholder="어떤 프로덕트인지 한 줄로" size="lg" maxlength="80" />
    </UFormField>

    <UFormField label="상세 설명">
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

    <!-- Showroom section (collapsible, optional) -->
    <section class="rounded-3xl border border-neutral-200 dark:border-neutral-700">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 rounded-3xl px-5 py-4 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @click="showroomOpen = !showroomOpen"
      >
        <div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-building-2" class="size-4 text-neutral-500" />
            <span class="text-sm font-semibold">쇼룸 정보</span>
            <span class="rounded-full bg-neutral-150 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">선택</span>
          </div>
          <p class="mt-1 text-xs text-neutral-500">
            메이커가 원하는 만큼만 공개해요. 채운 항목만 상세 페이지 쇼룸에 표시됩니다.
          </p>
        </div>
        <UIcon
          :name="showroomOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 shrink-0 text-neutral-500"
        />
      </button>

      <div v-if="showroomOpen" class="space-y-4 px-5 pb-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="월간 활성 사용자" help="정확한 수치 대신 구간을 골라요">
            <USelectMenu
              v-model="showroom.monthlyUsersRange"
              :items="monthlyUsersOptions"
              value-key="value"
              placeholder="비공개"
            />
          </UFormField>
          <UFormField label="월 매출" help="아직 없거나 비공개도 가능">
            <USelectMenu
              v-model="showroom.monthlyRevenueRange"
              :items="monthlyRevenueOptions"
              value-key="value"
              placeholder="비공개"
            />
          </UFormField>
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <UFormField label="팀 규모 (명)">
            <UInput v-model.number="showroom.teamSize" type="number" min="1" placeholder="예: 3" />
          </UFormField>
          <UFormField label="시작 시점">
            <UInput v-model="showroom.foundedAt" placeholder="예: 2025-03" />
          </UFormField>
          <UFormField label="위치">
            <UInput v-model="showroom.location" placeholder="예: 서울, 리모트" />
          </UFormField>
        </div>

        <UFormField label="투자자를 위한 한 줄" help="쇼룸 상단에 크게 노출돼요">
          <UInput
            v-model="showroom.investorPitch"
            placeholder="예: 2024년 시작, 월 1,500명 활성, 흑자 전환"
            maxlength="120"
          />
        </UFormField>
      </div>
    </section>

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
        {{ submitLabel ?? (isEdit ? '저장' : '등록') }}
      </UButton>
    </div>
  </form>
</template>
