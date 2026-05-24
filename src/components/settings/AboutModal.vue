<script setup lang="ts">
import { AppModal } from '@/components/common'

const isOpen = defineModel<boolean>({ default: false })
</script>

<template>
  <AppModal v-model="isOpen" title="关于">
    <div class="text-center py-6">
      <div class="text-[24px] font-bold mb-2">🎁 积分管理系统</div>
      <div class="text-[14px] text-[#666] mb-4">Domibeta - Vue 3 版</div>
      <div class="text-[12px] text-[#999] mb-2">版本：V1.0.10</div>
      <div class="text-[12px] text-[#999] mb-1">作者：Jenson927</div>
      <div class="text-[12px] text-[#999] mb-4">框架：Vue 3 + Vite + Pinia + TypeScript + Tailwind CSS</div>
      <div class="bg-[#E3F2FD] rounded-[10px] p-4 text-[14px] text-[#333]">
        <p>📖 一个帮助孩子养成好习惯的积分管理系统</p>
        <p class="mt-2">✅ 加分激励 · ❌ 扣分约束 · 🎁 兑换奖励 · 🎰 兑奖惊喜</p>
      </div>
    </div>
  </AppModal>
</template>