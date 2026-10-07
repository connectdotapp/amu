/**
 * Google Play Store 메타데이터 조회.
 * google-play-scraper 라이브러리로 Play Store 페이지에서 긁어옴 (공식 제3자 조회 API 없음).
 *
 * iTunes 응답 shape 와 일치시켜 ProductForm 에서 동일한 매핑 로직 재사용 가능하게 함.
 */
import gplay from 'google-play-scraper'

function extractAppId(input: string): string | null {
  const trimmed = input.trim()
  // 패키지명 직접 입력 (com.example.app)
  if (/^[a-zA-Z][a-zA-Z0-9._]+$/.test(trimmed) && trimmed.includes('.')) return trimmed
  // URL 에서 id 추출
  try {
    const url = new URL(trimmed)
    const id = url.searchParams.get('id')
    if (id) return id
  } catch {
    // not a URL — fall through
  }
  return null
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const m = clean.match(/^(.+?[.!?。！？\n])/)
  return (m ? m[1]! : clean).slice(0, 30).trim()
}

function derivePricing(free: boolean): 'free' | 'paid' {
  return free ? 'free' : 'paid'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawInput = String(query.url ?? query.id ?? '').trim()
  const lang = String(query.lang ?? 'ko')
  const country = String(query.country ?? 'kr')

  if (!rawInput) {
    throw createError({ statusCode: 400, statusMessage: 'url 또는 id 필요' })
  }

  const appId = extractAppId(rawInput)
  if (!appId) {
    throw createError({ statusCode: 400, statusMessage: 'Play Store URL 또는 패키지명(com.example.app) 을 입력해주세요' })
  }

  let app: Awaited<ReturnType<typeof gplay.app>>
  try {
    app = await gplay.app({ appId, lang, country, throttle: 1 })
  } catch (e: any) {
    if (/404/.test(String(e?.message)) || /not found/i.test(String(e?.message))) {
      throw createError({ statusCode: 404, statusMessage: '해당 앱을 찾지 못했어요' })
    }
    throw createError({ statusCode: 502, statusMessage: `Play Store 조회 실패: ${e?.message || 'unknown'}` })
  }

  // iTunes 와 동일한 shape 로 정규화
  const tagline = app.summary ? app.summary.slice(0, 30).trim() : (app.description ? firstSentence(app.description) : '')

  return {
    id: app.appId,
    name: app.title,
    tagline,
    description: app.description ?? '',
    maker: app.developer ?? '',
    genreName: app.genre ?? '',
    tags: app.categories?.map(c => c.name).filter(Boolean).slice(0, 5) ?? [],
    pricing: derivePricing(app.free),
    linkUrl: app.url,
    thumbnailUrl: app.icon ?? '',
    screenshotUrls: app.screenshots ?? []
  }
})
