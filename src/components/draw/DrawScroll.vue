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

const scrollContainerRef = ref<HTMLElement | null>(null)
let animationId: number | null = null

onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

function startAnimation() {
  const rewards = props.rewards
  const targetIndex = rewards.findIndex(r => r.id === props.targetReward.id)
  if (targetIndex === -1 || !scrollContainerRef.value) return

  const spins = 3 + Math.floor(Math.random() * 2)
  const totalSteps = spins * rewards.length + targetIndex
  let currentStep = 0

  const baseInterval = 40
  const totalDuration = 3000
  const stepDurations: number[] = []

  for (let i = 0; i < totalSteps; i++) {
    const progress = i / totalSteps
    const eased = easeOutCubic(progress)
    stepDurations[i] = baseInterval + eased * (totalDuration / totalSteps - baseInterval) * 3
  }

  let lastTime = 0
  let accumulated = 0

  function animate(timestamp: number) {
    if (!lastTime) lastTime = timestamp
    const delta = timestamp - lastTime
    lastTime = timestamp
    accumulated += delta

    const interval = currentStep < totalSteps ? stepDurations[currentStep] : stepDurations[stepDurations.length - 1]

    if (accumulated >= interval) {
      accumulated = 0
      currentStep++
      const currentIndex = currentStep % rewards.length
      updateDisplay(currentIndex)

      if (currentStep >= totalSteps) {
        animationId = null
        emit('complete')
        return
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
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
