// /robots.txt — Nitro route 파일로 분기가 안 돼서 middleware 로 직접 처리.
// Firebase Hosting Frameworks 모드에서 nuxt-robots 와 server/routes/*.txt 둘 다 라우팅
// 실패했음. middleware 는 모든 요청에 걸리는 대신 early-return 패턴으로 비용 최소화.
export default defineEventHandler((event) => {
  if (event.path !== '/robots.txt') return
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return `# amuhunter.com — robots.txt
# 전체 공개 크롤 허용. 관리자/인증/API 영역만 차단.

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/

# 네이버 검색 봇 명시 (한국 검색 커버리지)
User-agent: Yeti
Allow: /
Disallow: /admin/
Disallow: /auth/
Disallow: /api/

Sitemap: https://amuhunter.com/sitemap.xml
`
})
