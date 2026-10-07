<script setup lang="ts">
useSeoMeta({
  title: '개인정보처리방침',
  description: 'AMU 개인정보 처리 방침.'
})

const updated = '2026-10-07'
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 py-16">
    <p class="text-sm text-neutral-500">최종 업데이트 · {{ updated }}</p>
    <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">개인정보처리방침</h1>

    <p class="mt-6 rounded-2xl bg-neutral-100 p-4 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      본 방침은 초안입니다. 실서비스 오픈 전 개인정보 보호법 준수 여부에 대한 전문가 검토가 필요합니다.
    </p>

    <div class="mt-10 space-y-10 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">1. 수집·이용 목적</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>회원 가입 및 계정 인증</li>
          <li>프로덕트 등록·댓글·업보트·북마크 등 서비스 기능 제공</li>
          <li>서비스 개선을 위한 통계·분석</li>
          <li>부정 이용 방지 및 이용 문의 응대</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">2. 수집 항목</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li><strong>회원가입 시</strong>: 이메일 주소, 이름(표시명), 프로필 이미지 URL (Google 로그인 시 자동 수집)</li>
          <li><strong>서비스 이용 중</strong>: 등록한 프로덕트 정보, 작성한 댓글, 업보트·북마크 기록</li>
          <li><strong>자동 수집</strong>: IP, User-Agent, 접속 로그, 쿠키·유사 기술을 통한 이용 통계</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">3. 보유·이용 기간</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>회원 정보: 탈퇴 요청 시까지 (탈퇴 후 30일 내 파기)</li>
          <li>이용 로그: 관련 법령이 정하는 기간 (통신비밀보호법 등)</li>
          <li>서비스 부정 이용 기록: 부정 이용 방지 목적으로 최대 1년 보관</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">4. 제3자 제공</h2>
        <p class="mt-3">
          운영자는 원칙적으로 사용자의 개인정보를 외부에 제공하지 않습니다. 다만 법령에 따른 요구가 있거나 사용자 동의가 있는 경우 예외로 합니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">5. 처리 위탁</h2>
        <p class="mt-3">
          서비스 운영을 위해 아래 업체에 개인정보 처리를 위탁합니다.
        </p>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li><strong>Google LLC</strong> — Firebase 인증·데이터베이스·스토리지 (미국)</li>
          <li><strong>Google LLC</strong> — Google Analytics 4를 통한 이용 통계 (미국)</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">6. 쿠키·유사 기술 사용 안내</h2>
        <p class="mt-3">
          AMU는 서비스 이용 분석과 사용자 편의 제공을 위해 쿠키·로컬스토리지 등 유사 기술을 사용합니다.
        </p>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li><strong>목적</strong>: 로그인 유지, 북마크·설정 저장, 익명 이용 통계 수집</li>
          <li><strong>저장 항목</strong>: Firebase Auth 세션 토큰, Google Analytics 익명 식별자, 색상 모드·언어 설정</li>
          <li><strong>Google Analytics 4</strong>: 페이지 조회·클릭·검색어 등 익명화된 행동 데이터를 Google 서버로 전송하며 개인 식별 정보는 포함되지 않습니다. 보관 기간은 최대 14개월입니다.</li>
          <li><strong>거부 방법</strong>: 브라우저 설정에서 쿠키 차단 또는 <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" class="underline underline-offset-2">Google Analytics 옵트아웃 애드온</a> 설치로 수집을 거부할 수 있습니다. 단 이 경우 일부 기능이 제한될 수 있습니다.</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">7. 사용자의 권리</h2>
        <p class="mt-3">
          사용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수 있습니다. 요청은 아래 연락처로 접수할 수 있습니다.
        </p>
        <p class="mt-3">
          <strong>계정 삭제</strong>는 로그인 후 <NuxtLink to="/settings" class="underline underline-offset-2">설정</NuxtLink> 페이지에서 직접 수행할 수 있습니다. 삭제 시 다음 범위가 즉시 영구 삭제됩니다.
        </p>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>Firebase Auth 계정 (이메일·이름·프로필 이미지)</li>
          <li>프로필 문서 및 북마크 전체</li>
        </ul>
        <p class="mt-3">
          작성한 댓글·업보트·제출한 프로덕트는 다른 사용자의 맥락 보존을 위해 계정 식별 정보가 분리된 상태로 유지됩니다. 이들까지 완전 삭제를 원하시면 아래 보호책임자 메일로 요청해주세요. 접수 후 30일 이내 처리합니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">8. 파기 절차·방법</h2>
        <p class="mt-3">
          보유 기간이 종료되거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구 불가능한 방식으로 삭제하며, 종이 문서는 분쇄·소각합니다.
        </p>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">9. 안전성 확보 조치</h2>
        <ul class="mt-3 list-disc space-y-2 pl-5">
          <li>Firebase Auth를 통한 인증 및 세션 관리</li>
          <li>Firestore 보안 규칙을 통한 접근 통제</li>
          <li>서비스 데이터 저장·전송 시 TLS 암호화</li>
        </ul>
      </section>

      <section>
        <h2 class="text-lg font-bold text-neutral-950 dark:text-neutral-50">10. 개인정보 보호책임자</h2>
        <ul class="mt-3 space-y-1">
          <li>이름: 조은솔</li>
          <li>이메일: <a href="mailto:connectdot.app@gmail.com" class="underline underline-offset-2">connectdot.app@gmail.com</a></li>
        </ul>
      </section>
    </div>
  </div>
</template>
