<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Reward } from '@/types/reward'

const props = defineProps<{
  rewards: Reward[]
  targetReward: Reward
}>()

const emit = defineEmits<{
  complete: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

const SEGMENT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F0B27A', '#82E0AA',
  '#F1948A', '#AED6F1', '#A3E4D7', '#FAD7A0',
  '#D2B4DE', '#A9CCE3', '#A9DFBF', '#F5CBA7',
  '#D5DBDB', '#ABEBC6', '#F9E79F', '#D7BDE2'
]

const displayRewards = computed(() => {
  return props.rewards.length > 0 ? props.rewards : [{ id: 0, name: '暂无奖品', weight: 1, icon: '🎁' }]
})

onMounted(() => {
  drawWheel(0)
  requestAnimationFrame(() => startSpin())
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

function drawWheel(rotation: number) {
  const canvas = canvasRef.value
  if (!canvas) return

  const size = Math.min(canvas.parentElement?.clientWidth || 300, 340)
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const centerX = size / 2
  const centerY = size / 2
  const radius = size / 2 - 8
  const rewards = displayRewards.value
  const segmentAngle = (2 * Math.PI) / rewards.length

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(rotation)

  rewards.forEach((reward, i) => {
    const startAngle = i * segmentAngle - Math.PI / 2
    const endAngle = startAngle + segmentAngle

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, radius, startAngle, endAngle)
    ctx.closePath()

    ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
    ctx.fill()

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.save()
    ctx.rotate(startAngle + segmentAngle / 2)

    const iconDist = radius * 0.62
    const nameDist = radius * 0.38

    ctx.font = `${Math.max(18, Math.min(28, radius / 6))}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(reward.icon, iconDist, 0)

    ctx.font = `bold ${Math.max(9, Math.min(13, radius / 16))}px sans-serif`
    ctx.fillStyle = '#333'
    ctx.fillText(reward.name, nameDist, 0)

    ctx.restore()
  })

  ctx.restore()

  ctx.beginPath()
  ctx.arc(centerX, centerY, Math.max(16, radius * 0.1), 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  ctx.strokeStyle = '#FF9800'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, centerY, Math.max(8, radius * 0.05), 0, Math.PI * 2)
  ctx.fillStyle = '#FF9800'
  ctx.fill()

  drawPointer(ctx, centerX, radius)
}

function drawPointer(ctx: CanvasRenderingContext2D, centerX: number, radius: number) {
  const pointerSize = Math.max(14, radius * 0.09)
  ctx.beginPath()
  ctx.moveTo(centerX, 6)
  ctx.lineTo(centerX - pointerSize, 6 - pointerSize * 1.5)
  ctx.lineTo(centerX + pointerSize, 6 - pointerSize * 1.5)
  ctx.closePath()
  ctx.fillStyle = '#F44336'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
}

function startSpin() {
  const rewards = displayRewards.value
  const targetIndex = rewards.findIndex(r => r.id === props.targetReward.id)
  if (targetIndex === -1) return

  const segmentAngle = (2 * Math.PI) / rewards.length
  const targetAngle = targetIndex * segmentAngle + segmentAngle / 2

  const spins = 5 + Math.floor(Math.random() * 3)
  const totalRotation = spins * 2 * Math.PI + (2 * Math.PI - targetAngle)

  const duration = 4000
  let startTime: number | null = null

  function animate(timestamp: number) {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)

    const eased = easeOutQuart(progress)
    const currentRotation = totalRotation * eased

    drawWheel(currentRotation)

    if (progress < 1) {
      animationId = requestAnimationFrame(animate)
    } else {
      animationId = null
      emit('complete')
    }
  }

  animationId = requestAnimationFrame(animate)
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}
</script>

<template>
  <div class="flex justify-center py-2">
    <canvas ref="canvasRef" class="draw-wheel-canvas" />
  </div>
</template>

<style scoped>
.draw-wheel-canvas {
  max-width: 340px;
  max-height: 340px;
}
</style>
