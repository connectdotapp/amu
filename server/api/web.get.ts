/**
 * 웹사이트 메타데이터 조회. 페이지의 <title>, description, og:* 태그와 아이콘을 읽어
 * iTunes/Play 응답과 같은 shape 로 돌려줘 ProductForm 에서 같은 매핑 로직을 재사용한다.
 */

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, '\'').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim()
}

function getAttr(tag: string, name: string): string {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? decodeEntities(m[2] ?? m[3] ?? '') : ''
}

function metaContent(tags: string[], key: string): string {
  const tag = tags.find(t => getAttr(t, 'property').toLowerCase() === key || getAttr(t, 'name').toLowerCase() === key)
  return tag ? getAttr(tag, 'content') : ''
}

// "서비스명 — 설명", "서비스명 | 설명" 형태의 제목에서 앞부분만.
function shortName(title: string): string {
  return title.split(/\s+[—–|·:-]\s+/)[0]!.trim()
}

export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).url ?? '').trim()
  if (!raw) throw createError({ statusCode: 400, statusMessage: '웹사이트 주소를 입력해주세요' })
  const input = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  const page = await safeFetch(input, 3_000_000, 'text/html,application/xhtml+xml')
  if (!/html/i.test(page.contentType)) {
    throw createError({ statusCode: 400, statusMessage: '웹페이지 주소가 아니에요' })
  }
  const html = page.body.toString('utf-8')
  const head = html.slice(0, html.search(/<\/head>/i) > 0 ? html.search(/<\/head>/i) : 200_000)
  const metas = head.match(/<meta\b[^>]*>/gi) || []
  const links = head.match(/<link\b[^>]*>/gi) || []
  const abs = (u: string) => { if (!u) return ''; try { return new URL(u, page.url).toString() } catch { return '' } }

  const title = decodeEntities(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const siteName = metaContent(metas, 'og:site_name')
  const ogTitle = metaContent(metas, 'og:title')
  const description = metaContent(metas, 'og:description') || metaContent(metas, 'description')
  const ogImage = abs(metaContent(metas, 'og:image'))

  // 아이콘: apple-touch-icon / icon 중 가장 큰 래스터 이미지. SVG 는 업로드용으로 쓰지 않음.
  const icons = links
    .filter(l => /\b(apple-touch-icon|icon)\b/i.test(getAttr(l, 'rel')))
    .map(l => ({ href: abs(getAttr(l, 'href')), size: Number(getAttr(l, 'sizes').split('x')[0]) || (/apple-touch-icon/i.test(getAttr(l, 'rel')) ? 180 : 32) }))
    .filter(i => i.href && !/\.svg([?#]|$)/i.test(i.href))
    .sort((a, b) => b.size - a.size)
  const bestIcon = icons[0] && icons[0].size >= 120 ? icons[0].href : ''

  const name = siteName || shortName(ogTitle || title) || new URL(page.url).hostname
  const host = new URL(page.url).hostname

  return {
    id: host,
    name,
    // 한 줄 소개는 30자 제한. 잘리면 단어 경계에서 자름.
    tagline: description.length <= 30 ? description : description.slice(0, 30).replace(/\s+\S*$/, '').trim(),
    description,
    maker: '',
    genreName: '',
    tags: [],
    pricing: 'free' as const,
    linkUrl: page.url,
    thumbnailUrl: bestIcon || ogImage,
    screenshotUrls: ogImage ? [ogImage] : []
  }
})
