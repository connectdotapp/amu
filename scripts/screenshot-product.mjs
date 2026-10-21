import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import puppeteer from 'puppeteer'

const credPath = process.env.LOCAL_SERVICE_ACCOUNT_PATH
  || resolve(process.cwd(), 'amu-project-6efae-firebase-adminsdk-fbsvc-b930e9c8d7.json')

initializeApp({ credential: cert(JSON.parse(readFileSync(credPath, 'utf-8'))) })
const db = getFirestore()

// 김밥 카메라 Kimbap Cam — 라이프스타일 섹션 상단에 보이던 썸네일 좋은 제품.
const snap = await db.collection('products')
  .where('name', '==', '김밥 카메라 Kimbap Cam')
  .limit(1).get()

if (snap.empty) {
  console.error('product not found')
  process.exit(1)
}

const doc = snap.docs[0]
const data = doc.data()
const slug = data.slug || doc.id
const url = `https://amu-project-6efae.web.app/products/${slug}`

const OUT = resolve(process.cwd(), 'screenshots')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({ headless: 'new' })
const page = await browser.newPage()

// 쿠키 동의 모달이 뜨지 않도록 접속 전에 localStorage 세팅
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem('amu-cookie-consent', 'accepted') } catch {}
})

await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
await new Promise(r => setTimeout(r, 2500))

const file = resolve(OUT, `15-product-kimbap-cam.png`)
await page.screenshot({ path: file, fullPage: true })

console.log(`✓ ${data.name} → ${file}`)
await browser.close()
process.exit(0)
