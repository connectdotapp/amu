/**
 * Google Play CDN 이미지 프록시. 아이콘/스크린샷을 클라이언트에서 File 로 만들 때 CORS 우회용.
 * play-lh.googleusercontent.com 과 lh3.googleusercontent.com 만 허용.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = String(query.url ?? '')

  if (!/^https:\/\/(play-lh|lh3|lh4|lh5|lh6)\.googleusercontent\.com\//.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'Play Store CDN URL만 허용' })
  }

  const upstream = await fetch(url)
  if (!upstream.ok) {
    throw createError({ statusCode: upstream.status, statusMessage: '이미지 fetch 실패' })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/png'
  const buf = Buffer.from(await upstream.arrayBuffer())

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return buf
})
