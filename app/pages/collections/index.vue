<script setup lang="ts">
const { data: collections } = usePublishedCollections(50)

const site = useSiteConfig()

useSeoMeta({
  title: '컬렉션',
  description: '주제별로 골라 묶은 앱·웹·프로그램. 아무의 편집 시선.',
  ogUrl: `${site.url}/collections`
})

useSchemaOrg([
  defineWebPage({
    name: '컬렉션',
    description: '주제별 큐레이션 컬렉션 목록'
  })
])
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-5 py-10 md:px-6 md:py-16 lg:py-24">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-6xl">
        컬렉션
      </h1>
    </header>

    <section v-if="collections?.length" class="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <CollectionCard
        v-for="c in collections"
        :key="c.id"
        :collection="c"
      />
    </section>

    <div v-else class="mx-auto mt-16 max-w-xl rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800">
      <UIcon name="i-lucide-layers" class="mx-auto size-8 text-neutral-400" />
      <p class="mt-4 text-neutral-500">아직 준비된 컬렉션이 없어요.</p>
    </div>
  </div>
</template>
