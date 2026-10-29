// /robots.txt — nuxt-robots 모듈이 Firebase Hosting Frameworks 모드에서
// 라우트를 노출하지 못해 Nitro 직접 라우트로 처리.
// 변경 시 Yeti (네이버 봇) 그룹도 함께 유지할 것.
export default defineEventHandler((event) => {
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
