<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import type { Product } from '~/types/product'

const route = useRoute()
const slug = String(route.params.slug)
const site = useSiteConfig()

const { data: collectionDoc } = useCollectionBySlug(slug)

// Fetch products in this collection
const { data: products } = await useAsyncData<Product[]>(
  () => `collection-products:${slug}`,
  async () => {
    const ids = collectionDoc.value?.productIds ?? []
    if (!ids.length) return []
    try {
      const db = useFirestore()
      const docs = await Promise.all(ids.map(id => getDoc(doc(db, 'products', id))))
      return docs
        .filter(d => d.exists())
        .map(d => ({ id: d.id, ...d.data() }) as Product)
        .filter(p => p.status === 'published')
    } catch (e) {
      console.warn('[collection products] fetch failed:', e)
      return []
    }
  },
  { default: () => [], watch: [collectionDoc] }
)

// Preserve the curator's chosen order (Firestore returns undefined ordering across get()s)
const orderedProducts = computed<Product[]>(() => {
  const map = new Map((products.value || []).map(p => [p.id, p]))
  return (collectionDoc.value?.productIds ?? [])
    .map(id => map.get(id))
    .filter((p): p is Product => !!p)
})

useSeoMeta({
  title: () => collectionDoc.value?.title ?? '컬렉션',
  description: () => collectionDoc.value?.description,
  ogTitle: () => collectionDoc.value?.title,
  ogDescription: () => collectionDoc.value?.description,
  ogImage: () => collectionDoc.value?.coverImageUrl || undefined,
  ogType: 'article',
  ogUrl: () => `${site.url}/collections/${slug}`
})

useSchemaOrg([
  defineWebPage(),
  defineItemList({
    itemListElement: () => orderedProducts.value.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.name,
      url: `${site.url}/products/${p.slug || p.id}`
    }))
  })
])
</script>

<template>
  <div class="mx-auto max-w-4xl px-6 py-10">
    <NuxtLink to="/collections" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      컬렉션
    </NuxtLink>

    <article v-if="collectionDoc" class="mt-6">
      <!-- Cover -->
      <div v-if="collectionDoc.coverImageUrl" class="mb-8 aspect-[16/9] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900">
        <img :src="collectionDoc.coverImageUrl" :alt="collectionDoc.title" class="size-full object-cover">
      </div>

      <!-- Header -->
      <header class="mb-10">
        <div class="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          컬렉션 · {{ orderedProducts.length }}개 프로덕트
        </div>
        <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
          {{ collectionDoc.title }}
        </h1>
        <p class="mt-4 text-base text-neutral-600 sm:text-lg dark:text-neutral-400">
          {{ collectionDoc.description }}
        </p>
        <div v-if="collectionDoc.curatorName" class="mt-4 text-sm text-neutral-500">
          by {{ collectionDoc.curatorName }}
        </div>
      </header>

      <!-- Product list -->
      <section v-if="orderedProducts.length" class="space-y-3">
        <NuxtLink
          v-for="(p, idx) in orderedProducts"
          :key="p.id"
          :to="`/products/${p.slug || p.id}`"
          class="flex items-center gap-4 rounded-3xl bg-neutral-100 p-4 transition hover:bg-neutral-150 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <span class="w-8 text-lg font-bold tabular-nums text-neutral-400">
            {{ String(idx + 1).padStart(2, '0') }}
          </span>
          <img
            :src="p.thumbnailUrl"
            :alt="p.name"
            class="size-16 shrink-0 rounded-2xl bg-neutral-50 object-cover"
          >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="truncate font-bold tracking-tight">{{ p.name }}</h3>
              <UBadge
                v-if="p.source === 'curated'"
                size="xs"
                color="neutral"
                variant="solid"
              >
                AMU Pick
              </UBadge>
            </div>
            <p class="mt-1 line-clamp-1 text-sm text-neutral-500">{{ p.tagline }}</p>
          </div>
          <UIcon name="i-lucide-arrow-up-right" class="size-4 shrink-0 text-neutral-400" />
        </NuxtLink>
      </section>

      <div v-else class="rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
        <p class="text-neutral-500">이 컬렉션에 아직 프로덕트가 없어요.</p>
      </div>
    </article>

    <div v-else class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-search-x" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">컬렉션을 찾을 수 없어요.</p>
    </div>
  </div>
</template>
