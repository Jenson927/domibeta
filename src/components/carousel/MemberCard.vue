<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '@/stores'
import type { Kid } from '@/types/kid'

const props = defineProps<{
  kid: Kid
}>()

const configStore = useConfigStore()

const emit = defineEmits<{
  addPoints: []
  deductPoints: []
  exchange: []
  draw: []
}>()

const pointsDisplay = computed(() => {
  const p = props.kid.totalPoints
  return p < 0 ? `${p}` : `${p}`
})

const isNegative = computed(() => props.kid.totalPoints < 0)

const drawLabel = computed(() => {
  if (props.kid.drawChances > 0) {
    return `🎰 兑奖(${props.kid.drawChances}次)`
  }
  const remaining = configStore.exchangeRate - (props.kid.totalPoints % configStore.exchangeRate)
  if (props.kid.totalPoints < 0) {
    return `🎰 兑奖(需${Math.abs(props.kid.totalPoints) + remaining}分)`
  }
  return `兑奖(差${remaining}分)`
})

const canDraw = computed(() => props.kid.drawChances > 0)
</script>

<template>
  <div class="text-center">
    <!-- Name -->
    <div class="text-[26px] font-bold text-[#222] mb-[5px]">{{ kid.name }}</div>

    <!-- Points -->
    <div
      class="text-[32px] font-bold mb-[15px]"
      :class="isNegative ? 'text-[#F44336]' : 'text-[#4CAF50]'"
    >
      {{ pointsDisplay }} 分
    </div>

    <!-- Avatar -->
    <div
      class="w-[90px] h-[90px] rounded-full mx-auto mb-[15px] bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center text-[42px] border-[3px] border-[#E0E0E0] overflow-hidden"
    >
      <img
        v-if="kid.avatar"
        :src="kid.avatar"
        class="w-full h-full object-cover rounded-full pointer-events-none"
        draggable="false"
      />
      <span v-else>👤</span>
    </div>

    <!-- Action buttons -->
    <div class="flex justify-center gap-2 mt-[10px]">
      <button
        class="px-[16px] py-[8px] text-[14px] bg-[#4CAF50] text-white border-none rounded-[8px] cursor-pointer hover:bg-[#388E3C] transition-colors"
        @click="emit('addPoints')"
      >
        ➕ 加分
      </button>
      <button
        class="px-[16px] py-[8px] text-[14px] bg-[#F44336] text-white border-none rounded-[8px] cursor-pointer hover:bg-[#D32F2F] transition-colors"
        @click="emit('deductPoints')"
      >
        ➖ 扣分
      </button>
      <button
        class="px-[16px] py-[8px] text-[14px] bg-[#FF9800] text-white border-none rounded-[8px] cursor-pointer hover:bg-[#F57C00] transition-colors"
        @click="emit('exchange')"
      >
        📦 兑换
      </button>
      <button
        class="px-[16px] py-[8px] text-[14px] border-none rounded-[8px] cursor-pointer transition-colors"
        :class="canDraw ? 'bg-[#9C27B0] text-white hover:bg-[#7B1FA2]' : 'bg-[#BDBDBD] text-white cursor-not-allowed'"
        :disabled="!canDraw"
        @click="emit('draw')"
      >
        {{ drawLabel }}
      </button>
    </div>
  </div>
</template>