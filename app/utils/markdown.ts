import { Marked } from 'marked'

// 허용 스킴: http(s), mailto, 그리고 스킴 없는 상대/절대 경로.
// javascript:, data: 등은 링크·이미지 모두 차단.
function safeUrl(raw: string | null | undefined): string | null {
  const url = (raw ?? '').trim()
  if (!url) return null
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(url)
  if (scheme && !['http', 'https', 'mailto'].includes(scheme[1]!.toLowerCase())) return null
  return url
}

function escapeAttr(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const md = new Marked({ gfm: true, breaks: true })

md.use({
  renderer: {
    // 본문에 섞인 raw HTML 은 렌더하지 않음 — 마크다운 문법만 허용.
    html() {
      return ''
    },
    link(token) {
      const text = this.parser.parseInline(token.tokens)
      const href = safeUrl(token.href)
      if (!href) return text
      const external = /^https?:/i.test(href)
      const title = token.title ? ` title="${escapeAttr(token.title)}"` : ''
      const target = external ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${escapeAttr(href)}"${title}${target}>${text}</a>`
    },
    image(token) {
      const src = safeUrl(token.href)
      if (!src) return ''
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(token.text ?? '')}" loading="lazy">`
    }
  }
})

export function renderMarkdown(source: string): string {
  return md.parse(source ?? '', { async: false }) as string
}

// 한국어 본문 기준 분당 약 500자.
export function estimateReadMinutes(source: string): number {
  const chars = (source ?? '').replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}
