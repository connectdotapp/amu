import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const PUB = resolve(process.cwd(), 'public')
const banners = ['hero-banner.png', 'hero-banner-2.png', 'hero-banner-3.png', 'hero-banner-4.png', 'hero-banner-5.png']

// 데스크톱 35:9 / 모바일 2:1 — 서로 다른 비율이라 각 디바이스 전용 원본을 둠.
//   데스크톱 원본: public/hero-banner.png  (권장 1600x411 또는 그 이상 wide)
//   모바일 원본:  public/hero-mobile/hero-banner.png  (권장 1200x600)
// 모바일 원본이 없으면 데스크톱 원본을 center-crop 해서 대체 (상/하 잘림).
const DESKTOP_W = 1600
const DESKTOP_H = Math.round(1600 * 9 / 35) // 35:9 → 411
const MOBILE_W = 1200
const MOBILE_H = 600 // 2:1

console.log(`Target: desktop ${DESKTOP_W}x${DESKTOP_H}, mobile ${MOBILE_W}x${MOBILE_H}`)

for (const file of banners) {
  const desktopSrc = resolve(PUB, file)
  const mobileSrc = resolve(PUB, 'hero-mobile', file)
  const base = file.replace(/\.png$/, '')
  const desktopOut = resolve(PUB, `${base}.webp`)
  const mobileOut = resolve(PUB, `${base}-m.webp`)

  if (!existsSync(desktopSrc)) {
    console.warn(`✗ ${file}: 데스크톱 원본 없음, 건너뜀`)
    continue
  }

  const originalSize = statSync(desktopSrc).size

  await sharp(desktopSrc)
    .resize(DESKTOP_W, DESKTOP_H, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 85, effort: 5 })
    .toFile(desktopOut)

  const hasMobileSrc = existsSync(mobileSrc)
  await sharp(hasMobileSrc ? mobileSrc : desktopSrc)
    .resize(MOBILE_W, MOBILE_H, { fit: 'cover', position: 'center', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 80, effort: 5 })
    .toFile(mobileOut)

  const dSize = statSync(desktopOut).size
  const mSize = statSync(mobileOut).size
  const mobileTag = hasMobileSrc ? '전용 원본' : '데스크톱 crop'

  console.log(`${file}: ${(originalSize / 1024).toFixed(0)}KB → desktop ${(dSize / 1024).toFixed(0)}KB, mobile ${(mSize / 1024).toFixed(0)}KB (${mobileTag})`)
}
console.log('✓ 완료')
