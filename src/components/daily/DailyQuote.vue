<script setup lang="ts">
import { computed } from 'vue'
import { useKidsStore, useConfigStore } from '@/stores'

const kidsStore = useKidsStore()
const configStore = useConfigStore()

// Per-kid quote index (in-memory, resets on page load)
const kidQuoteIndices: Record<number, number> = {}

const currentQuote = computed(() => {
  const kid = kidsStore.currentKid
  if (!kid) return ''

  // Combine default + custom quotes
  const allQuotes = defaultQuotes.concat(configStore.systemConfig.customQuotes || [])
  if (allQuotes.length === 0) return '暂无每日一句'

  // If kid already has an index, use it; otherwise random
  if (kidQuoteIndices[kid.id] === undefined) {
    kidQuoteIndices[kid.id] = Math.floor(Math.random() * allQuotes.length)
  }

  return allQuotes[kidQuoteIndices[kid.id]]
})

// Import default quotes - will be filled in Task 13 data extraction
import { defaultQuotes } from '@/data/defaultQuotes'
</script>

<template>
  <div class="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-[15px] p-4 mb-4 shadow-sm">
    <div class="text-[16px] font-bold text-[#2E7D32] mb-2">💡 每日一句</div>
    <div class="text-[15px] text-[#333] leading-relaxed">{{ currentQuote }}</div>
  </div>
</template>