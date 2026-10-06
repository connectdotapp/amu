<script setup lang="ts">
// 프로덕트 상세용 OG. 썸네일 + 제목 + 태그라인 + 카테고리/가격 메타.
defineProps<{
  name?: string
  tagline?: string
  category?: string
  pricing?: string
  thumbnailUrl?: string
  isPick?: boolean
}>()

const pricingLabel: Record<string, string> = {
  free: '무료',
  freemium: '프리미엄',
  paid: '유료',
  subscription: '구독'
}
</script>

<template>
  <div style="width:1200px;height:630px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;font-family:'Noto Sans KR'">
    <!-- 상단 로고 -->
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:48px;height:48px;background:#0A0A0A;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:800;letter-spacing:-0.03em">
          A
        </div>
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#0A0A0A">
          AMU
        </div>
      </div>

      <div v-if="isPick" style="background:#0A0A0A;color:white;padding:10px 18px;border-radius:999px;font-size:16px;font-weight:700">
        AMU Pick
      </div>
    </div>

    <!-- 본문 -->
    <div style="display:flex;align-items:center;gap:48px">
      <!-- 썸네일 -->
      <div v-if="thumbnailUrl" style="width:220px;height:220px;border-radius:40px;overflow:hidden;background:#F5F5F5;display:flex;flex-shrink:0">
        <img :src="thumbnailUrl" style="width:100%;height:100%;object-fit:cover" />
      </div>
      <div v-else style="width:220px;height:220px;border-radius:40px;background:#F5F5F5;flex-shrink:0" />

      <!-- 텍스트 -->
      <div style="display:flex;flex-direction:column;gap:16px;max-width:720px">
        <div style="font-size:60px;font-weight:800;letter-spacing:-0.03em;color:#0A0A0A;line-height:1.05">
          {{ name || 'Product' }}
        </div>
        <div v-if="tagline" style="font-size:28px;font-weight:500;color:#525252;line-height:1.4">
          {{ tagline }}
        </div>
      </div>
    </div>

    <!-- 하단 메타 -->
    <div style="display:flex;align-items:center;gap:12px">
      <div v-if="category" style="background:#0A0A0A;color:white;padding:10px 20px;border-radius:999px;font-size:18px;font-weight:600">
        {{ category }}
      </div>
      <div v-if="pricing" style="background:#F5F5F5;color:#262626;padding:10px 20px;border-radius:999px;font-size:18px;font-weight:600">
        {{ pricingLabel[pricing] || pricing }}
      </div>
    </div>
  </div>
</template>
