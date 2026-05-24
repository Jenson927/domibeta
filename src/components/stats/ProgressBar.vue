<script setup lang="ts">
import { computed } from 'vue'
import { useKidsStore, useConfigStore } from '@/stores'

const kidsStore = useKidsStore()
const configStore = useConfigStore()

const kid = computed(() => kidsStore.currentKid)
const exchangeRate = computed(() => configStore.exchangeRate)

const progress = computed(() => {
  if (!kid.value) return 0
  if (kid.value.totalPoints < 0) return 0
  const positiveMod = ((kid.value.totalPoints % exchangeRate.value) + exchangeRate.value) % exchangeRate.value
  return Math.floor((positiveMod / exchangeRate.value) * 100)
})

const remaining = computed(() => {
  if (!kid.value) return exchangeRate.value
  if (kid.value.totalPoints < 0) return Math.abs(kid.value.totalPoints) + exchangeRate.value
  return exchangeRate.value - (kid.value.totalPoints % exchangeRate.value)
})

const progressInfo = computed(() => {
  if (!kid.value) return ''
  if (kid.value.totalPoints < 0) {
    return `⚠️ 当前欠分 ${Math.abs(kid.value.totalPoints)}，还需 ${remaining.value} 分才能兑奖`
  }
  if (progress.value === 0 && kid.value.totalPoints === 0) return '开始积分即可兑奖！'
  return `还差 ${remaining.value} 分可兑奖`
})
</script>

<template>
  <div class="mt-[20px]">
    <div class="text-[#333] text-[16px] mb-[12px] flex items-center gap-[8px]">
      📊 积分兑奖进度
    </div>
    <!-- Progress bar -->
    <div class="relative bg-[#E0E0E0] rounded-full h-[24px] overflow-hidden mb-[8px]">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#4CAF50] to-[#8BC34A]"
        :style="{ width: progress + '%' }"
      ></div>
      <span class="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-[#333]">
        {{ progress }}%
      </span>
    </div>
    <div class="text-[14px] text-[#666]">{{ progressInfo }}</div>
  </div>
</template>