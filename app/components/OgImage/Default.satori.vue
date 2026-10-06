<script setup lang="ts">
// 기본 OG 템플릿. 홈·일반 페이지에서 사용.
// 1200x630 (OG 표준 크기)
defineProps<{
  title?: string
  description?: string
  eyebrow?: string
}>()
</script>

<template>
  <div style="width:1200px;height:630px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;font-family:'Noto Sans KR'">
    <!-- 상단 로고 영역 -->
    <div style="display:flex;align-items:center;gap:16px">
      <div style="width:64px;height:64px;background:#0A0A0A;border-radius:16px;display:flex;align-items:center;justify-content:center;color:white;font-size:32px;font-weight:800;letter-spacing:-0.03em">
        A
      </div>
      <div style="font-size:28px;font-weight:800;letter-spacing:-0.03em;color:#0A0A0A">
        AMU
      </div>
    </div>

    <!-- 중앙 본문 -->
    <div style="display:flex;flex-direction:column;gap:24px">
      <div v-if="eyebrow" style="font-size:18px;font-weight:700;letter-spacing:0.12em;color:#0A0A0A;text-transform:uppercase">
        {{ eyebrow }}
      </div>
      <div style="font-size:72px;font-weight:800;letter-spacing:-0.03em;color:#0A0A0A;line-height:1.05">
        {{ title || '한국 1인개발자가 만든 앱 중 쓸만한 것만' }}
      </div>
      <div v-if="description" style="font-size:28px;font-weight:400;color:#737373;line-height:1.5;max-width:900px">
        {{ description }}
      </div>
    </div>

    <!-- 하단 -->
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div style="font-size:20px;font-weight:600;color:#737373">
        아무거나 먹지 않는 새, 아무가 매주 3개 뽑는다
      </div>
      <div style="font-size:18px;font-weight:700;color:#0A0A0A">
        amu.app
      </div>
    </div>
  </div>
</template>
