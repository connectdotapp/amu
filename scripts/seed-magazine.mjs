// 매거진 첫 글을 Firestore 에 발행. 이미 있으면 덮어쓰지 않음 (--force 로 덮어쓰기).
// 이후 수정은 /admin/magazine 편집기에서.
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  || resolve(process.cwd(), 'amu-project-6efae-firebase-adminsdk-fbsvc-b930e9c8d7.json')
if (!existsSync(credPath)) { console.error(`service account not found: ${credPath}`); process.exit(1) }
initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf-8'))) })
const db = getFirestore()

const body = readFileSync(resolve(process.cwd(), 'scripts/seed/magazine-app-icon-36px.md'), 'utf-8')
const post = {
  slug: 'app-icon-36px',
  title: '앱 아이콘 36px에서 살아남는 법',
  subtitle: '1024×1024로 공들인 아이콘이 홈 화면에서는 36px로 쭈그러들어요. 그 작은 사각형에서 살아남는 iOS 아이콘 치트시트.',
  category: '가이드',
  coverImageUrl: '/magazine/app-icon-36px.webp',
  body,
  authorName: '조은솔',
  status: 'published',
  readMinutes: Math.max(1, Math.round(body.replace(/\s/g, '').length / 500))
}

const ref = db.collection('magazine').doc(post.slug)
const exists = (await ref.get()).exists
if (exists && !process.argv.includes('--force')) {
  console.log(`이미 있음: magazine/${post.slug} (덮어쓰려면 --force)`)
  process.exit(0)
}
await ref.set({
  ...post,
  createdAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
  publishedAt: FieldValue.serverTimestamp()
})
console.log(`✓ 발행: magazine/${post.slug} (${post.readMinutes}분)`)
