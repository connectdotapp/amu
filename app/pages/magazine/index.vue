<script setup lang="ts">
useSeoMeta({
  title: '아무 매거진',
  description: '작은 메이커의 큰 이야기, 디자인·창업 가이드. 아무가 쓰는 매거진.'
})

const { data: posts } = await usePublishedPosts(60)

const fallbackGradients = [
  'from-pink-100 to-pink-200',
  'from-blue-100 to-blue-300',
  'from-emerald-100 to-emerald-300',
  'from-amber-100 to-amber-200'
]
</script>

<template>
  <div class="mx-auto max-w-[1280px] px-5 pb-24 pt-8 md:px-6 md:pt-14">
    <header class="mb-8 md:mb-12">
      <h1 class="text-2xl font-bold tracking-tight md:text-4xl">
        아무 매거진
      </h1>
      <p class="mt-2 text-sm text-neutral-500 md:text-base">
        작은 메이커의 큰 이야기, 디자인·창업 가이드
      </p>
    </header>

    <div
      v-if="posts.length"
      class="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="(p, i) in posts"
        :key="p.id"
        :to="`/magazine/${p.slug}`"
        class="group flex flex-col"
      >
        <div class="mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-100">
          <img
            v-if="p.coverImageUrl"
            :src="p.coverImageUrl"
            :alt="p.title"
            class="size-full object-cover transition duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          >
          <div
            v-else
            class="size-full bg-gradient-to-br"
            :class="fallbackGradients[i % fallbackGradients.length]"
          />
        </div>
        <span class="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-500">{{ p.category }}</span>
        <h2 class="mt-2 text-lg font-bold leading-snug tracking-tight">{{ p.title }}</h2>
        <p
          v-if="p.subtitle"
          class="mt-1 line-clamp-2 text-sm text-neutral-500"
        >{{ p.subtitle }}</p>
        <p class="mt-3 text-xs text-neutral-400">{{ formatPostDate(p) }} · {{ p.readMinutes }}분</p>
      </NuxtLink>
    </div>

    <p
      v-else
      class="rounded-3xl bg-neutral-100 p-16 text-center text-neutral-500"
    >
      첫 글을 준비하고 있어요.
    </p>
  </div>
</template>
