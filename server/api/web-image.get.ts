/**
 * 웹사이트 아이콘·대표 이미지 프록시. 클라이언트에서 File 로 만들 때 CORS 우회용.
 * 공개 주소만 허용하고(safeFetch), 래스터 이미지(SVG 제외)만 5MB 까지 돌려준다.
 */
export default defineEventHandler(async (event) => {
  const url = String(getQuery(event).url ?? '')
  const img = await safeFetch(url, 5_000_000, 'image/*')

  const contentType = img.contentType.split(';')[0]!.trim()
  if (!/^image\/(png|jpeg|jpg|webp|gif|x-icon|vnd\.microsoft\.icon)$/i.test(contentType)) {
    throw createError({ statusCode: 400, statusMessage: '이미지가 아니에요' })
  }

  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return img.body
})
