import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const PUB = resolve(process.cwd(), 'public')
const banners = ['hero-banner.png', 'hero-banner-2.png', 'hero-banner-3.png', 'hero-banner-4.png', 'hero-banner-5.png']

// 데스크톱 35:9, 모바일 2:1 (서로 다른 비율 — 원본은 데스크톱 기준이므로
// 모바일 리사이즈는 center crop 됨. 모바일 전용 원본을 쓰려면 별도 파이프라인 필요.)
const DESKTOP_W = 1600
const DESKTOP_H = Math.round(1600 * 9 / 35)
const MOBILE_W = 1200
const MOBILE_H = Math.round(1200 / 2) // 2:1

console.log(`Target: desktop ${DESKTOP_W}x${DESKTOP_H}, mobile ${MOBILE_W}x${MOBILE_H}`)

for (const file of banners) {
  const src = resolve(PUB, file)
  const base = file.replace(/\.png$/, '')
  const desktopOut = resolve(PUB, `${base}.webp`)
  const mobileOut = resolve(PUB, `${base}-m.webp`)

  const originalSize = statSync(src).size

  await sharp(src)
    .resize(DESKTOP_W, DESKTOP_H, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 85, effort: 5 })
    .toFile(desktopOut)

  await sharp(src)
    .resize(MOBILE_W, MOBILE_H, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 80, effort: 5 })
    .toFile(mobileOut)

  const dSize = statSync(desktopOut).size
  const mSize = statSync(mobileOut).size

  console.log(`${file}: ${(originalSize / 1024).toFixed(0)}KB → desktop ${(dSize / 1024).toFixed(0)}KB (-${Math.round((1 - dSize / originalSize) * 100)}%), mobile ${(mSize / 1024).toFixed(0)}KB (-${Math.round((1 - mSize / originalSize) * 100)}%)`)
}
console.log('✓ 완료')
