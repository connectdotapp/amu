/**
 * Apple CDN 이미지 프록시. iTunes API로 가져온 썸네일을 클라이언트에서 File 로 만들 때
 * CORS 이슈 없이 받아오려고 서버 경유. mzstatic.com 도메인만 허용.
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = String(query.url ?? '')

  if (!/^https:\/\/[^/]*mzstatic\.com\//.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'mzstatic.com URL만 허용' })
  }

  const upstream = await fetch(url)
  if (!upstream.ok) {
    throw createError({ statusCode: upstream.status, statusMessage: '이미지 fetch 실패' })
  }

  const contentType = upstream.headers.get('content-type') ?? 'image/jpeg'
  const buf = Buffer.from(await upstream.arrayBuffer())

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return buf
})
