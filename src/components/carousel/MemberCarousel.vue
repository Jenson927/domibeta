<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKidsStore } from '@/stores'
import MemberCard from './MemberCard.vue'

const kidsStore = useKidsStore()
const viewportRef = ref<HTMLElement | null>(null)
const kids = computed(() => kidsStore.kids)

const emit = defineEmits<{
  addPoints: []
  deductPoints: []
  exchange: []
  draw: []
}>()

function scrollToIndex(index: number, smooth = true) {
  const el = viewportRef.value
  if (!el || kids.value.length === 0) return
  const idx = Math.max(0, Math.min(index, kids.value.length - 1))
  el.scrollTo({ left: idx * el.clientWidth, behavior: smooth ? 'smooth' : 'instant' })
}

// Track visible kid from scroll position
let syncingScroll = false
function onScroll() {
  if (syncingScroll) return
  const el = viewportRef.value
  if (!el || kids.value.length === 0) return
  const index = Math.round(el.scrollLeft / el.clientWidth)
  const target = kids.value[index]
  if (target && target.id !== kidsStore.currentKidId) {
    kidsStore.selectKid(target.id)
  }
}

// When currentKidId changes externally (e.g. from settings), sync scroll
watch(() => kidsStore.currentKidId, (newId) => {
  const el = viewportRef.value
  if (!el) return
  const idx = kids.value.findIndex(k => k.id === newId)
  if (idx < 0) return
  const currentScrollIndex = Math.round(el.scrollLeft / el.clientWidth)
  if (idx !== currentScrollIndex) {
    syncingScroll = true
    el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' })
    setTimeout(() => { syncingScroll = false }, 400)
  }
})

// Init scroll position once viewport is ready
watch([viewportRef, kids], () => {
  const el = viewportRef.value
  if (!el || kids.value.length === 0) return
  const idx = kids.value.findIndex(k => k.id === kidsStore.currentKidId)
  if (idx > 0) {
    el.scrollLeft = idx * el.clientWidth
  }
}, { once: true })

// Desktop mouse drag-to-scroll (touch is handled natively by scroll-snap)
let mouseDown = false
let mouseStartX = 0
let scrollStartLeft = 0

function isInteractive(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  return el.tagName === 'BUTTON' || el.tagName === 'INPUT' ||
         el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' ||
         !!el.closest('button')
}

function onMouseDown(e: MouseEvent) {
  if (isInteractive(e.target)) return
  mouseDown = true
  mouseStartX = e.clientX
  scrollStartLeft = viewportRef.value?.scrollLeft ?? 0
}

function onMouseMove(e: MouseEvent) {
  if (!mouseDown || !viewportRef.value) return
  viewportRef.value.scrollLeft = scrollStartLeft - (e.clientX - mouseStartX)
}

function onMouseUp() {
  mouseDown = false
}
</script>

<template>
  <div class="flex flex-col items-center relative py-[10px] mb-[25px]">
    <div
      ref="viewportRef"
      class="carousel-viewport w-full overflow-x-auto overflow-y-hidden min-h-[280px] select-none cursor-grab"
      @scroll="onScroll"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseUp"
    >
      <div class="flex">
        <div
          v-for="kid in kids"
          :key="kid.id"
          class="flex-none w-full snap-start"
        >
          <div class="bg-white/95 mx-2 p-[20px] rounded-[15px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-center box-border">
            <MemberCard
              :kid="kid"
              @add-points="emit('addPoints')"
              @deduct-points="emit('deductPoints')"
              @exchange="emit('exchange')"
              @draw="emit('draw')"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Swipe hint -->
    <div v-if="kids.length > 1" class="text-[14px] text-[#666] mt-[6px] text-center font-medium tracking-[0.5px]">
      ◀ 左右滑动切换成员 ▶
    </div>
  </div>
</template>

<style scoped>
.carousel-viewport {
  -ms-overflow-style: none;
  scrollbar-width: none;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  touch-action: pan-x;
}
.carousel-viewport::-webkit-scrollbar {
  display: none;
}
.carousel-viewport > :first-child > * {
  scroll-snap-align: start;
}
</style>
