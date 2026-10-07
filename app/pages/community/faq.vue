<script setup lang="ts">
useSeoMeta({
  title: '자주 묻는 질문',
  description: 'AMU 이용에 자주 묻는 질문과 답변을 모았어요.'
})

type Faq = {
  q: string
  a: string
}

const items: Faq[] = [
  {
    q: 'AMU 는 어떤 서비스인가요?',
    a: '아무거나 먹지 않는 새, 아무가 큐레이션하는 앱·웹·프로그램 발견 공간이에요. 매주 새로운 테마의 컬렉션과 신상 앱 소개를 통해 "쓸만한 것" 만 추려서 보여드려요.'
  },
  {
    q: '어떤 앱이 올라오나요?',
    a: '라이프스타일, 생산성, 디자인, 재테크, 공부 등 다양한 카테고리의 모바일 앱·웹 서비스·프로그램을 소개해요. 운영진이 직접 사용해보고 선정한 "AMU Pick" 과 사용자가 등록한 앱이 함께 올라와요.'
  },
  {
    q: '제가 만든 앱도 등록할 수 있나요?',
    a: '네, 로그인 후 상단 "등록하기" 버튼으로 신청할 수 있어요. 운영진 검수를 거쳐 공개되고, 평균 1-3일 정도 소요돼요.'
  },
  {
    q: '로그인은 어떻게 하나요?',
    a: '구글 또는 카카오 계정으로 로그인할 수 있어요. 두 방식은 각각 다른 계정으로 생성되니, 처음 가입한 방식으로 계속 로그인해주세요.'
  },
  {
    q: '유료 광고나 협찬이 섞여있나요?',
    a: '현재는 100% 큐레이션 기반이에요. 광고·협찬·유료 노출은 일절 없고, 운영진의 사용 경험을 기준으로 선별해요. 향후 명확한 광고 표기와 함께 소개 모델을 검토할 수 있어요.'
  },
  {
    q: '계정을 삭제하고 싶어요.',
    a: '설정 > 위험 영역 > "계정 삭제하기" 에서 직접 삭제하실 수 있어요. 계정과 북마크는 즉시 영구 삭제되고, 작성한 댓글·업보트는 식별 정보가 분리된 채 유지돼요.'
  },
  {
    q: '문의는 어디로 하면 되나요?',
    a: 'connectdot.app@gmail.com 으로 메일 보내주세요. 피드백·버그 리포트·제휴 문의 모두 환영이에요.'
  }
]

const openIndex = ref<number | null>(0)
function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-14">
    <p class="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Community</p>
    <h1 class="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">자주 묻는 질문</h1>
    <p class="mt-4 text-base text-neutral-600 dark:text-neutral-400">
      AMU 이용 중 궁금한 점을 모았어요
    </p>

    <section class="mt-10 divide-y divide-neutral-150 overflow-hidden rounded-3xl border border-neutral-150 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
      <div v-for="(item, i) in items" :key="i">
        <button
          type="button"
          class="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
          :aria-expanded="openIndex === i"
          @click="toggle(i)"
        >
          <span class="text-[15px] font-semibold tracking-tight">{{ item.q }}</span>
          <UIcon
            :name="openIndex === i ? 'i-lucide-minus' : 'i-lucide-plus'"
            class="mt-1 size-4 shrink-0 text-neutral-500"
          />
        </button>
        <div
          v-show="openIndex === i"
          class="px-6 pb-6 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300"
        >
          {{ item.a }}
        </div>
      </div>
    </section>

    <p class="mt-8 text-center text-sm text-neutral-500">
      찾는 답이 없다면
      <a href="mailto:connectdot.app@gmail.com" class="font-semibold text-neutral-900 underline underline-offset-2 dark:text-neutral-100">
        connectdot.app@gmail.com
      </a>
      으로 문의해주세요
    </p>
  </div>
</template>
