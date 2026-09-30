<script setup lang="ts">
import { deleteDoc, doc } from 'firebase/firestore'

const route = useRoute()
const id = String(route.params.id)

const { data: product } = useProductById(id)

const site = useSiteConfig()

const user = useCurrentUser()
const isAdmin = ref(false)
watchEffect(async () => {
  if (!user.value) { isAdmin.value = false; return }
  try {
    const token = await user.value.getIdTokenResult()
    isAdmin.value = !!token.claims.admin
  } catch { isAdmin.value = false }
})

const db = useFirestore()
const toast = useToast()

async function removeProduct() {
  if (!product.value) return
  if (!confirm(`"${product.value.name}" 프로덕트를 삭제할까요? 되돌릴 수 없어요.`)) return
  try {
    await deleteDoc(doc(db, 'products', id))
    toast.add({ title: '삭제됐어요', color: 'success' })
    await navigateTo('/')
  } catch (e: any) {
    toast.add({ title: '삭제 실패', description: e?.message, color: 'error' })
  }
}

useSeoMeta({
  title: () => product.value?.name ?? '프로덕트',
  description: () => product.value?.tagline,
  ogTitle: () => product.value?.name,
  ogDescription: () => product.value?.tagline,
  ogImage: () => product.value?.thumbnailUrl,
  ogType: 'article',
  ogUrl: () => `${site.url}/products/${id}`
})

useSchemaOrg([
  defineWebPage(),
  defineSoftwareApp({
    name: () => product.value?.name,
    description: () => product.value?.tagline,
    image: () => product.value?.thumbnailUrl,
    applicationCategory: () => product.value?.category,
    operatingSystem: () => product.value?.platforms?.join(', ')
  })
])

const pricingLabel: Record<string, string> = {
  free: '무료',
  freemium: '프리미엄',
  paid: '유료',
  subscription: '구독'
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-8">
    <NuxtLink to="/" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      둘러보기
    </NuxtLink>

    <!-- Admin actions -->
    <div v-if="isAdmin && product" class="mt-4 flex items-center gap-2 rounded-2xl bg-neutral-150 p-3 dark:bg-neutral-800">
      <UIcon name="i-lucide-shield" class="size-4 text-neutral-500" />
      <span class="text-xs text-neutral-500">관리자 액션</span>
      <div class="ml-auto flex gap-2">
        <UButton :to="`/admin/products/${id}/edit`" size="xs" color="neutral" variant="outline" icon="i-lucide-pencil">
          수정
        </UButton>
        <UButton size="xs" color="neutral" variant="ghost" icon="i-lucide-trash-2" @click="removeProduct">
          삭제
        </UButton>
      </div>
    </div>

    <article v-if="product" class="mt-6 space-y-6">
      <!-- Hero card -->
      <div class="rounded-3xl bg-neutral-150 p-8 dark:bg-neutral-800">
        <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
          <img
            :src="product.thumbnailUrl"
            :alt="product.name"
            class="size-32 shrink-0 rounded-2xl object-cover bg-white"
          >

          <div class="min-w-0 flex-1">
            <div v-if="product.source === 'curated'" class="mb-2">
              <span class="inline-block rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white">
                AMU Pick
              </span>
            </div>

            <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">
              {{ product.name }}
            </h1>
            <p class="mt-2 text-base text-neutral-500 sm:text-lg">
              {{ product.tagline }}
            </p>

            <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-500">
              <span v-if="product.category">{{ product.category }}</span>
              <span v-if="product.pricing" class="text-neutral-400">·</span>
              <span v-if="product.pricing">{{ pricingLabel[product.pricing] || product.pricing }}</span>
              <span v-if="product.maker" class="text-neutral-400">·</span>
              <span v-if="product.maker">by {{ product.maker }}</span>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-2">
              <UButton
                v-if="product.links?.[0]"
                :to="product.links[0].url"
                target="_blank"
                color="neutral"
                variant="solid"
                trailing-icon="i-lucide-arrow-up-right"
              >
                {{ product.links[0].label || '방문하기' }}
              </UButton>
              <ProductUpvoteButton :product-id="id" :initial-count="product.upvoteCount ?? 0" />
              <ProductBookmarkButton :product-id="id" />
              <UButton
                :to="`/compare?ids=${id}`"
                color="neutral"
                variant="outline"
                icon="i-lucide-scale"
                aria-label="다른 프로덕트와 비교"
              >
                비교
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="product.tags?.length" class="flex flex-wrap gap-2">
        <span
          v-for="t in product.tags"
          :key="t"
          class="rounded-full bg-neutral-150 px-3 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
        >
          #{{ t }}
        </span>
      </div>

      <!-- Description -->
      <section v-if="product.description" class="rounded-3xl bg-neutral-150 p-8 dark:bg-neutral-800">
        <h2 class="text-sm font-semibold text-neutral-500">소개</h2>
        <p class="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">
          {{ product.description }}
        </p>
      </section>

      <!-- Extra links -->
      <section v-if="product.links && product.links.length > 1" class="rounded-3xl bg-neutral-150 p-8 dark:bg-neutral-800">
        <h2 class="text-sm font-semibold text-neutral-500">링크</h2>
        <ul class="mt-3 space-y-2">
          <li v-for="link in product.links" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              class="inline-flex items-center gap-1.5 font-medium hover:underline"
            >
              {{ link.label }}
              <UIcon name="i-lucide-arrow-up-right" class="size-4" />
            </a>
          </li>
        </ul>
      </section>

      <!-- Comments -->
      <ProductCommentSection :product-id="id" />
    </article>

    <div v-else class="mt-12 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">프로덕트를 불러오는 중이거나 존재하지 않아요.</p>
    </div>
  </div>
</template>
