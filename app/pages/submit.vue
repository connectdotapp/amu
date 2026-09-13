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
  <UContainer class="py-10">
    <div class="mx-auto max-w-2xl">
      <div v-if="!submittedId">
        <h1 class="text-2xl font-semibold tracking-tight">프로덕트 등록</h1>
        <p class="mt-1 text-muted">
          등록 후 아무의 검토를 거쳐 공개돼요. 승인까지 짧으면 몇 시간, 길면 며칠 걸릴 수 있어요.
        </p>

        <div class="mt-8">
          <ProductForm
            source="user"
            status="pending"
            submit-label="검토 요청"
            @submitted="onSubmitted"
          />
        </div>
      </div>

      <div v-else class="rounded-lg border border-default p-10 text-center">
        <UIcon name="i-lucide-check-circle" class="mx-auto size-10 text-primary" />
        <h2 class="mt-4 text-lg font-semibold">등록 요청 완료</h2>
        <p class="mt-1 text-muted">
          아무가 검토 후 공개해요. 승인되면 홈에서 볼 수 있어요.
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <UButton to="/" color="neutral" variant="outline">홈으로</UButton>
          <UButton
            color="neutral"
            variant="ghost"
            @click="submittedId = null"
          >
            하나 더 등록
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>
