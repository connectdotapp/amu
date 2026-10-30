<script setup lang="ts">
definePageMeta({ middleware: ['admin'] })

useSeoMeta({
  title: '매거진 관리',
  robots: 'noindex, nofollow'
})

const { data: posts, pending } = useAllPostsAdmin()
</script>

<template>
  <div class="mx-auto max-w-3xl px-5 py-10 md:px-6">
    <NuxtLink
      to="/admin"
      class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50"
    >
      <UIcon
        name="i-lucide-arrow-left"
        class="size-4"
      />
      관리자
    </NuxtLink>

    <div class="mt-6 flex items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          매거진 관리
        </h1>
        <p class="mt-2 text-neutral-500">
          글을 쓰고, 고치고, 발행해요.
        </p>
      </div>
      <UButton
        to="/admin/magazine/new"
        color="neutral"
        icon="i-lucide-pen-line"
        size="lg"
      >
        새 글 쓰기
      </UButton>
    </div>

    <div
      v-if="pending"
      class="mt-10 py-10 text-center text-sm text-neutral-400"
    >
      불러오는 중…
    </div>

    <ul
      v-else-if="posts.length"
      class="mt-10 space-y-2"
    >
      <li
        v-for="p in posts"
        :key="p.id"
      >
        <NuxtLink
          :to="`/admin/magazine/${p.id}/edit`"
          class="flex items-center gap-4 rounded-2xl bg-neutral-150 p-3 transition hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          <div class="aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl bg-white dark:bg-neutral-900">
            <img
              v-if="p.coverImageUrl"
              :src="p.coverImageUrl"
              alt=""
              class="size-full object-cover"
            >
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span
                class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="p.status === 'published' ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'bg-white text-neutral-500 dark:bg-neutral-900'"
              >
                {{ p.status === 'published' ? '발행됨' : '초안' }}
              </span>
              <span class="truncate text-xs text-neutral-500">{{ p.category }}</span>
            </div>
            <div class="mt-1 truncate font-bold tracking-tight">{{ p.title }}</div>
            <div class="mt-0.5 truncate text-xs text-neutral-500">/magazine/{{ p.slug }} · {{ formatPostDate(p) }}</div>
          </div>
          <UIcon
            name="i-lucide-chevron-right"
            class="size-4 shrink-0 text-neutral-400"
          />
        </NuxtLink>
      </li>
    </ul>

    <div
      v-else
      class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800"
    >
      <p class="text-neutral-500">
        아직 쓴 글이 없어요.
      </p>
    </div>
  </div>
</template>
