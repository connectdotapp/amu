<script setup lang="ts">
defineProps<{
  name?: string
  productCount?: number
  totalUpvotes?: number
  quote?: string
}>()
</script>

<template>
  <div style="width:1200px;height:630px;background:#FFFFFF;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;font-family:'Noto Sans KR'">
    <!-- 상단 -->
    <div style="display:flex;align-items:center;gap:14px">
      <div style="width:48px;height:48px;background:#0A0A0A;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-size:24px;font-weight:800;letter-spacing:-0.03em">
        A
      </div>
      <div style="font-size:22px;font-weight:700;letter-spacing:-0.03em;color:#0A0A0A">
        AMU
      </div>
    </div>

    <!-- 본문 -->
    <div style="display:flex;flex-direction:column;gap:28px">
      <div style="font-size:18px;font-weight:700;letter-spacing:0.12em;color:#0A0A0A;text-transform:uppercase">
        Maker
      </div>
      <div style="font-size:84px;font-weight:800;letter-spacing:-0.03em;color:#0A0A0A;line-height:1.0">
        {{ name || 'Maker' }}
      </div>

      <div v-if="quote" style="display:flex;align-items:stretch;gap:16px;max-width:900px">
        <div style="width:4px;background:#0A0A0A;border-radius:2px;flex-shrink:0" />
        <div style="font-size:26px;font-weight:600;color:#262626;line-height:1.4;font-style:italic">
          "{{ quote }}"
        </div>
      </div>
    </div>

    <!-- 하단 통계 -->
    <div style="display:flex;align-items:center;gap:40px">
      <div v-if="productCount != null" style="display:flex;align-items:baseline;gap:8px">
        <div style="font-size:40px;font-weight:800;color:#0A0A0A">{{ productCount }}</div>
        <div style="font-size:20px;color:#737373;font-weight:600">개 작품</div>
      </div>
      <div v-if="totalUpvotes != null" style="display:flex;align-items:baseline;gap:8px">
        <div style="font-size:40px;font-weight:800;color:#0A0A0A">↑{{ totalUpvotes }}</div>
        <div style="font-size:20px;color:#737373;font-weight:600">업보트</div>
      </div>
    </div>
  </div>
</template>
