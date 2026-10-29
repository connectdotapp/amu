import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const PUB = resolve(process.cwd(), 'public')
const SRC = resolve(process.cwd(), 'assets/brand/favicon-source.png')

// 검정 여백을 잘라내고 마스코트 주변에 10% 패딩만 남겨 정사각형으로.
const trimmed = await sharp(SRC).trim({ threshold: 40 }).toBuffer({ resolveWithObject: true })
const { width, height } = trimmed.info
const side = Math.round(Math.max(width, height) * 1.2)
const base = await sharp({ create: { width: side, height: side, channels: 4, background: '#000000' } })
  .composite([{ input: trimmed.data, gravity: 'center' }])
  .png()
  .toBuffer()

const sizes = { 'favicon-16x16.png': 16, 'favicon-32x32.png': 32, 'apple-touch-icon.png': 180, 'icon-192.png': 192, 'icon-512.png': 512 }
for (const [name, s] of Object.entries(sizes)) {
  await sharp(base).resize(s, s, { kernel: 'lanczos3' }).png().toFile(resolve(PUB, name))
}

// favicon.ico — 16/32/48 PNG 를 ICO 컨테이너에 그대로 담음.
const icoSizes = [16, 32, 48]
const pngs = await Promise.all(icoSizes.map(s => sharp(base).resize(s, s).png().toBuffer()))
const header = Buffer.alloc(6 + 16 * pngs.length)
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4)
let offset = header.length
pngs.forEach((buf, i) => {
  const e = 6 + i * 16
  header.writeUInt8(icoSizes[i], e); header.writeUInt8(icoSizes[i], e + 1)
  header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6)
  header.writeUInt32LE(buf.length, e + 8); header.writeUInt32LE(offset, e + 12)
  offset += buf.length
})
writeFileSync(resolve(PUB, 'favicon.ico'), Buffer.concat([header, ...pngs]))
console.log('✓ favicons generated')
