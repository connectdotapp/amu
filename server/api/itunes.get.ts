/**
 * iTunes Search API 프록시.
 * 클라이언트가 App Store URL 또는 ID를 보내면 서버에서 조회 후 Product 폼에 매핑된 형태로 반환.
 * iTunes API는 CORS 허용이 안 돼서 서버 경유가 필요함.
 */

type ItunesEntry = {
  trackId: number
  trackName: string
  trackViewUrl: string
  sellerName?: string
  description?: string
  primaryGenreName?: string
  genres?: string[]
  formattedPrice?: string
  price?: number
  artworkUrl60?: string
  artworkUrl100?: string
  artworkUrl512?: string
  screenshotUrls?: string[]
  ipadScreenshotUrls?: string[]
  appletvScreenshotUrls?: string[]
  kind?: string
  releaseNotes?: string
  averageUserRating?: number
  userRatingCount?: number
}

function extractIdFromUrl(input: string): string | null {
  const trimmed = input.trim()
  if (/^\d+$/.test(trimmed)) return trimmed
  const m = trimmed.match(/\/id(\d+)/)
  return m ? m[1]! : null
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const m = clean.match(/^(.+?[.!?。！？\n])/)
  return (m ? m[1]! : clean).slice(0, 80).trim()
}

function derivePricing(entry: ItunesEntry): 'free' | 'paid' | 'freemium' {
  if (entry.price === 0) {
    // 무료 앱 중에서도 앱 내 결제가 있을 수 있지만 iTunes API에서 정확히 알 수 없음.
    // 일단 free로 두고 사용자가 필요시 freemium으로 수정하게 함.
    return 'free'
  }
  return 'paid'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawInput = String(query.url ?? query.id ?? '').trim()
  const country = String(query.country ?? 'kr')

  if (!rawInput) {
    throw createError({ statusCode: 400, statusMessage: 'url 또는 id 필요' })
  }

  const id = extractIdFromUrl(rawInput)
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'App Store URL에서 앱 ID를 찾지 못했어요' })
  }

  const lookupUrl = `https://itunes.apple.com/lookup?id=${id}&country=${country}`
  // iTunes는 Content-Type을 text/javascript 로 반환해서 $fetch 가 JSON 자동 파싱 안 함 → 강제.
  const res = await $fetch<{ resultCount: number, results: ItunesEntry[] }>(lookupUrl, {
    timeout: 15_000,
    parseResponse: JSON.parse
  }).catch((e) => {
    throw createError({ statusCode: 502, statusMessage: `iTunes 조회 실패: ${e.message}` })
  })

  if (!res.resultCount || !res.results?.length) {
    throw createError({ statusCode: 404, statusMessage: '해당 앱을 찾지 못했어요' })
  }

  const entry = res.results[0]!

  return {
    id: String(entry.trackId),
    name: entry.trackName,
    tagline: entry.description ? firstSentence(entry.description) : '',
    description: entry.description ?? '',
    maker: entry.sellerName ?? '',
    genreName: entry.primaryGenreName ?? '',
    tags: [...(entry.genres || [])].slice(0, 5),
    pricing: derivePricing(entry),
    linkUrl: entry.trackViewUrl,
    thumbnailUrl: entry.artworkUrl512 || entry.artworkUrl100 || entry.artworkUrl60 || '',
    screenshotUrls: entry.screenshotUrls ?? []
  }
})
