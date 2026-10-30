<script setup lang="ts">
const route = useRoute()
const slug = String(route.params.slug)
const site = useSiteConfig()

const { data: post } = await usePostBySlug(slug)
if (!post.value) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요', fatal: true })

const coverAbsolute = computed(() => {
  const url = post.value?.coverImageUrl
  if (!url) return undefined
  return url.startsWith('http') ? url : `${site.url}${url}`
})

useSeoMeta({
  title: post.value.title,
  description: post.value.subtitle || post.value.title,
  ogTitle: post.value.title,
  ogDescription: post.value.subtitle || undefined,
  ogType: 'article',
  ogImage: coverAbsolute.value,
  twitterImage: coverAbsolute.value
})
</script>

<template>
  <article
    v-if="post"
    class="mx-auto max-w-[760px] px-5 pb-28 pt-6 md:px-6 md:pt-10"
  >
    <NuxtLink
      to="/magazine"
      class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      아무 매거진
    </NuxtLink>

    <header class="mt-8 text-center md:mt-12">
      <span class="inline-flex items-center rounded-full bg-neutral-100 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-700">
        {{ post.category }}
      </span>
      <h1 class="mx-auto mt-5 max-w-[620px] text-[28px] font-bold leading-tight tracking-tight md:text-[42px]">
        {{ post.title }}
      </h1>
      <p
        v-if="post.subtitle"
        class="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-neutral-500 md:text-lg"
      >
        {{ post.subtitle }}
      </p>
      <p class="mt-6 text-[13px] font-bold text-neutral-500">
        <span class="text-neutral-950">{{ post.authorName }}</span>
        <span class="mx-2 text-neutral-300">·</span>{{ formatPostDate(post) }}
        <span class="mx-2 text-neutral-300">·</span>{{ post.readMinutes }}분 읽기
      </p>
    </header>

    <img
      v-if="post.coverImageUrl"
      :src="post.coverImageUrl"
      :alt="post.title"
      class="mt-10 w-full rounded-2xl bg-neutral-100 md:mt-14 md:rounded-3xl"
    >

    <MagazineBody
      :source="post.body"
      class="mt-10 md:mt-14"
    />

    <footer class="mt-16 border-t border-neutral-150 pt-8 text-center">
      <p class="text-sm text-neutral-500">
        Written by <strong class="text-neutral-950">{{ post.authorName }}</strong> · AMU
      </p>
      <NuxtLink
        to="/magazine"
        class="mt-6 inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold text-white"
      >
        다른 글 보기 →
      </NuxtLink>
    </footer>
  </article>
</template>
