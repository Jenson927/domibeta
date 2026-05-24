<script setup lang="ts">
import { ref, computed } from 'vue'
import { useKidsStore, useConfigStore } from '@/stores'

const kidsStore = useKidsStore()
const configStore = useConfigStore()

const showAnswer = ref(false)

// Per-kid riddle state (in-memory)
const kidCurrentRiddle: Record<number, number> = {}
const kidRiddleHistory: Record<number, string[]> = {}

const currentRiddle = computed(() => {
  const kid = kidsStore.currentKid
  if (!kid) return null

  // Combine default + custom riddles
  const allRiddles = defaultRiddles.concat(configStore.systemConfig.customRiddles || [])
  if (allRiddles.length === 0) return null

  // If kid already has an index, use it
  if (kidCurrentRiddle[kid.id] !== undefined) {
    return allRiddles[kidCurrentRiddle[kid.id]]
  }

  // Smart random: avoid recent 10
  if (!kidRiddleHistory[kid.id]) kidRiddleHistory[kid.id] = []
  const history = kidRiddleHistory[kid.id]

  let randomIndex: number
  let attempts = 0
  const maxAttempts = 50

  do {
    randomIndex = Math.floor(Math.random() * allRiddles.length)
    attempts++
    const selectedQ = allRiddles[randomIndex].q
    if (attempts > maxAttempts || history.length < 10) break
    if (!history.includes(selectedQ)) break
  } while (true)

  kidCurrentRiddle[kid.id] = randomIndex
  // Track by question text (not index)
  history.push(allRiddles[randomIndex].q)
  if (history.length > 10) history.shift()

  return allRiddles[randomIndex]
})

function toggleAnswer() {
  showAnswer.value = !showAnswer.value
}

function nextRiddle() {
  showAnswer.value = false
  const kid = kidsStore.currentKid
  if (!kid) return
  // Clear current riddle index so computed re-selects
  delete kidCurrentRiddle[kid.id]
}

// Import default riddles - will be filled in Task 13 data extraction
import { defaultRiddles } from '@/data/defaultRiddles'
</script>

<template>
  <div class="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-[15px] p-4 mb-4 shadow-sm">
    <div class="text-[16px] font-bold text-[#1565C0] mb-2">🧠 脑筋急转弯</div>
    <div v-if="currentRiddle" class="text-[15px] text-[#333] leading-relaxed mb-2">
      Q: {{ currentRiddle.q }}
    </div>
    <button
      class="p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors mb-2"
      @click="toggleAnswer"
    >
      {{ showAnswer ? '隐藏答案 ▲' : '点击查看答案 ▼' }}
    </button>
    <div v-if="showAnswer && currentRiddle" class="text-[15px] text-[#4CAF50] font-bold mt-2">
      ✓ 答案：{{ currentRiddle.a }}
    </div>
    <button
      class="mt-2 p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors"
      @click="nextRiddle"
    >
      换一题 🔄
    </button>
  </div>
</template>