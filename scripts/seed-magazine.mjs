// 매거진 기본 글 발행. 이미 있는 글은 건너뜀 (--force 로 본문·표지 덮어쓰기, 발행일은 유지).
// 이후 수정은 /admin/magazine 편집기에서.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  || resolve(process.cwd(), 'amu-project-6efae-firebase-adminsdk-fbsvc-b930e9c8d7.json')
if (!existsSync(credPath)) { console.error(`service account not found: ${credPath}`); process.exit(1) }
initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf-8'))) })
const db = getFirestore()

// 배열 순서 = 발행 순서 (마지막이 가장 최신).
const posts = [
  {
    slug: 'app-icon-36px',
    title: '앱 아이콘 36px에서 살아남는 법',
    subtitle: '1024×1024로 공들인 아이콘이 홈 화면에서는 36px로 쭈그러들어요. 그 작은 사각형에서 살아남는 iOS 아이콘 치트시트.',
    category: '가이드',
    coverImageUrl: '/magazine/app-icon-36px.webp',
    file: 'magazine-app-icon-36px.md'
  },
  {
    slug: 'app-store-screenshots',
    title: '앱스토어 스크린샷, 처음 3장이 설치를 좌우해요',
    subtitle: '검색 결과에 보이는 건 1~3장뿐. 공식 규격과 첫 3장 구성법.',
    category: '가이드',
    coverImageUrl: '/magazine/app-store-screenshots-v2.webp',
    file: 'magazine-app-store-screenshots.md'
  },
  {
    slug: 'vibe-coding',
    title: '바이브 코딩 1년, 만들기는 쉬워졌지만 고르는 게 문제?',
    subtitle: '사전에 오르고, 스타트업 코드의 95%를 AI가 쓰는 시대. 숫자로 본 바이브 코딩의 1년과 메이커가 챙길 것.',
    category: '인사이트',
    coverImageUrl: '/magazine/vibe-coding-v2.webp',
    file: 'magazine-vibe-coding.md'
  },
  {
    slug: 'app-review-rejections',
    title: '앱스토어 심사, 4건 중 1건은 반려돼요',
    subtitle: '애플 2024 투명성 보고서로 본 반려 사유와, 제출 전에 꼭 확인할 체크리스트.',
    category: '가이드',
    coverImageUrl: '/magazine/app-review-rejections.webp',
    file: 'magazine-app-review-rejections.md'
  },
  {
    slug: 'app-name-30',
    title: '앱 이름과 부제, 30자 안에 담는 법',
    subtitle: '앱스토어·구글 플레이 글자 수 규정과, 검색에도 걸리고 한눈에 이해되는 이름 짓기.',
    category: '크래프트',
    coverImageUrl: '/magazine/app-name-30.webp',
    file: 'magazine-app-name-30.md'
  },
  {
    slug: 'wordle-case-study',
    title: '하루에 한 문제, 워들은 어떻게 넉 달 만에 팔렸을까',
    subtitle: '90명에서 수백만 명까지, 광고 없이 퍼진 작은 게임의 세 가지 설계.',
    category: '케이스 스터디',
    coverImageUrl: '/magazine/wordle-case-study.webp',
    file: 'magazine-wordle.md'
  },
  {
    slug: 'empty-state-design',
    title: '빈 화면이 첫인상을 만들어요',
    subtitle: '"데이터가 없습니다" 대신, 상태를 알리고 다음 행동으로 이어주는 빈 화면 설계.',
    category: '프로덕트 디자인',
    coverImageUrl: '/magazine/empty-state-design.webp',
    file: 'magazine-empty-state.md'
  }
]

const force = process.argv.includes('--force')
const now = Date.now()

for (const [i, p] of posts.entries()) {
  const body = readFileSync(resolve(process.cwd(), 'scripts/seed', p.file), 'utf-8')
  const ref = db.collection('magazine').doc(p.slug)
  const snap = await ref.get()
  if (snap.exists && !force) {
    console.log(`건너뜀 (이미 있음): ${p.slug}`)
    continue
  }
  const { file: _file, ...fields } = p
  const data = {
    ...fields,
    body,
    authorName: '조은솔',
    status: 'published',
    readMinutes: Math.max(1, Math.round(body.replace(/\s/g, '').length / 500)),
    updatedAt: FieldValue.serverTimestamp()
  }
  if (!snap.exists) {
    // 순서가 섞이지 않도록 1분 간격으로 발행 시각을 지정.
    const publishedAt = Timestamp.fromMillis(now - (posts.length - 1 - i) * 60_000)
    Object.assign(data, { createdAt: publishedAt, publishedAt })
  }
  await ref.set(data, { merge: true })
  console.log(`✓ ${snap.exists ? '갱신' : '발행'}: ${p.slug} (${data.readMinutes}분)`)
}
