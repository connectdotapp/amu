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
    slug: 'where-to-launch',
    title: '디스콰이엇, 프로덕트헌트, 아무 — 내 서비스는 어디에 올려야 할까',
    subtitle: '출시 후 첫 질문 "어디에 올리지?" 세 곳의 차이와 상황별 추천.',
    category: '큐레이션 비교',
    coverImageUrl: '/magazine/where-to-launch.webp',
    file: 'magazine-where-to-launch.md'
  },
  {
    slug: 'app-store-screenshots',
    title: '앱스토어 스크린샷, 처음 3장이 설치를 좌우해요',
    subtitle: '검색 결과에 보이는 건 1~3장뿐. 공식 규격과 첫 3장 구성법.',
    category: '가이드',
    coverImageUrl: '/magazine/app-store-screenshots.webp',
    file: 'magazine-app-store-screenshots.md'
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
