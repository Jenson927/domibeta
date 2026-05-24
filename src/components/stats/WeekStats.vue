<script setup lang="ts">
import { computed } from 'vue'
import { useKidsStore } from '@/stores'

const kidsStore = useKidsStore()

const stats = computed(() => kidsStore.weekStats)
</script>

<template>
  <div v-if="stats" class="mt-[20px]">
    <div class="text-[#333] text-[16px] mb-[12px] flex items-center gap-[8px]">
      📈 本周统计
    </div>
    <div class="grid grid-cols-5 gap-2">
      <div class="text-center p-2 bg-white rounded-[10px] shadow-sm">
        <div class="text-[12px] text-[#666] mb-1">➕ 加分</div>
        <div class="text-[16px] font-bold text-[#4CAF50]">+{{ stats.weekAdd }}</div>
      </div>
      <div class="text-center p-2 bg-white rounded-[10px] shadow-sm">
        <div class="text-[12px] text-[#666] mb-1">➖ 扣分</div>
        <div class="text-[16px] font-bold text-[#F44336]">-{{ stats.weekDeduct }}</div>
      </div>
      <div class="text-center p-2 bg-white rounded-[10px] shadow-sm">
        <div class="text-[12px] text-[#666] mb-1">📦 兑换</div>
        <div class="text-[16px] font-bold text-[#FF9800]">-{{ stats.weekExchange }}</div>
      </div>
      <div class="text-center p-2 bg-white rounded-[10px] shadow-sm">
        <div class="text-[12px] text-[#666] mb-1">🎰 兑奖</div>
        <div class="text-[16px] font-bold text-[#9C27B0]">-{{ stats.weekDraw }}</div>
      </div>
      <div class="text-center p-2 bg-white rounded-[10px] shadow-sm">
        <div class="text-[12px] text-[#666] mb-1">📊 本周积分</div>
        <div class="text-[16px] font-bold" :class="stats.weekNet < 0 ? 'text-[#F44336]' : 'text-[#333]'">
          {{ stats.weekNet }}
        </div>
      </div>
    </div>
  </div>
</template>