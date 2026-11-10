<script setup lang="ts">
// 등록한 본인이 자기 프로덕트를 수정하는 페이지. 관리자도 들어올 수 있다.
definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: '프로덕트 수정',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const id = String(route.params.id)
const { data: product, pending } = useProductById(id)
const user = useCurrentUser()
const toast = useToast()

const isAdmin = ref(false)
watchEffect(async () => {
  if (!user.value) { isAdmin.value = false; return }
  try {
    isAdmin.value = !!(await user.value.getIdTokenResult()).claims.admin
  } catch { isAdmin.value = false }
})

const canEdit = computed(() => !!product.value && !!user.value && (user.value.uid === product.value.submittedBy || isAdmin.value))

function onSubmitted(pid: string) {
  toast.add({ title: '저장됐어요', color: 'success' })
  navigateTo(`/products/${product.value?.slug || pid}`)
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <NuxtLink :to="`/products/${product?.slug || id}`" class="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-950 dark:hover:text-neutral-50">
      <UIcon name="i-lucide-arrow-left" class="size-4" />
      프로덕트로 돌아가기
    </NuxtLink>

    <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">프로덕트 수정</h1>
    <p v-if="product" class="mt-2 text-neutral-500">{{ product.name }}</p>

    <div v-if="product && canEdit" class="mt-10 rounded-3xl bg-neutral-150 p-6 sm:p-8 dark:bg-neutral-800">
      <ProductForm
        :product="product"
        submit-label="저장"
        @submitted="onSubmitted"
      />
    </div>

    <div v-else-if="pending" class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <p class="text-neutral-500">불러오는 중…</p>
    </div>

    <div v-else class="mt-10 rounded-3xl bg-neutral-150 p-16 text-center dark:bg-neutral-800">
      <p class="text-neutral-500">직접 등록한 프로덕트만 수정할 수 있어요.</p>
    </div>
  </div>
</template>
