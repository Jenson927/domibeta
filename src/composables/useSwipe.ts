// Touch/mouse swipe handler for carousel
// Supports grab cursor, drag threshold, and direction detection

import { ref, onMounted, onUnmounted } from 'vue'

export function useSwipe(elementRef: Ref<HTMLElement | null>, options: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
  isDisabled?: () => boolean
}) {
  const isDragging = ref(false)
  const dragOffset = ref(0)

  let startX = 0
  let currentX = 0
  let hasMoved = false
  let startTime = 0

  const threshold = options.threshold ?? 50

  function isInteractiveElement(target: EventTarget | null): boolean {
    if (!target) return false
    const el = target as HTMLElement
    return el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.closest('button') !== null
  }

  function handleStart(e: MouseEvent | TouchEvent) {
    if (options.isDisabled?.()) return
    if (isInteractiveElement(e.target)) return

    hasMoved = false
    startTime = Date.now()

    if (e instanceof TouchEvent) {
      startX = e.touches[0].clientX
      e.preventDefault()
    } else {
      startX = e.clientX
      e.preventDefault()
    }

    currentX = startX
    isDragging.value = true
  }

  function handleMove(e: MouseEvent | TouchEvent) {
    if (!isDragging.value) return

    if (e instanceof TouchEvent) {
      currentX = e.touches[0].clientX
      e.preventDefault()
    } else {
      currentX = e.clientX
    }

    const deltaX = currentX - startX
    if (!hasMoved && Math.abs(deltaX) > 30) {
      hasMoved = true
    }

    if (hasMoved) {
      dragOffset.value = deltaX
    }
  }

  function handleEnd() {
    if (!isDragging.value) return

    const deltaX = currentX - startX
    const elapsed = Date.now() - startTime

    // Swipe detection: threshold or fast flick
    if (hasMoved && (Math.abs(deltaX) > threshold || elapsed < 300)) {
      if (deltaX > 0) {
        options.onSwipeRight?.()
      } else {
        options.onSwipeLeft?.()
      }
    }

    isDragging.value = false
    dragOffset.value = 0
    hasMoved = false
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return

    el.addEventListener('touchstart', handleStart, { passive: false })
    el.addEventListener('touchmove', handleMove, { passive: false })
    el.addEventListener('touchend', handleEnd, { passive: true })

    el.addEventListener('mousedown', handleStart)
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseup', handleEnd)
    el.addEventListener('mouseleave', handleEnd)
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return

    el.removeEventListener('touchstart', handleStart)
    el.removeEventListener('touchmove', handleMove)
    el.removeEventListener('touchend', handleEnd)

    el.removeEventListener('mousedown', handleStart)
    el.removeEventListener('mousemove', handleMove)
    el.removeEventListener('mouseup', handleEnd)
    el.removeEventListener('mouseleave', handleEnd)
  })

  return { isDragging, dragOffset }
}

// Need to import Ref type
import type { Ref } from 'vue'