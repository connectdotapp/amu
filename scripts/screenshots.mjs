import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import puppeteer from 'puppeteer'

const BASE = 'https://amu-project-6efae.web.app'
const OUT = resolve(process.cwd(), 'screenshots')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

// 캡처할 페이지 리스트
const pages = [
  { slug: '01-home',               path: '/',                   wait: 1500 },
  { slug: '02-collections-list',   path: '/collections',        wait: 1200 },
  { slug: '03-collection-detail',  path: '/collections/1인-개발자를-위한-도구', wait: 1500 },
  { slug: '04-category-lifestyle', path: '/categories/lifestyle', wait: 1500 },
  { slug: '05-category-entertainment', path: '/categories/entertainment', wait: 1500 },
  { slug: '06-login',              path: '/login',              wait: 1500 },
  { slug: '07-about',              path: '/about',              wait: 1500 },
  { slug: '08-community',          path: '/community',          wait: 1200 },
  { slug: '09-community-notices',  path: '/community/notices',  wait: 1200 },
  { slug: '10-community-faq',      path: '/community/faq',      wait: 1200 },
  { slug: '11-ranking',            path: '/rankings/weekly',    wait: 1500 },
  { slug: '12-legal-privacy',      path: '/legal/privacy',      wait: 1200 },
  { slug: '13-legal-terms',        path: '/legal/terms',        wait: 1200 },
  { slug: '14-404',                path: '/this-page-does-not-exist', wait: 1200 }
]

const DESKTOP = { width: 1440, height: 900, deviceScaleFactor: 1 }

async function capture() {
  const browser = await puppeteer.launch({ headless: 'new' })

  for (const { slug, path, wait } of pages) {
    const url = `${BASE}${path}`
    const page = await browser.newPage()
    await page.setViewport(DESKTOP)
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
      await new Promise(r => setTimeout(r, wait))
      const file = resolve(OUT, `${slug}.png`)
      await page.screenshot({ path: file, fullPage: true })
      console.log(`✓ ${slug}`)
    } catch (e) {
      console.log(`✗ ${slug}: ${e.message}`)
    }
    await page.close()
  }

  await browser.close()
  console.log(`\n완료 → ${OUT}`)
}

capture().catch((e) => {
  console.error(e)
  process.exit(1)
})
