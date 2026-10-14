import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const PUB = resolve(process.cwd(), 'public')
const banners = ['hero-banner.png', 'hero-banner-2.png', 'hero-banner-3.png', 'hero-banner-4.png', 'hero-banner-5.png']

const DESKTOP_W = 1600
const DESKTOP_H = Math.round(1600 * 9 / 35) // 35:9 aspect
const MOBILE_W = 800
const MOBILE_H = Math.round(800 * 9 / 35)

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
