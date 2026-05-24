<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationId: number | null = null

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
}

const PARTICLE_COLORS = ['#FFD700', '#FF6B6B', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63']

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const particles: Particle[] = []

  // Create burst of particles
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 3,
      size: Math.random() * 8 + 2,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      life: 0,
      maxLife: 60 + Math.random() * 40
    })
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    let aliveCount = 0
    for (const p of particles) {
      if (p.life >= p.maxLife) continue
      aliveCount++

      p.x += p.vx
      p.y += p.vy
      p.vy += 0.15 // gravity
      p.life++

      const alpha = 1 - p.life / p.maxLife
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = alpha
      ctx.fill()
    }

    ctx.globalAlpha = 1

    if (aliveCount > 0) {
      animationId = requestAnimationFrame(animate)
    }
  }

  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="fixed inset-0 z-[9999] pointer-events-none"
  />
</template>