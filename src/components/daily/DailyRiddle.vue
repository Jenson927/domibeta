<script setup lang="ts">
import { ref, shallowRef, watch, onUnmounted } from 'vue'
import { useKidsStore, useConfigStore } from '@/stores'

const kidsStore = useKidsStore()
const configStore = useConfigStore()

const showAnswer = ref(false)
const countdown = ref<number | null>(null)
const currentRiddleIndex = ref<number | null>(null)
const kidRiddleHistory = shallowRef<Record<number, string[]>>({})
let countdownTimer: ReturnType<typeof setInterval> | null = null

function getAllRiddles() {
  return defaultRiddles.concat(configStore.systemConfig.customRiddles || [])
}

function selectNewRiddle() {
  const kid = kidsStore.currentKid
  if (!kid) return

  const allRiddles = getAllRiddles()
  if (allRiddles.length === 0) return

  if (!kidRiddleHistory.value[kid.id]) {
    kidRiddleHistory.value = { ...kidRiddleHistory.value, [kid.id]: [] }
  }
  const history = kidRiddleHistory.value[kid.id]

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

  currentRiddleIndex.value = randomIndex
  
  const newHistory = [...history]
  newHistory.push(allRiddles[randomIndex].q)
  if (newHistory.length > 10) newHistory.shift()
  kidRiddleHistory.value = { ...kidRiddleHistory.value, [kid.id]: newHistory }
}

function getCurrentRiddle() {
  const kid = kidsStore.currentKid
  if (!kid || currentRiddleIndex.value === null) return null
  const allRiddles = getAllRiddles()
  if (allRiddles.length === 0) return null
  return allRiddles[currentRiddleIndex.value]
}

watch(
  () => kidsStore.currentKid?.id,
  (newKidId) => {
    if (newKidId) {
      selectNewRiddle()
    }
  },
  { immediate: true }
)

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  countdown.value = null
}

function toggleAnswer() {
  if (showAnswer.value) {
    showAnswer.value = false
    clearCountdown()
    return
  }

  const delay = configStore.systemConfig.riddleAnswerDelay
  const actualDelay = typeof delay === 'number' && delay >= 0 ? delay : 3
  
  if (actualDelay <= 0) {
    showAnswer.value = true
    return
  }

  countdown.value = actualDelay
  
  countdownTimer = setInterval(() => {
    if (countdown.value !== null && countdown.value > 0) {
      countdown.value--
    } else {
      clearCountdown()
      showAnswer.value = true
    }
  }, 1000)
}

function nextRiddle() {
  showAnswer.value = false
  clearCountdown()
  selectNewRiddle()
}

onUnmounted(() => {
  clearCountdown()
})

import { defaultRiddles } from '@/data/defaultRiddles'
</script>

<template>
  <div class="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-[15px] p-4 mb-4 shadow-sm">
    <div class="text-[16px] font-bold text-[#1565C0] mb-2">🧠 脑筋急转弯</div>
    <div v-if="getCurrentRiddle()" class="text-[15px] text-[#333] leading-relaxed mb-2">
      Q: {{ getCurrentRiddle().q }}
    </div>
    <button
      class="p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors mb-2"
      @click="toggleAnswer"
    >
      {{ showAnswer ? '隐藏答案 ▲' : '查看答案 ▼' }}
    </button>
    <div v-if="countdown !== null" class="text-[14px] text-[#FF9800] mt-2">
      ⏳ 答案将在 {{ countdown }} 秒后揭晓...
    </div>
    <div v-if="showAnswer && getCurrentRiddle()" class="text-[15px] text-[#4CAF50] font-bold mt-2">
      ✓ 答案：{{ getCurrentRiddle().a }}
    </div>
    <button
      class="mt-2 p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors"
      @click="nextRiddle"
    >
      换一题 🔄
    </button>
  </div>
</template>