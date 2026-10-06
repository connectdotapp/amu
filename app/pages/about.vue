<script setup lang="ts">
useSeoMeta({
  title: 'About',
  description: '한국 1인개발자가 만든 앱 중 쓸만한 것만 아무가 뽑는다. AMU의 큐레이션 이야기.'
})
</script>

<template>
  <div>
    <!-- Section 1: Hero -->
    <section class="mx-auto max-w-[720px] px-6 pt-20 pb-24 sm:pt-28">
      <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        About AMU
      </div>
      <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        아무거나 먹지 않는 새
      </h1>
      <p class="mt-6 text-lg font-medium tracking-tight text-neutral-700 sm:text-xl">
        한국 1인개발자가 만든 앱 중 쓸만한 것만 아무가 뽑는다.
      </p>
    </section>

    <!-- Section 2: 왜 만들었나 -->
    <section class="bg-neutral-100 py-20 dark:bg-neutral-900">
      <div class="mx-auto max-w-[720px] px-6">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          Why
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          왜 아무를 만들었나
        </h2>

        <div class="mt-10 space-y-6 text-[16px] leading-[1.75] text-neutral-700 dark:text-neutral-300">
          <p>
            앱스토어 추천은 광고가 섞여있다. 상위 노출은 돈이 결정한다. 매체 한번 안 타고 묻히는 좋은 앱이 매일 등장한다. 특히 한국 1인개발자가 만든 작품은 노출 기회조차 받지 못하는 경우가 많다.
          </p>
          <p>
            Product Hunt 는 영어 장벽이 있다. 디스콰이엇은 수다와 토론이 중심이다. 그 사이에 "조용히 발견만 하는" 공간이 비어있었다.
          </p>
          <p>
            아무는 그 틈을 메운다. 광고 없이 알고리즘 없이 사람이 직접 고른 한국 1인개발 앱만 소개한다.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 3: 아무가 하는 일 -->
    <section class="mx-auto max-w-[720px] px-6 py-20">
      <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        What
      </div>
      <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        아무가 하는 일
      </h2>

      <div class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">01</div>
          <h3 class="mt-2 text-lg font-bold tracking-tight">매주 큐레이션</h3>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            한국 1인개발자가 만든 앱 중 쓸만한 것만 매주 몇 개씩 소개한다. 광고 집행하지 않는다.
          </p>
        </div>

        <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">02</div>
          <h3 class="mt-2 text-lg font-bold tracking-tight">AMU Pick</h3>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            심사를 통과한 작품에만 수여하는 뱃지. 아무나 받지 못한다. 희소성이 신뢰다.
          </p>
        </div>

        <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">03</div>
          <h3 class="mt-2 text-lg font-bold tracking-tight">쇼룸</h3>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            메이커가 숫자로 어필할 공간. MAU 매출 팀규모 시작시점을 원하는 만큼만 공개한다.
          </p>
        </div>

        <div class="rounded-3xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <div class="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-500">04</div>
          <h3 class="mt-2 text-lg font-bold tracking-tight">메이커 이야기</h3>
          <p class="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            셀프 1분 영상 또는 이메일 Q&amp;A 로 메이커가 자기 작품의 배경을 공유한다.
          </p>
        </div>
      </div>
    </section>

    <!-- Section 4: AMU Pick 기준 -->
    <section class="bg-neutral-100 py-20 dark:bg-neutral-900">
      <div class="mx-auto max-w-[720px] px-6">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          Criteria
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          AMU Pick 기준
        </h2>

        <div class="mt-10 space-y-6">
          <div>
            <div class="flex items-baseline gap-3">
              <span class="text-xl font-bold text-[#F2293A] tabular-nums">01</span>
              <h3 class="text-lg font-bold tracking-tight">완성도</h3>
            </div>
            <p class="mt-2 pl-8 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              사용에 지장이 없는 수준의 완성이 1차 통과 조건이다. 베타·테스트 중이어도 핵심 기능이 안정적이면 심사 대상이다.
            </p>
          </div>

          <div>
            <div class="flex items-baseline gap-3">
              <span class="text-xl font-bold text-[#F2293A] tabular-nums">02</span>
              <h3 class="text-lg font-bold tracking-tight">독창성</h3>
            </div>
            <p class="mt-2 pl-8 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              기존 레드오션을 그대로 복제한 작품은 뽑지 않는다. 작은 각도라도 비명백한 접근이 있어야 한다.
            </p>
          </div>

          <div>
            <div class="flex items-baseline gap-3">
              <span class="text-xl font-bold text-[#F2293A] tabular-nums">03</span>
              <h3 class="text-lg font-bold tracking-tight">메이커 성실성</h3>
            </div>
            <p class="mt-2 pl-8 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              유저 피드백에 응답하는 운영 태도를 본다. 출시 후 방치된 작품은 뽑지 않는다.
            </p>
          </div>

          <div>
            <div class="flex items-baseline gap-3">
              <span class="text-xl font-bold text-[#F2293A] tabular-nums">04</span>
              <h3 class="text-lg font-bold tracking-tight">톤 적합성</h3>
            </div>
            <p class="mt-2 pl-8 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
              아무의 큐레이션 정체성과 맞는 작품을 뽑는다. 광고·도박·성인 콘텐츠는 다루지 않는다.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: 메이커에게 -->
    <section class="mx-auto max-w-[720px] px-6 py-20">
      <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        For Makers
      </div>
      <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        메이커에게
      </h2>

      <div class="mt-10 space-y-5 text-[16px] leading-[1.75] text-neutral-700 dark:text-neutral-300">
        <div>
          <strong class="text-neutral-950 dark:text-neutral-50">등록은 무료다.</strong>
          App Store URL 한 개만 붙여넣으면 자동으로 메타데이터가 채워진다. Google Play 는 수동 입력 지원.
        </div>
        <div>
          <strong class="text-neutral-950 dark:text-neutral-50">심사는 영업일 기준 24시간 안에 응답한다.</strong>
          통과·반려 어느 쪽이든 짧은 피드백을 함께 보낸다.
        </div>
        <div>
          <strong class="text-neutral-950 dark:text-neutral-50">AMU Pick 뱃지를 받으면.</strong>
          홈 상단 Today's Pick 노출. 뉴스레터(예정) 포함. 쇼룸 영역 확장.
        </div>
        <div>
          <strong class="text-neutral-950 dark:text-neutral-50">쇼룸은 선택이다.</strong>
          MAU 매출 팀규모 시작시점은 원하는 만큼만 공개한다. 비공개로 둬도 등록 가능.
        </div>
      </div>

      <NuxtLink
        to="/submit"
        class="mt-10 inline-flex items-center gap-2 rounded-full bg-[#F2293A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#D81A2E]"
      >
        지금 등록하기
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </NuxtLink>
    </section>

    <!-- Section 6: 유저에게 -->
    <section class="bg-neutral-100 py-20 dark:bg-neutral-900">
      <div class="mx-auto max-w-[720px] px-6">
        <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
          For Users
        </div>
        <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          유저에게
        </h2>

        <div class="mt-10 space-y-5 text-[16px] leading-[1.75] text-neutral-700 dark:text-neutral-300">
          <div>
            <strong class="text-neutral-950 dark:text-neutral-50">발견.</strong>
            카테고리 메뉴와 홈의 테마 섹션으로 둘러본다. 매주 월요일 Today's Pick 이 업데이트된다.
          </div>
          <div>
            <strong class="text-neutral-950 dark:text-neutral-50">저장.</strong>
            마음에 드는 작품은 북마크한다. 로그인하면 어디서든 다시 찾을 수 있다.
          </div>
          <div>
            <strong class="text-neutral-950 dark:text-neutral-50">참여.</strong>
            업보트와 댓글로 메이커에게 신호를 보낸다. 좋은 반응은 다음 Pick 선정에 반영된다.
          </div>
          <div>
            <strong class="text-neutral-950 dark:text-neutral-50">구독.</strong>
            뉴스레터는 준비 중이다. 열리면 매주 월요일 메일로 Pick 을 받을 수 있다.
          </div>
        </div>
      </div>
    </section>

    <!-- Section 7: 연락처 -->
    <section class="mx-auto max-w-[720px] px-6 py-20">
      <div class="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500">
        Contact
      </div>
      <h2 class="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        아무에게 연락하기
      </h2>

      <dl class="mt-10 space-y-4 text-[16px]">
        <div class="flex items-baseline gap-6">
          <dt class="w-28 shrink-0 text-sm font-semibold text-neutral-500">이메일</dt>
          <dd>
            <a href="mailto:eslabsofficial@gmail.com" class="font-medium hover:underline">
              eslabsofficial@gmail.com
            </a>
          </dd>
        </div>
        <div class="flex items-baseline gap-6">
          <dt class="w-28 shrink-0 text-sm font-semibold text-neutral-500">인스타그램</dt>
          <dd>
            <a href="https://instagram.com" target="_blank" class="font-medium hover:underline">
              @아무
            </a>
          </dd>
        </div>
        <div class="flex items-baseline gap-6">
          <dt class="w-28 shrink-0 text-sm font-semibold text-neutral-500">제휴·협업</dt>
          <dd class="text-neutral-700 dark:text-neutral-300">
            이메일로 "제휴" 또는 "협업" 을 제목에 포함해 보내주세요.
          </dd>
        </div>
      </dl>

      <p class="mt-16 border-t border-neutral-150 pt-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
        아무거나 먹지 않는 새, 아무.
      </p>
    </section>
  </div>
</template>
