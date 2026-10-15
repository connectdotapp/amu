<script setup lang="ts">
import { collection, doc, getDocs, limit as fbLimit, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { normalizeUrl } from '~/utils/url'
import type {
  MakerStory,
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

// 메이커 인터뷰 섹션 — 영상 URL + Q&A 2-3개. 모두 optional.
const PRESET_QUESTIONS = [
  '어떤 문제를 보고 만들었나',
  '가장 자랑스러운 기능 하나',
  '다음 업데이트에 넣고 싶은 것'
]

const makerStory = reactive({
  videoUrl: props.product?.makerStory?.videoUrl ?? '',
  oneLiner: props.product?.makerStory?.oneLiner ?? '',
  qa: props.product?.makerStory?.qa && props.product.makerStory.qa.length
    ? [...props.product.makerStory.qa]
    : PRESET_QUESTIONS.map(q => ({ q, a: '' }))
})

const makerStoryOpen = ref(
  !!(
    props.product?.makerStory?.videoUrl
    || props.product?.makerStory?.oneLiner
    || props.product?.makerStory?.qa?.some(x => x.a?.trim())
  )
)

const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string | null>(props.product?.thumbnailUrl ?? null)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// 스토어 자동 채우기 (App Store / Play Store)
type StorePlatform = 'appstore' | 'playstore'
const storePlatform = ref<StorePlatform>('appstore')
const storeInput = ref('')
const storeFetching = ref(false)
const storeGenreHint = ref('')
const storeError = ref<string | null>(null)

type StoreResult = {
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

const storeConfig: Record<StorePlatform, {
  label: string
  endpoint: string
  imageProxy: string
  linkLabel: string
  placeholder: string
  helpText: string
  imageHostRegex: RegExp
  filenamePrefix: string
}> = {
  appstore: {
    label: 'App Store',
    endpoint: '/api/itunes',
    imageProxy: '/api/itunes-image',
    linkLabel: 'App Store',
    placeholder: 'https://apps.apple.com/kr/app/.../id123456789',
    helpText: 'iOS/Mac 앱만 가능해요. 채워진 내용은 아래에서 자유롭게 수정하세요.',
    imageHostRegex: /mzstatic\.com/,
    filenamePrefix: 'itunes'
  },
  playstore: {
    label: 'Play Store',
    endpoint: '/api/play',
    imageProxy: '/api/play-image',
    linkLabel: 'Play Store',
    placeholder: 'https://play.google.com/store/apps/details?id=com.example.app',
    helpText: 'Android 앱 또는 패키지명(com.example.app). 채워진 내용은 아래에서 수정하세요.',
    imageHostRegex: /googleusercontent\.com/,
    filenamePrefix: 'play'
  }
}

async function fillFromStore() {
  storeError.value = null
  const raw = storeInput.value.trim()
  const cfg = storeConfig[storePlatform.value]
  if (!raw) {
    storeError.value = `${cfg.label} URL 또는 앱 ID를 입력해주세요`
    return
  }
  storeFetching.value = true
  try {
    const data = await $fetch<StoreResult>(cfg.endpoint, { query: { url: raw } })

    form.name = data.name
    form.tagline = data.tagline
    form.description = data.description
    form.maker = data.maker
    form.pricing = data.pricing
    form.linkUrl = data.linkUrl
    form.linkLabel = cfg.linkLabel
    if (data.tags.length) {
      form.tags = data.tags.join(', ')
    }
    storeGenreHint.value = data.genreName

    // 썸네일: 서버 프록시로 받아 File 로 변환
    if (data.thumbnailUrl) {
      try {
        const proxied = `${cfg.imageProxy}?url=${encodeURIComponent(data.thumbnailUrl)}`
        const res = await fetch(proxied)
        const blob = await res.blob()
        const ext = (blob.type || 'image/jpeg').split('/')[1] || 'jpg'
        const file = new File([blob], `${cfg.filenamePrefix}-${data.id}.${ext}`, { type: blob.type || 'image/jpeg' })
        thumbnailFile.value = file
        thumbnailPreview.value = URL.createObjectURL(file)
      } catch {
        thumbnailPreview.value = data.thumbnailUrl
      }
    }
  } catch (e: any) {
    storeError.value = e?.data?.statusMessage || e?.statusMessage || '조회 실패'
  } finally {
    storeFetching.value = false
  }
}

function switchPlatform(p: StorePlatform) {
  if (storePlatform.value === p) return
  storePlatform.value = p
  storeInput.value = ''
  storeError.value = null
  storeGenreHint.value = ''
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

function buildMakerStoryPayload(): MakerStory | null {
  const m: MakerStory = {}
  if (makerStory.videoUrl.trim()) m.videoUrl = makerStory.videoUrl.trim()
  if (makerStory.oneLiner.trim()) m.oneLiner = makerStory.oneLiner.trim()
  const filledQa = makerStory.qa.filter(x => x.a?.trim())
  if (filledQa.length) m.qa = filledQa.map(x => ({ q: x.q, a: x.a.trim() }))
  return Object.keys(m).length > 0 ? m : null
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

  // URL 형식 검증 (http/https 유효 URL)
  const normalizedLinkUrl = normalizeUrl(form.linkUrl)
  if (!normalizedLinkUrl) {
    errorMessage.value = '올바른 URL이 아니에요. http:// 또는 https:// 로 시작해야 해요.'
    return
  }

  if (!isEdit.value && !thumbnailFile.value) {
    errorMessage.value = '대표 이미지를 선택해 주세요.'
    return
  }

  isSubmitting.value = true
  try {
    // 중복 등록 차단 — 같은 URL 로 이미 소개된 프로덕트가 있는지 확인.
    // Edit 모드에서 URL 변경이 없거나 자기 자신인 경우는 통과.
    const originalLinkUrl = props.product ? normalizeUrl(props.product.linkUrl || props.product.links?.[0]?.url || '') : ''
    const urlChanged = normalizedLinkUrl !== originalLinkUrl
    if (urlChanged) {
      const dupSnap = await getDocs(query(
        collection(db, 'products'),
        where('linkUrl', '==', normalizedLinkUrl),
        where('status', '==', 'published'),
        fbLimit(1)
      ))
      if (!dupSnap.empty) {
        errorMessage.value = '이미 소개된 프로덕트예요. 같은 URL 로 등록된 글이 이미 있어요.'
        isSubmitting.value = false
        return
      }
    }

    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const linkArr = [{ label: form.linkLabel || '웹사이트', url: normalizedLinkUrl }]
    const showroomPayload = buildShowroomPayload()
    const makerStoryPayload = buildMakerStoryPayload()

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
        linkUrl: normalizedLinkUrl,
        links: linkArr,
        thumbnailUrl,
        maker: form.maker.trim() || null,
        showroom: showroomPayload,
        makerStory: makerStoryPayload
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
        linkUrl: normalizedLinkUrl,
        links: linkArr,
        thumbnailUrl,
        screenshots: [],
        maker: form.maker.trim() || null,
        showroom: showroomPayload,
        makerStory: makerStoryPayload,

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
    <!-- 스토어 링크로 자동 채우기 -->
    <section v-if="!isEdit" class="rounded-2xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <label class="mb-2 flex items-center gap-2 text-sm font-semibold">
        <UIcon name="i-lucide-wand-2" class="size-4 text-neutral-700 dark:text-neutral-200" />
        스토어 링크로 자동 채우기
      </label>

      <!-- 플랫폼 토글 -->
      <div class="mb-3 inline-flex rounded-full bg-white p-1 text-sm font-semibold dark:bg-neutral-900">
        <button
          type="button"
          class="rounded-full px-5 py-2 transition"
          :class="storePlatform === 'appstore' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
          @click="switchPlatform('appstore')"
        >
          App Store
        </button>
        <button
          type="button"
          class="rounded-full px-5 py-2 transition"
          :class="storePlatform === 'playstore' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'"
          @click="switchPlatform('playstore')"
        >
          Play Store
        </button>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row">
        <UInput
          v-model="storeInput"
          :placeholder="storeConfig[storePlatform].placeholder"
          class="flex-1"
          @keydown.enter.prevent="fillFromStore"
        />
        <UButton
          color="neutral"
          variant="solid"
          :loading="storeFetching"
          :disabled="storeFetching"
          icon="i-lucide-download"
          @click="fillFromStore"
        >
          가져오기
        </UButton>
      </div>
      <p v-if="storeError" class="mt-2 text-xs text-error">
        {{ storeError }}
      </p>
      <p v-else-if="storeGenreHint" class="mt-2 text-xs text-neutral-500">
        {{ storeConfig[storePlatform].label }} 장르: <span class="font-semibold">{{ storeGenreHint }}</span> — 아래 카테고리에서 맞춰 골라주세요.
      </p>
      <p v-else class="mt-2 text-xs text-neutral-500">
        {{ storeConfig[storePlatform].helpText }}
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

    <UFormField label="한줄 소개" required :help="`최대 30자 · ${form.tagline.length}/30`">
      <UInput v-model="form.tagline" placeholder="어떤 프로덕트인지 한 줄로" size="lg" maxlength="30" />
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

    <!-- 메이커 인터뷰 섹션 (collapsible, optional) -->
    <section class="rounded-3xl border border-neutral-200 dark:border-neutral-700">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 rounded-3xl px-5 py-4 text-left transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
        @click="makerStoryOpen = !makerStoryOpen"
      >
        <div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-mic" class="size-4 text-neutral-500" />
            <span class="text-sm font-semibold">메이커 인터뷰</span>
            <span class="rounded-full bg-neutral-150 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">선택</span>
          </div>
          <p class="mt-1 text-xs text-neutral-500">
            셀프 1분 영상 또는 이메일 Q&amp;A. 채운 항목만 상세 페이지 메이커 탭에 표시된다.
          </p>
        </div>
        <UIcon
          :name="makerStoryOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 shrink-0 text-neutral-500"
        />
      </button>

      <div v-if="makerStoryOpen" class="space-y-4 px-5 pb-5">
        <UFormField label="영상 URL" help="YouTube 링크. 셀프 녹화 1분 영상 권장">
          <UInput
            v-model="makerStory.videoUrl"
            placeholder="https://youtube.com/watch?v=..."
            type="url"
          />
        </UFormField>

        <UFormField label="한 줄 소감" help="왜 만들었는지 짧게 한 문장">
          <UInput
            v-model="makerStory.oneLiner"
            placeholder="예: 내가 쓸 게 없어서 만들었다"
            maxlength="60"
          />
        </UFormField>

        <div class="space-y-3">
          <div class="text-xs font-semibold text-neutral-500">Q&amp;A (선택)</div>
          <div v-for="(item, i) in makerStory.qa" :key="i" class="space-y-1.5">
            <label class="block text-sm font-medium">{{ item.q }}</label>
            <UTextarea
              v-model="item.a"
              :rows="2"
              :placeholder="`${item.q}에 대한 답 (비워두면 노출 안 됨)`"
            />
          </div>
        </div>
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
