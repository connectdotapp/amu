/**
 * sitemap.xml 동적 URL 소스.
 * published 프로덕트·컬렉션, 전체 카테고리, 프로덕트에 등장하는 메이커를 반환한다.
 * 문서 ID 는 대소문자를 구분하므로 가공 없이 그대로 쓴다. URL 인코딩은 sitemap 모듈이 처리(직접 하면 이중 인코딩).
 */
import type { Timestamp } from 'firebase-admin/firestore'

function toIso(...values: Array<Timestamp | null | undefined>) {
  const ts = values.find(v => v && typeof v.toDate === 'function')
  return ts ? ts.toDate().toISOString() : undefined
}

export default defineSitemapEventHandler(async () => {
  const db = useAdminFirestore()
  const [products, collections, categories] = await Promise.all([
    db.collection('products').where('status', '==', 'published').get(),
    db.collection('collections').where('status', '==', 'published').get(),
    db.collection('categories').get()
  ])

  const urls: Array<{ loc: string, lastmod?: string, images?: Array<{ loc: string }> }> = []
  const makers = new Set<string>()

  for (const d of products.docs) {
    const p = d.data()
    if (p.maker) makers.add(p.maker)
    urls.push({
      loc: `/products/${p.slug || d.id}`,
      lastmod: toIso(p.updatedAt, p.publishedAt),
      images: p.thumbnailUrl ? [{ loc: p.thumbnailUrl }] : undefined
    })
  }

  for (const d of collections.docs) {
    const c = d.data()
    urls.push({
      loc: `/collections/${c.slug || d.id}`,
      lastmod: toIso(c.updatedAt, c.publishedAt)
    })
  }

  for (const d of categories.docs) {
    urls.push({ loc: `/categories/${d.data().slug || d.id}` })
  }

  for (const m of makers) {
    urls.push({ loc: `/makers/${m}` })
  }

  return urls
})
