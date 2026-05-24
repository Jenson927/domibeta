<script setup lang="ts">
import { useKidsStore } from '@/stores'

const kidsStore = useKidsStore()
</script>

<template>
  <header class="text-center py-4">
    <h1 class="text-2xl font-bold text-[#333]">🎁 积分管理系统</h1>
    <div class="text-sm text-[#666] mt-1" v-html="kidsStore.totalPointsSummary"></div>
  </header>
</template>