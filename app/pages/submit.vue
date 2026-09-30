<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

useSeoMeta({
  title: '프로덕트 등록',
  description: '프로덕트를 등록하고 아무의 심사를 기다려 보세요.',
  robots: 'noindex, nofollow'
})

const toast = useToast()
const submittedId = ref<string | null>(null)

function onSubmitted(id: string) {
  submittedId.value = id
  toast.add({
    title: '등록됐어요',
    description: '아무가 검토한 후 공개됩니다.',
    color: 'success'
  })
}
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <template v-if="!submittedId">
      <h1 class="text-3xl font-bold tracking-tighter sm:text-4xl">프로덕트 등록</h1>
      <p class="mt-2 text-neutral-500">
        등록 후 아무의 검토를 거쳐 공개돼요.
      </p>

      <div class="mt-10 rounded-3xl bg-neutral-100 p-6 sm:p-8 dark:bg-neutral-800">
        <ProductForm
          source="user"
          status="pending"
          submit-label="검토 요청"
          @submitted="onSubmitted"
        />
      </div>
    </template>

    <div
      v-else
      class="mt-10 rounded-3xl bg-neutral-100 p-16 text-center dark:bg-neutral-800"
    >
      <UIcon name="i-lucide-check-circle-2" class="mx-auto size-10" />
      <h2 class="mt-4 text-lg font-bold tracking-tight">등록 요청 완료</h2>
      <p class="mt-2 text-neutral-500">
        아무가 검토 후 공개해요.
      </p>
      <div class="mt-8 flex justify-center gap-2">
        <UButton to="/" color="neutral" variant="solid">홈으로</UButton>
        <UButton
          color="neutral"
          variant="outline"
          @click="submittedId = null"
        >
          하나 더 등록
        </UButton>
      </div>
    </div>
  </div>
</template>
