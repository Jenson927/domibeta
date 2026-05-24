<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Reward } from '@/types/reward'

const props = defineProps<{
  rewards: Reward[]
  targetReward: Reward
}>()

const emit = defineEmits<{
  complete: []
}>()

// Imperative DOM refs - NOT Vue reactive for animation
const scrollContainerRef = ref<HTMLElement | null>(null)
let animationTimer: number | null = null

onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  if (animationTimer) clearTimeout(animationTimer)
})

function startAnimation() {
  const rewards = props.rewards
  const targetIndex = rewards.findIndex(r => r.id === props.targetReward.id)
  if (targetIndex === -1 || !scrollContainerRef.value) return

  const spins = 3 + Math.floor(Math.random() * 2)
  const totalSteps = spins * rewards.length + targetIndex
  let currentStep = 0
  let speed = 40

  function scrollAnimation() {
    currentStep++
    const currentIndex = currentStep % rewards.length
    updateDisplay(currentIndex)

    // Gradual slowdown
    if (currentStep > totalSteps - 4) {
      speed += 30
    } else if (currentStep > totalSteps - 8) {
      speed += 15
    }

    if (currentStep < totalSteps) {
      animationTimer = window.setTimeout(scrollAnimation, speed)
    } else {
      // Animation complete
      emit('complete')
    }
  }

  animationTimer = window.setTimeout(scrollAnimation, speed)
}

function updateDisplay(currentIndex: number) {
  const rewards = props.rewards
  const prevIndex = (currentIndex - 1 + rewards.length) % rewards.length
  const nextIndex = (currentIndex + 1) % rewards.length

  if (!scrollContainerRef.value) return

  const rows = scrollContainerRef.value.querySelectorAll('.draw-scroll-row')
  if (rows.length >= 3) {
    rows[0].textContent = rewards[prevIndex].icon + ' ' + rewards[prevIndex].name
    rows[1].textContent = rewards[currentIndex].icon + ' ' + rewards[currentIndex].name
    rows[2].textContent = rewards[nextIndex].icon + ' ' + rewards[nextIndex].name
  }
}
</script>

<template>
  <div ref="scrollContainerRef" class="text-center py-4">
    <div class="draw-scroll-row text-[24px] text-[#999] py-2 opacity-60">
      ...
    </div>
    <div class="draw-scroll-row text-[36px] font-bold py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-white rounded-[15px] shadow-lg">
      ...
    </div>
    <div class="draw-scroll-row text-[24px] text-[#999] py-2 opacity-60">
      ...
    </div>
  </div>
</template>