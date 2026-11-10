/**
 * 관리자 인사이트: GA4 방문·유입 통계 + Firestore 사이트 내부 통계.
 *
 * - 관리자 ID 토큰(Authorization: Bearer)만 허용.
 * - GA4 는 Data API(runReport)를 서버 계정으로 호출. 속성 ID(GA4_PROPERTY_ID)와
 *   서버 계정의 GA4 뷰어 권한이 있어야 하고, 없으면 ga.configured=false 와 이유를 돌려줘
 *   관리자 화면에서 설정 방법을 안내한다.
 */
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { GoogleAuth } from 'google-auth-library'

type Row = { dims: string[], mets: number[] }

async function requireAdmin(event: any) {
  const header = getHeader(event, 'authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })
  try {
    const decoded = await useAdminAuth().verifyIdToken(token)
    if (decoded.admin !== true) throw new Error('not admin')
  } catch {
    throw createError({ statusCode: 403, statusMessage: '관리자만 볼 수 있어요' })
  }
}

let gaAuth: GoogleAuth | null = null
function getGaAuth() {
  if (gaAuth) return gaAuth
  const local = process.env.LOCAL_SERVICE_ACCOUNT_PATH ? resolve(process.cwd(), process.env.LOCAL_SERVICE_ACCOUNT_PATH) : ''
  gaAuth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    ...(local && existsSync(local) ? { keyFile: local } : {})
  })
  return gaAuth
}

async function serviceAccountEmail(): Promise<string> {
  try {
    return (await getGaAuth().getCredentials()).client_email || ''
  } catch {
    return ''
  }
}

function report(dimensions: string[], metrics: string[], extra: Record<string, any> = {}) {
  return { dimensions: dimensions.map(name => ({ name })), metrics: metrics.map(name => ({ name })), ...extra }
}

function parseRows(r: any): Row[] {
  return (r?.rows || []).map((row: any) => ({
    dims: (row.dimensionValues || []).map((d: any) => d.value),
    mets: (row.metricValues || []).map((m: any) => Number(m.value))
  }))
}

async function fetchGa(propertyId: string, days: number) {
  const client = await getGaAuth().getClient()
  const dateRanges = [{ startDate: `${days - 1}daysAgo`, endDate: 'today' }]
  const prevRanges = [{ startDate: `${days * 2 - 1}daysAgo`, endDate: `${days}daysAgo` }]
  const requests = [
    report(['date'], ['activeUsers', 'newUsers', 'sessions', 'screenPageViews'], { dateRanges, orderBys: [{ dimension: { dimensionName: 'date' } }] }),
    report(['sessionDefaultChannelGroup'], ['sessions', 'activeUsers'], { dateRanges, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 }),
    report(['sessionSource'], ['sessions'], { dateRanges, orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10 }),
    report(['pagePath'], ['screenPageViews', 'activeUsers'], { dateRanges, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 10 }),
    report(['eventName'], ['eventCount'], {
      dateRanges,
      dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: ['external_link_click', 'product_view', 'product_upvote', 'product_bookmark', 'search', 'product_submit'] } } }
    })
  ]
  const res = await client.request<any>({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
    method: 'POST',
    data: { requests }
  })
  const prev = await client.request<any>({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    method: 'POST',
    data: report([], ['activeUsers', 'sessions', 'screenPageViews'], { dateRanges: prevRanges })
  })

  const [daily, channels, sources, pages, events] = (res.data.reports || []).map(parseRows) as Row[][]
  const sum = (i: number) => (daily || []).reduce((s, r) => s + (r.mets[i] || 0), 0)
  const prevRow = parseRows(prev.data)[0]
  return {
    totals: {
      activeUsers: sum(0), newUsers: sum(1), sessions: sum(2), pageViews: sum(3),
      prev: { activeUsers: prevRow?.mets[0] ?? 0, sessions: prevRow?.mets[1] ?? 0, pageViews: prevRow?.mets[2] ?? 0 }
    },
    daily: (daily || []).map(r => ({ date: r.dims[0], activeUsers: r.mets[0], sessions: r.mets[2], pageViews: r.mets[3] })),
    channels: (channels || []).map(r => ({ name: r.dims[0], sessions: r.mets[0], activeUsers: r.mets[1] })),
    sources: (sources || []).map(r => ({ name: r.dims[0], sessions: r.mets[0] })),
    pages: (pages || []).map(r => ({ path: r.dims[0], pageViews: r.mets[0], activeUsers: r.mets[1] })),
    events: Object.fromEntries((events || []).map(r => [r.dims[0], r.mets[0]]))
  }
}

async function siteStats(days: number) {
  const db = useAdminFirestore()
  const [productsSnap, usersCount] = await Promise.all([
    db.collection('products').get(),
    db.collection('users').count().get().then(s => s.data().count).catch(() => null)
  ])
  const since = Date.now() - days * 86_400_000
  const products = productsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
  const published = products.filter(p => p.status === 'published')
  const ms = (t: any) => (t?.toMillis ? t.toMillis() : 0)
  const byCategory: Record<string, number> = {}
  for (const p of published) byCategory[p.category || 'etc'] = (byCategory[p.category || 'etc'] || 0) + 1
  return {
    products: {
      published: published.length,
      pending: products.filter(p => p.status === 'pending').length,
      newInRange: published.filter(p => ms(p.publishedAt) >= since).length,
      userSubmittedPending: products.filter(p => p.status === 'pending' && p.source === 'user').length
    },
    users: usersCount,
    upvotes: published.reduce((s, p) => s + (p.upvoteCount || 0), 0),
    bookmarks: published.reduce((s, p) => s + (p.bookmarkCount || 0), 0),
    comments: published.reduce((s, p) => s + (p.commentCount || 0), 0),
    byCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([category, count]) => ({ category, count })),
    topUpvoted: [...published].sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0)).slice(0, 5)
      .map(p => ({ id: p.id, slug: p.slug, name: p.name, upvotes: p.upvoteCount || 0, bookmarks: p.bookmarkCount || 0 }))
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setHeader(event, 'Cache-Control', 'no-store')

  const days = [7, 28, 90].includes(Number(getQuery(event).days)) ? Number(getQuery(event).days) : 28
  const propertyId = String(useRuntimeConfig().ga4PropertyId || '').replace(/\D/g, '')

  const site = await siteStats(days)

  let ga: any
  if (!propertyId) {
    ga = { configured: false, reason: 'property', serviceAccount: await serviceAccountEmail() }
  } else {
    try {
      ga = { configured: true, ...(await fetchGa(propertyId, days)) }
    } catch (e: any) {
      const status = e?.response?.status || e?.status
      const msg = String(e?.response?.data?.error?.message || e?.message || '')
      const reason = /has not been used|is disabled|SERVICE_DISABLED/i.test(msg) ? 'api'
        : status === 403 ? 'permission'
          : 'error'
      ga = { configured: false, reason, message: msg.slice(0, 300), serviceAccount: await serviceAccountEmail() }
    }
  }

  return { days, site, ga }
})
