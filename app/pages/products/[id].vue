<script setup lang="ts">
const route = useRoute()
const id = String(route.params.id)

const { data: product } = useProductById(id)

const site = useSiteConfig()

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
</script>

<template>
  <UContainer class="py-10">
    <article v-if="product" class="space-y-8">
      <header class="flex items-start gap-4">
        <NuxtImg
          :src="product.thumbnailUrl"
          :alt="product.name"
          width="96"
          height="96"
          class="size-24 rounded-lg object-cover bg-elevated"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-semibold tracking-tight">{{ product.name }}</h1>
            <UBadge v-if="product.source === 'curated'" size="sm" variant="subtle" color="neutral">
              AMU Pick
            </UBadge>
          </div>
          <p class="mt-1 text-muted">{{ product.tagline }}</p>
        </div>
      </header>

      <section v-if="product.description" class="prose prose-sm max-w-none dark:prose-invert">
        <p style="white-space: pre-wrap">{{ product.description }}</p>
      </section>

      <section v-if="product.links?.length" class="flex flex-wrap gap-2">
        <UButton
          v-for="link in product.links"
          :key="link.url"
          :to="link.url"
          target="_blank"
          size="sm"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-external-link"
        >
          {{ link.label }}
        </UButton>
      </section>
    </article>

    <div v-else class="rounded-lg border border-dashed border-default p-10 text-center text-muted">
      프로덕트를 불러오는 중이거나 존재하지 않아요.
    </div>
  </UContainer>
</template>
