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
  { slug: 'ai', name: 'AI', order: 1 },
  { slug: 'productivity', name: '생산성', order: 2 },
  { slug: 'design', name: '디자인', order: 3 },
  { slug: 'dev', name: '개발도구', order: 4 },
  { slug: 'marketing', name: '마케팅', order: 5 },
  { slug: 'lifestyle', name: '라이프스타일', order: 6 },
  { slug: 'entertainment', name: '엔터테인먼트', order: 7 },
  { slug: 'etc', name: '기타', order: 99 }
]

for (const c of categories) {
  await db.collection('categories').doc(c.slug).set(c, { merge: true })
  console.log(`✓ ${c.slug} · ${c.name}`)
}
console.log(`\nSeeded ${categories.length} categories.`)
process.exit(0)
