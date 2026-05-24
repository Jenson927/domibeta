<script setup lang="ts">
import type { Reward } from '@/types/reward'

defineProps<{
  reward: Reward
}>()
</script>

<template>
  <div class="text-center py-6 animate-bounce-in">
    <div class="text-[80px] mb-4">{{ reward.icon }}</div>
    <div class="text-[28px] font-bold text-[#FF9800]">{{ reward.name }}</div>
    <div class="text-[16px] text-[#666] mt-2">🎉 恭喜获得奖励！</div>
  </div>
</template>

<style scoped>
.animate-bounce-in {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>