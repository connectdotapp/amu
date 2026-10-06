<script setup lang="ts">
useSeoMeta({
  title: 'About',
  description: '한국 1인개발자가 만든 쓸만한 앱만 매주 소개하는 큐레이션 매체'
})

defineOgImageComponent('Default', {
  eyebrow: 'About AMU',
  title: '아무를 아시나요?',
  description: '한국 1인개발자가 만든 쓸만한 앱만 매주 소개해요'
})

// FAQ 아코디언 상태
const openFaq = ref<number | null>(0)
function toggleFaq(i: number) {
  openFaq.value = openFaq.value === i ? null : i
}

const faqs = [
  {
    q: 'AMU Pick 받으면 뭐가 좋나요?',
    a: '홈 상단 Today\'s Pick에 배치되고 뉴스레터(예정)에 포함돼요 쇼룸 영역이 확장되고 메이커 인터뷰 기회가 제공돼요'
  },
  {
    q: '심사 기준이 뭔가요?',
    a: '완성도 · 독창성 · 메이커 성실성 · 톤 적합성 네 가지예요 각 항목을 통과한 작품에만 AMU Pick 뱃지가 수여돼요'
  },
  {
    q: '등록은 얼마인가요?',
    a: '무료예요 광고도 안 받아요 심사만 통과하면 끝이에요'
  },
  {
    q: '심사는 얼마나 걸리나요?',
    a: '영업일 기준 24시간 안에 결과를 알려드려요 통과 · 반려 모두 짧은 피드백을 함께 보내요'
  },
  {
    q: 'Google Play 앱도 등록 가능한가요?',
    a: '가능해요 App Store는 URL 자동 입력을 지원하고 Google Play는 현재 수동 입력이에요'
  },
  {
    q: '쇼룸 숫자는 꼭 공개해야 하나요?',
    a: '선택이에요 MAU · 매출 · 팀 규모 모두 비공개 가능해요 공개한 항목만 표시돼요'
  }
]

// 스크롤 fade-up 애니메이션
onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('in')
      })
    },
    { threshold: 0.12 }
  )
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
})
</script>

<template>
  <div class="about-page">
    <!-- 1. HERO -->
    <section class="hero">
      <div class="hero-deco d1" />
      <div class="hero-deco d2" />
      <div class="hero-deco d3" />
      <div class="hero-deco d4" />

      <div class="ph mascot">
        <img src="/logo-2.png" alt="AMU 마스코트" class="mascot-img">
      </div>
      <h1 class="fade-up">
        <span class="line">아무를</span>
        <span class="line">아시나요<span class="q-red">?</span></span>
      </h1>
      <p class="fade-up d1">
        한국 1인개발자가 만든 쓸만한 앱만<br>
        매주 소개하는 큐레이션 매체예요
      </p>
      <div class="scroll-hint">SCROLL ↓</div>
    </section>

    <!-- 2. STATS -->
    <section class="stats">
      <div class="container">
        <h2 class="fade-up">
          숫자가 말해주는 <span class="tag">문제</span>
        </h2>
        <div class="stat-grid">
          <div class="stat y fade-up">
            <div class="num">1,500<span class="u">개</span></div>
            <div class="label">
              매일 쏟아지는 신규 앱
              <span class="sub">앱스토어 + 플레이스토어 기준</span>
            </div>
          </div>
          <div class="stat r fade-up d1">
            <div class="num">0<span class="u">개</span></div>
            <div class="label">
              광고 없이 노출되는 앱
              <span class="sub">1인개발자가 매체 못 타는 이유</span>
            </div>
          </div>
          <div class="stat b fade-up d2">
            <div class="num">11<span class="u">분</span></div>
            <div class="label">
              하루 평균 앱 찾기 시간
              <span class="sub">1년이면 67시간이에요</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. THESIS -->
    <section class="thesis">
      <div class="narrow">
        <div class="thesis-chip fade-up">✦ 그래서 아무가 만들어졌어요</div>
        <h2 class="fade-up d1">
          광고도 알고리즘도 없이<br>
          <span class="em-yel">사람이</span> 직접 뽑는<br>
          <span class="em-red">큐레이션 매체</span>
        </h2>
        <p class="sub fade-up d2">
          매주 월요일 아무가 고른 한국 1인개발 앱 3개
        </p>
      </div>
    </section>

    <!-- 4. 마스코트 소개 -->
    <section class="mascot-intro">
      <div class="container">
        <div class="mascot-intro-grid">
          <div class="fade-up">
            <div class="eyebrow">Meet AMU</div>
            <h2>
              아무거나 안 먹는<br>
              <span class="em">새</span>, 아무
            </h2>
            <p>부리에 걸린다고 다 삼키지 않아요</p>
            <p>오래 살펴보고 마음에 드는 것만 골라요</p>
            <div class="quote">✦ 그 태도가 그대로 큐레이션 기준이 됐어요</div>
          </div>
          <div class="mascot-poses fade-up d1">
            <div class="ph">아무 · 호기심</div>
            <div class="ph">아무 · 발견</div>
            <div class="ph">아무 · 거절</div>
            <div class="ph">아무 · 수락</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. FEATURES -->
    <section class="features">
      <div class="container">
        <div class="head fade-up">
          <div class="eyebrow">What AMU Does</div>
          <h2>네 가지만 잘 해요</h2>
          <p>딱 네 가지만 · 잘 하기 위해서요</p>
        </div>
        <div class="feature-grid">
          <div class="feature c1 fade-up">
            <div class="num">01 · WEEKLY</div>
            <div class="ph f-ph">[Today's Pick UI]</div>
            <h3>매주 월요일<br>3개</h3>
            <p>한국 1인개발자가 만든 작품 중 쓸만한 것만<br>매주 아침 메일함에 도착해요</p>
          </div>
          <div class="feature c2 fade-up d1">
            <div class="num">02 · PICK</div>
            <div class="ph f-ph">[AMU Pick 뱃지]</div>
            <h3>AMU Pick<br>뱃지</h3>
            <p>심사 통과한 작품에만 수여돼요<br>아무나 못 받는 희소한 신뢰 신호예요</p>
          </div>
          <div class="feature c3 fade-up">
            <div class="num">03 · SHOWROOM</div>
            <div class="ph f-ph">[쇼룸 스크린샷]</div>
            <h3>숫자로 어필하는<br>쇼룸</h3>
            <p>MAU · 매출 · 팀 규모 · 시작 시점<br>공개하고 싶은 만큼만 보여줘요</p>
          </div>
          <div class="feature c4 fade-up d1">
            <div class="num">04 · STORY</div>
            <div class="ph f-ph">[1분 인터뷰 영상]</div>
            <h3>메이커의<br>1분 영상</h3>
            <p>왜 만들었나 · 어떻게 만들었나<br>셀프 1분 영상 또는 Q&amp;A로 전해요</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. BEFORE/AFTER -->
    <section class="compare">
      <div class="container">
        <div class="head fade-up">
          <div class="eyebrow">Before / After</div>
          <h2>이렇게 달라져요</h2>
        </div>
        <div class="compare-grid">
          <div class="compare-card before fade-up">
            <span class="tag">BEFORE</span>
            <h3>혼자 찾던 시절</h3>
            <ul>
              <li>앱스토어 추천은 광고</li>
              <li>리뷰 평점은 조작 의심</li>
              <li>검색해도 1위는 결제한 앱</li>
              <li>Product Hunt는 영어 장벽</li>
              <li>매번 10분씩 서핑</li>
            </ul>
          </div>
          <div class="compare-card after fade-up d1">
            <span class="tag">AFTER</span>
            <h3>아무가 뽑아줄 때</h3>
            <ul>
              <li>사람이 직접 고른 결과</li>
              <li>심사 통과한 작품만 노출</li>
              <li>1위 = 광고가 아닌 선정</li>
              <li>한국 메이커 한국어 중심</li>
              <li>매주 1분이면 끝</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. PROCESS -->
    <section class="process">
      <div class="container">
        <div class="eyebrow fade-up">How AMU Pick Works</div>
        <h2 class="fade-up d1">선정은 이렇게 진행해요</h2>
        <div class="process-flow">
          <div class="process-step fade-up">
            <div class="circle">1</div>
            <h4>등록</h4>
            <p>메이커가 URL 하나로 등록</p>
          </div>
          <div class="process-step fade-up d1">
            <div class="circle">2</div>
            <h4>심사</h4>
            <p>아무가 직접 사용·검증</p>
          </div>
          <div class="process-step fade-up d2">
            <div class="circle">3</div>
            <h4>승인</h4>
            <p>24시간 안에 결과 통지</p>
          </div>
          <div class="process-step fade-up d3">
            <div class="circle">4</div>
            <h4>노출</h4>
            <p>홈 상단 · 뉴스레터</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 8. SPOTLIGHT -->
    <section class="spotlight">
      <div class="container">
        <div class="head fade-up">
          <div class="eyebrow">Showroom Example</div>
          <h2>쇼룸은 이런 모습이에요</h2>
          <p>작은 메이커도 숫자로 어필할 수 있도록</p>
        </div>
        <div class="showroom-sample fade-up d1">
          <div class="glow" />
          <div class="pitch">
            "매주 500명이 쓰는 집중 타이머<br>
            월 매출 300만원 돌파 · 혼자서요"
          </div>
          <div class="by">by 메이커 (익명 예시)</div>
          <div class="showroom-stats">
            <div class="s c1">
              <div class="l">Monthly Users</div>
              <div class="v">500+</div>
            </div>
            <div class="s c2">
              <div class="l">Monthly Revenue</div>
              <div class="v">300만+</div>
            </div>
            <div class="s c3">
              <div class="l">Team Size</div>
              <div class="v">1</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 9. BENEFITS -->
    <section class="benefits">
      <div class="container">
        <div class="head fade-up">
          <div class="eyebrow">Why Join</div>
          <h2>AMU만의 특별한 점</h2>
          <p>작은 서비스지만 확실한 약속이에요</p>
        </div>
        <div class="benefit-grid">
          <div class="benefit fade-up">
            <div class="check">✓</div>
            <div>
              <h4>광고 없음</h4>
              <p>어떤 자리도 돈으로 살 수 없어요</p>
            </div>
          </div>
          <div class="benefit fade-up d1">
            <div class="check">✓</div>
            <div>
              <h4>알고리즘 없음</h4>
              <p>사람이 매번 고르고 검증해요</p>
            </div>
          </div>
          <div class="benefit fade-up">
            <div class="check">✓</div>
            <div>
              <h4>한국 중심</h4>
              <p>한국 1인개발자 작품만 다뤄요</p>
            </div>
          </div>
          <div class="benefit fade-up d1">
            <div class="check">✓</div>
            <div>
              <h4>영문 번역 피로 X</h4>
              <p>한국어로 쓰고 한국어로 읽어요</p>
            </div>
          </div>
          <div class="benefit fade-up">
            <div class="check">✓</div>
            <div>
              <h4>무료 등록</h4>
              <p>메이커 등록은 돈 안 들어요</p>
            </div>
          </div>
          <div class="benefit fade-up d1">
            <div class="check">✓</div>
            <div>
              <h4>조용한 발견</h4>
              <p>수다 없이 발견만 · 참여는 선택</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 10. TESTIMONIAL -->
    <section class="testimonial">
      <div class="narrow">
        <div class="mark fade-up">"</div>
        <blockquote class="fade-up d1">
          앱스토어 <span class="em1">1위</span> 말고<br>
          <span class="em2">그다음</span>이 궁금하신가요<span class="em1">?</span>
        </blockquote>
        <cite class="fade-up d2">AMU의 핵심 포지션</cite>
        <p class="note fade-up d3">
          ※ 실제 유저·메이커 후기는 서비스 성장 후 추가될 예정이에요
        </p>
      </div>
    </section>

    <!-- 11. FAQ -->
    <section class="faq">
      <div class="container">
        <div class="head fade-up">
          <div class="eyebrow">Frequently Asked</div>
          <h2>자주 묻는 질문</h2>
        </div>
        <div class="faq-list">
          <div
            v-for="(item, i) in faqs"
            :key="i"
            class="faq-item fade-up"
            :class="{ open: openFaq === i }"
          >
            <button type="button" class="faq-q" @click="toggleFaq(i)">
              {{ item.q }}
              <span class="plus">+</span>
            </button>
            <div v-if="openFaq === i" class="faq-a">
              {{ item.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 12. CTA -->
    <section class="cta">
      <div class="cta-deco d1" />
      <div class="cta-deco d2" />
      <div class="cta-deco d3" />

      <div class="ph mascot cta-mascot">
        <img src="/logo-2.png" alt="AMU 마스코트" class="mascot-img">
      </div>
      <h2 class="fade-up">
        지금 시작해볼까요<span class="q-yel">?</span>
      </h2>
      <p class="fade-up d1">
        등록도 무료 · 심사도 24시간 · 노출은 평생이에요
      </p>
      <NuxtLink to="/submit" class="cta-btn fade-up d2">
        프로덕트 등록하기 →
      </NuxtLink>
      <div class="cta-sub fade-up d3">
        유저라면
        <NuxtLink to="/" class="cta-link">홈에서 바로 둘러보세요</NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  --red: #F2293A;
  --red-dark: #D81A2E;
  --yellow: #FFD60A;
  --blue: #4A90E2;
  --green: #22C55E;
  --orange: #FF8C42;
  --pink: #FF6B9D;
  --mint: #5EEAD4;
  --n-100: #F7F7F7;
  --n-200: #E5E5E5;
  --n-400: #A3A3A3;
  --n-500: #737373;
  --n-700: #404040;
  --n-950: #0A0A0A;

  color: var(--n-950);
}

.about-page .container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.about-page .narrow { max-width: 760px; margin: 0 auto; padding: 0 24px; }

.about-page .eyebrow {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--n-500);
}

/* 애니메이션 */
.fade-up { opacity: 0; transform: translateY(32px); transition: all .9s cubic-bezier(.2,.9,.3,1); }
.fade-up.in { opacity: 1; transform: none; }
.fade-up.d1 { transition-delay: .08s; }
.fade-up.d2 { transition-delay: .16s; }
.fade-up.d3 { transition-delay: .24s; }
.fade-up.d4 { transition-delay: .32s; }

/* placeholder */
.ph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-radius: 28px;
  color: rgba(0,0,0,0.4);
}

/* ========== 1. HERO ========== */
.hero {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 24px 48px;
  text-align: center;
  position: relative;
  background: #FFFFFF;
  overflow: hidden;
}
.hero-deco {
  position: absolute;
  pointer-events: none;
}
.hero-deco.d1 { top: 15%; left: 10%; width: 72px; height: 72px; background: var(--yellow); border-radius: 50%; animation: float1 7s ease-in-out infinite; }
.hero-deco.d2 { top: 25%; right: 12%; width: 56px; height: 56px; background: var(--blue); border-radius: 20px; transform: rotate(20deg); animation: float2 8s ease-in-out infinite; }
.hero-deco.d3 { bottom: 25%; left: 15%; width: 48px; height: 48px; background: var(--green); border-radius: 50%; animation: float1 6s ease-in-out infinite reverse; }
.hero-deco.d4 { bottom: 20%; right: 18%; width: 64px; height: 64px; background: var(--pink); border-radius: 18px; transform: rotate(-10deg); animation: float2 9s ease-in-out infinite; }
@keyframes float1 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-24px) rotate(10deg); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) rotate(20deg); }
  50% { transform: translateY(-18px) rotate(5deg); }
}

.hero .mascot {
  width: 220px; height: 220px;
  background: var(--yellow);
  border-radius: 50%;
  margin-bottom: 40px;
  animation: breathe 3.6s ease-in-out infinite;
  position: relative;
  z-index: 2;
  overflow: hidden;
}
.mascot-img {
  width: 70%;
  height: auto;
  object-fit: contain;
}
@keyframes breathe {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-14px) scale(1.03); }
}
.hero h1 {
  font-size: clamp(44px, 8vw, 88px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1.0;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
}
.hero h1 .line { display: block; }
.hero h1 .q-red { color: var(--red); }
.hero p {
  font-size: 17px;
  font-weight: 500;
  color: var(--n-500);
  max-width: 440px;
  line-height: 1.6;
  position: relative;
  z-index: 2;
}
.scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--n-400);
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 8px); }
}

/* ========== 2. STATS ========== */
.stats {
  padding: 120px 0;
  background: var(--n-100);
}
.stats h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-align: center;
  margin-bottom: 48px;
  line-height: 1.3;
}
.stats h2 .tag {
  display: inline-block;
  background: var(--n-950);
  color: #FFF;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 800;
  margin: 0 4px;
  vertical-align: middle;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}
.stat {
  padding: 44px 28px;
  border-radius: 32px;
  position: relative;
}
.stat.y { background: var(--yellow); color: var(--n-950); }
.stat.r { background: var(--red); color: #FFF; }
.stat.b { background: var(--blue); color: #FFF; }
.stat .num {
  font-size: 72px;
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 1;
  margin-bottom: 16px;
}
.stat .num .u { font-size: 28px; margin-left: 2px; }
.stat .label {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: -0.015em;
}
.stat .label .sub { display: block; font-weight: 500; opacity: .7; font-size: 12px; margin-top: 4px; }

/* ========== 3. THESIS ========== */
.thesis {
  padding: 140px 24px;
  background: var(--n-950);
  color: #FFFFFF;
  text-align: center;
}
.thesis-chip {
  display: inline-block;
  background: var(--yellow);
  color: var(--n-950);
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-bottom: 36px;
}
.thesis h2 {
  font-size: clamp(32px, 5.5vw, 60px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  max-width: 820px;
  margin: 0 auto;
}
.thesis h2 .em-red { color: var(--red); }
.thesis h2 .em-yel { color: var(--yellow); }
.thesis .sub {
  margin-top: 28px;
  font-size: 17px;
  font-weight: 500;
  color: var(--n-400);
}

/* ========== 4. 마스코트 소개 ========== */
.mascot-intro {
  padding: 120px 0;
}
.mascot-intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}
.mascot-intro h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;
  margin: 20px 0 28px;
}
.mascot-intro h2 .em { color: var(--red); }
.mascot-intro p {
  font-size: 17px;
  line-height: 1.8;
  color: var(--n-700);
  margin-bottom: 10px;
}
.mascot-intro .quote {
  margin-top: 28px;
  padding: 18px 22px;
  background: var(--yellow);
  border-radius: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
  display: inline-block;
}
.mascot-poses {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.mascot-poses .ph {
  aspect-ratio: 1;
  width: 100%;
  height: auto;
  border-radius: 32px;
  font-size: 13px;
}
.mascot-poses .ph:nth-child(1) { background: var(--pink); color: #FFF; }
.mascot-poses .ph:nth-child(2) { background: var(--yellow); color: var(--n-700); }
.mascot-poses .ph:nth-child(3) { background: var(--mint); color: var(--n-700); }
.mascot-poses .ph:nth-child(4) { background: var(--blue); color: #FFF; }

/* ========== 5. FEATURES ========== */
.features {
  padding: 120px 0;
  background: var(--n-100);
}
.features .head { text-align: center; margin-bottom: 48px; }
.features h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 20px 0 12px;
}
.features .head p { color: var(--n-500); font-size: 16px; font-weight: 500; }
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.feature {
  border-radius: 32px;
  padding: 40px;
  transition: all .4s cubic-bezier(.2,.9,.3,1);
}
.feature.c1 { background: var(--yellow); color: var(--n-950); }
.feature.c2 { background: var(--red); color: #FFF; }
.feature.c3 { background: var(--blue); color: #FFF; }
.feature.c4 { background: var(--green); color: #FFF; }
.feature:hover { transform: translateY(-8px); }
.feature .num {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  opacity: .8;
  margin-bottom: 28px;
  text-transform: uppercase;
}
.feature .f-ph {
  aspect-ratio: 16/9;
  width: 100%;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.35);
  color: inherit;
  opacity: .8;
  border-radius: 20px;
  font-size: 11px;
}
.feature.c1 .f-ph { background: rgba(255,255,255,0.5); }
.feature h3 {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 10px;
  line-height: 1.2;
}
.feature p {
  font-size: 15px;
  line-height: 1.7;
  opacity: .9;
}

/* ========== 6. BEFORE/AFTER ========== */
.compare {
  padding: 120px 0;
}
.compare .head { text-align: center; margin-bottom: 48px; }
.compare h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 20px 0;
}
.compare-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 960px;
  margin: 0 auto;
}
.compare-card {
  padding: 44px 32px;
  border-radius: 32px;
}
.compare-card.before { background: var(--n-100); color: var(--n-500); }
.compare-card.after { background: var(--yellow); color: var(--n-950); }
.compare-card .tag {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  margin-bottom: 20px;
}
.compare-card.before .tag { background: var(--n-500); color: #FFF; }
.compare-card.after .tag { background: var(--red); color: #FFF; }
.compare-card h3 {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
  line-height: 1.3;
}
.compare-card ul { list-style: none; padding: 0; }
.compare-card li {
  font-size: 15px;
  line-height: 1.9;
  padding-left: 32px;
  position: relative;
  font-weight: 600;
}
.compare-card.before li::before {
  content: '✕'; position: absolute; left: 0; font-weight: 800; color: var(--n-400);
}
.compare-card.after li::before {
  content: '✓'; position: absolute; left: 0; font-weight: 800; color: var(--red);
}

/* ========== 7. PROCESS ========== */
.process {
  padding: 120px 0;
  background: var(--n-100);
  text-align: center;
}
.process h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 20px 0 48px;
}
.process-flow {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 1000px;
  margin: 0 auto;
}
.process-step {
  text-align: center;
  padding: 32px 16px;
  background: #FFF;
  border-radius: 28px;
}
.process-step .circle {
  width: 60px; height: 60px;
  border-radius: 50%;
  color: #FFF;
  font-weight: 800;
  font-size: 22px;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
}
.process-step:nth-child(1) .circle { background: var(--yellow); color: var(--n-950); }
.process-step:nth-child(2) .circle { background: var(--blue); }
.process-step:nth-child(3) .circle { background: var(--green); }
.process-step:nth-child(4) .circle { background: var(--red); }
.process-step h4 {
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 6px;
  letter-spacing: -0.015em;
}
.process-step p { font-size: 13px; color: var(--n-500); line-height: 1.6; font-weight: 500; }

/* ========== 8. SPOTLIGHT ========== */
.spotlight {
  padding: 120px 0;
}
.spotlight .head { text-align: center; margin-bottom: 48px; }
.spotlight h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 20px 0 12px;
}
.spotlight .head p { color: var(--n-500); font-size: 16px; font-weight: 500; }
.showroom-sample {
  max-width: 760px;
  margin: 0 auto;
  background: var(--n-950);
  color: #FFF;
  border-radius: 32px;
  padding: 44px;
  position: relative;
  overflow: hidden;
}
.showroom-sample .glow {
  position: absolute;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: var(--yellow);
  opacity: .15;
  top: -100px; right: -80px;
  filter: blur(40px);
}
.showroom-sample .pitch {
  position: relative;
  border-left: 3px solid var(--yellow);
  padding-left: 20px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.4;
  margin-bottom: 20px;
}
.showroom-sample .by { font-size: 13px; color: var(--n-400); margin-bottom: 28px; position: relative; }
.showroom-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.15);
  position: relative;
}
.showroom-stats .s .l { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: var(--n-400); text-transform: uppercase; margin-bottom: 8px; }
.showroom-stats .s .v { font-size: 22px; font-weight: 800; letter-spacing: -0.025em; }
.showroom-stats .s.c1 .v { color: var(--yellow); }
.showroom-stats .s.c2 .v { color: var(--mint); }
.showroom-stats .s.c3 .v { color: var(--pink); }

/* ========== 9. BENEFITS ========== */
.benefits {
  padding: 120px 0;
  background: linear-gradient(135deg, var(--yellow) 0%, #FFE55C 100%);
}
.benefits .head { text-align: center; margin-bottom: 48px; color: var(--n-950); }
.benefits h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin: 20px 0 12px;
}
.benefits .head p { font-size: 16px; font-weight: 600; opacity: .7; }
.benefit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 920px;
  margin: 0 auto;
}
.benefit {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  padding: 24px;
  background: #FFF;
  border-radius: 24px;
  transition: all .3s;
}
.benefit:hover { transform: translateY(-4px); }
.benefit .check {
  width: 40px; height: 40px;
  border-radius: 14px;
  color: #FFF;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800;
  font-size: 17px;
  flex-shrink: 0;
}
.benefit:nth-child(1) .check { background: var(--red); }
.benefit:nth-child(2) .check { background: var(--blue); }
.benefit:nth-child(3) .check { background: var(--green); }
.benefit:nth-child(4) .check { background: var(--pink); }
.benefit:nth-child(5) .check { background: var(--orange); }
.benefit:nth-child(6) .check { background: var(--n-950); }
.benefit h4 {
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 4px;
  letter-spacing: -0.015em;
}
.benefit p {
  font-size: 14px;
  color: var(--n-500);
  line-height: 1.6;
  font-weight: 500;
}

/* ========== 10. TESTIMONIAL ========== */
.testimonial {
  padding: 120px 24px;
  text-align: center;
  background: #FFFFFF;
}
.testimonial .mark { font-size: 52px; font-weight: 800; color: var(--red); margin-bottom: 20px; line-height: 1; }
.testimonial blockquote {
  font-size: clamp(26px, 4.2vw, 44px);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.3;
  max-width: 860px;
  margin: 0 auto 32px;
}
.testimonial blockquote .em1 { color: var(--red); }
.testimonial blockquote .em2 { color: var(--blue); }
.testimonial cite {
  display: inline-block;
  padding: 8px 18px;
  background: var(--n-100);
  border-radius: 999px;
  font-size: 13px;
  font-style: normal;
  color: var(--n-500);
  font-weight: 700;
}
.testimonial .note {
  margin-top: 40px;
  font-size: 12px;
  color: var(--n-400);
}

/* ========== 11. FAQ ========== */
.faq {
  padding: 120px 0;
  background: var(--n-100);
}
.faq .head { text-align: center; margin-bottom: 40px; }
.faq h2 {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.035em;
  margin-top: 20px;
}
.faq-list { max-width: 780px; margin: 0 auto; }
.faq-item {
  background: #FFF;
  border-radius: 24px;
  margin-bottom: 12px;
  overflow: hidden;
}
.faq-q {
  width: 100%;
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.015em;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: inherit;
}
.faq-q .plus {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--n-100);
  color: var(--n-500);
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  transition: all .3s;
  flex-shrink: 0;
}
.faq-item.open .faq-q .plus {
  transform: rotate(45deg);
  background: var(--red);
  color: #FFF;
}
.faq-a {
  padding: 0 28px 24px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--n-500);
  font-weight: 500;
}

/* ========== 12. CTA ========== */
.cta {
  padding: 140px 24px 160px;
  text-align: center;
  background: var(--red);
  color: #FFF;
  position: relative;
  overflow: hidden;
}
.cta-deco {
  position: absolute;
  pointer-events: none;
}
.cta-deco.d1 { top: 15%; left: 10%; width: 56px; height: 56px; background: var(--yellow); border-radius: 50%; animation: float1 7s ease-in-out infinite; }
.cta-deco.d2 { bottom: 15%; right: 15%; width: 64px; height: 64px; background: var(--blue); border-radius: 18px; transform: rotate(10deg); animation: float2 8s ease-in-out infinite; }
.cta-deco.d3 { top: 20%; right: 10%; width: 44px; height: 44px; background: var(--green); border-radius: 50%; animation: float1 9s ease-in-out infinite reverse; }
.cta .cta-mascot {
  background: var(--yellow);
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin: 0 auto 36px;
  animation: wave 2.4s ease-in-out infinite;
  position: relative;
  z-index: 2;
  overflow: hidden;
}
@keyframes wave {
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
}
.cta h2 {
  font-size: clamp(40px, 6.5vw, 72px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.0;
  margin-bottom: 24px;
  position: relative;
  z-index: 2;
}
.cta h2 .q-yel { color: var(--yellow); }
.cta p {
  font-size: 17px;
  opacity: .9;
  margin-bottom: 40px;
  position: relative;
  z-index: 2;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 20px 40px;
  background: var(--n-950);
  color: #FFF;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.015em;
  transition: all .3s;
  position: relative;
  z-index: 2;
}
.cta-btn:hover { background: #FFF; color: var(--red); transform: translateY(-2px); }
.cta-sub {
  margin-top: 20px;
  font-size: 13px;
  opacity: .9;
  position: relative;
  z-index: 2;
}
.cta-link { text-decoration: underline; color: #FFF; }

/* 반응형 */
@media (max-width: 768px) {
  .mascot-intro-grid, .feature-grid, .compare-grid, .benefit-grid { grid-template-columns: 1fr; }
  .process-flow { grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-grid { grid-template-columns: 1fr; }
  .stats h2 { font-size: 22px; }
  .thesis { padding: 100px 24px; }
  .showroom-sample { padding: 32px 24px; }
  .showroom-sample .pitch { font-size: 18px; }
}
</style>
