import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  || resolve(process.cwd(), 'amu-project-6efae-firebase-adminsdk-fbsvc-b930e9c8d7.json')

if (!existsSync(credPath)) {
  console.error(`service account not found: ${credPath}`)
  process.exit(1)
}

initializeApp({
  credential: cert(JSON.parse(readFileSync(credPath, 'utf-8')))
})

const db = getFirestore()

async function main() {
  const [products, collections, categories, users, reports] = await Promise.all([
    db.collection('products').get(),
    db.collection('collections').get(),
    db.collection('categories').get(),
    db.collection('users').get(),
    db.collection('reports').get().catch(() => ({ size: 0 }))
  ])

  const byStatus = {}
  const bySource = {}
  const byCategory = {}
  const topUpvoted = []
  products.forEach((d) => {
    const data = d.data()
    const status = data.status || 'unknown'
    const source = data.source || 'unknown'
    const cat = data.category || 'uncategorized'
    byStatus[status] = (byStatus[status] || 0) + 1
    bySource[source] = (bySource[source] || 0) + 1
    byCategory[cat] = (byCategory[cat] || 0) + 1
    topUpvoted.push({ name: data.name, upvotes: data.upvoteCount || 0, status, source })
  })
  topUpvoted.sort((a, b) => b.upvotes - a.upvotes)

  const publishedCollections = []
  collections.forEach(d => {
    const data = d.data()
    if (data.status === 'published') publishedCollections.push({ title: data.title, productCount: data.productCount || 0 })
  })

  console.log('━━━━ AMU Firestore Stats ━━━━')
  console.log('\n📦 PRODUCTS:', products.size, '개 (총)')
  console.log('  by status:', byStatus)
  console.log('  by source:', bySource)
  console.log('  by category:')
  Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .forEach(([k, v]) => console.log(`    ${k}: ${v}`))
  console.log('\n  Top 10 upvoted:')
  topUpvoted.slice(0, 10).forEach((p, i) => {
    console.log(`    ${i + 1}. ${p.name} (↑${p.upvotes}, ${p.status}, ${p.source})`)
  })

  console.log('\n📚 COLLECTIONS:', collections.size, '개 (총)')
  console.log(`  published: ${publishedCollections.length}`)
  publishedCollections.forEach(c => console.log(`    - ${c.title} (제품 ${c.productCount}개)`))

  console.log('\n🏷️ CATEGORIES:', categories.size, '개')
  console.log('\n👤 USERS:', users.size, '명')
  console.log('\n🚨 REPORTS:', reports.size || 0, '건')

  process.exit(0)
}

main().catch((e) => {
  console.error('error:', e.message)
  process.exit(1)
})
