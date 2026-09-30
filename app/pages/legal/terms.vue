<script setup lang="ts">
useSeoMeta({
  title: '이용약관',
  description: 'AMU 서비스 이용약관.'
})

const updated = '2026-09-15'
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <p class="text-sm text-neutral-500">최종 업데이트 · {{ updated }}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tighter sm:text-4xl">이용약관</h1>

    <p class="mt-6 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      본 약관은 초안입니다. 실서비스 오픈 전 법률 전문가 검토가 필요합니다.
    </p>

    <div class="mt-10 space-y-10 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">1. 서비스 소개</h2>
        <p class="mt-3">
          AMU(이하 "서비스")는 최신 앱·웹·프로그램을 큐레이션하고, 사용자가 자신의 프로덕트를 등록·공유할 수 있는 커뮤니티 서비스입니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">2. 계정</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>사용자는 Google 계정 또는 이메일로 회원가입할 수 있습니다.</li>
          <li>계정 정보의 정확성과 보안 관리 책임은 사용자에게 있습니다.</li>
          <li>운영자는 부정 이용이 확인된 계정을 사전 통지 후 이용 제한할 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">3. 콘텐츠 저작권</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>사용자가 등록한 프로덕트 정보·이미지의 저작권은 등록한 사용자에게 귀속됩니다.</li>
          <li>사용자는 등록 시 AMU가 해당 콘텐츠를 서비스 내 표시·전송·복제·2차 가공(썸네일 리사이즈 등)할 수 있는 비독점 라이선스를 제공하는 것으로 간주됩니다.</li>
          <li>타인의 저작권·상표권·초상권을 침해하는 콘텐츠는 등록할 수 없으며, 신고 시 삭제됩니다.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">4. 사용자 의무</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>허위·과장·타 사용자를 기만하는 프로덕트 정보를 등록하지 않습니다.</li>
          <li>스팸, 광고성 반복 등록, 혐오·차별·불법 콘텐츠 게시를 금합니다.</li>
          <li>서비스의 정상적 운영을 방해하는 기술적 행위(자동화 봇, 대량 스크래핑 등)를 하지 않습니다.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">5. 큐레이션 심사</h2>
        <p class="mt-3">
          사용자가 등록한 프로덕트는 운영자의 검토를 거쳐 공개됩니다. 운영자는 서비스 방향에 맞지 않는 콘텐츠의 게시를 거절할 수 있으며, 사유를 별도로 안내하지 않을 수 있습니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">6. 서비스 변경·중단</h2>
        <p class="mt-3">
          운영자는 서비스 개선, 유지보수, 또는 불가피한 사유가 있는 경우 서비스의 일부 또는 전부를 변경·중단할 수 있으며, 중요한 변경은 사전 공지합니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">7. 면책</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>사용자가 등록한 콘텐츠의 정확성·안전성에 대해 운영자는 보증하지 않습니다.</li>
          <li>제3자 서비스(외부 링크된 프로덕트 등)와의 거래·이용으로 발생한 손해에 대해 운영자는 책임지지 않습니다.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">8. 준거법·관할</h2>
        <p class="mt-3">
          본 약관은 대한민국 법률에 따르며, 서비스 이용과 관련한 분쟁은 민사소송법상 관할 법원을 관할로 합니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">9. 문의</h2>
        <p class="mt-3">
          약관 관련 문의는
          <a href="mailto:eslabsofficial@gmail.com" class="underline underline-offset-2">eslabsofficial@gmail.com</a>
          으로 보내주세요.
        </p>
      </section>
    </div>
  </div>
</template>
