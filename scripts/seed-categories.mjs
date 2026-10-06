import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const serviceAccountPath = resolve(process.cwd(), 'service-account.json')
if (!existsSync(serviceAccountPath)) {
  console.error('✗ service-account.json not found at project root.')
  process.exit(1)
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8')))
})

const db = getFirestore()

const categories = [
  { slug: 'game', name: '게임', order: 1 },
  { slug: 'entertainment', name: '엔터테인먼트', order: 2 },
  { slug: 'social', name: '소셜네트워킹', order: 3 },
  { slug: 'lifestyle', name: '라이프스타일', order: 4 },
  { slug: 'photo-video', name: '촬영 및 편집', order: 5 },
  { slug: 'education', name: '교육', order: 6 },
  { slug: 'productivity', name: '생산성', order: 7 },
  { slug: 'utility', name: '유틸리티', order: 8 },
  { slug: 'books', name: '도서', order: 9 },
  { slug: 'business', name: '비즈니스', order: 10 },
  { slug: 'health', name: '헬스', order: 11 },
  { slug: 'ai', name: 'AI', order: 12 },
  { slug: 'etc', name: '기타', order: 99 }
]

for (const c of categories) {
  await db.collection('categories').doc(c.slug).set(c, { merge: true })
  console.log(`✓ ${c.slug} · ${c.name}`)
}
console.log(`\nSeeded ${categories.length} categories.`)
process.exit(0)
