<script setup lang="ts">
import { ref, computed } from 'vue'
import { useKidsStore } from '@/stores'
import { useSwipe } from '@/composables/useSwipe'
import MemberCard from './MemberCard.vue'

const kidsStore = useKidsStore()

const viewportRef = ref<HTMLElement | null>(null)
const currentIndex = ref(0)

// Initialize index based on currentKidId
const kids = computed(() => kidsStore.kids)
const initialIndex = kids.value.findIndex(k => k.id === kidsStore.currentKidId)
currentIndex.value = initialIndex >= 0 ? initialIndex : 0

function next() {
  if (kids.value.length <= 1) return
  currentIndex.value = (currentIndex.value + 1) % kids.value.length
  kidsStore.selectKid(kids.value[currentIndex.value].id)
}

function prev() {
  if (kids.value.length <= 1) return
  currentIndex.value = (currentIndex.value - 1 + kids.value.length) % kids.value.length
  kidsStore.selectKid(kids.value[currentIndex.value].id)
}

const { isDragging, dragOffset } = useSwipe(viewportRef, {
  onSwipeLeft: next,
  onSwipeRight: prev,
  isDisabled: () => kids.value.length <= 1
})

const trackOffset = computed(() => {
  const base = -currentIndex.value * 100
  // Add drag offset as percentage of viewport width
  const dragPercent = dragOffset.value ? (dragOffset.value / (viewportRef.value?.clientWidth || 1)) * 100 : 0
  return base + dragPercent
})
</script>

<template>
  <div class="flex flex-col items-center relative py-[10px] mb-[25px]">
    <div
      ref="viewportRef"
      class="w-full overflow-hidden relative min-h-[280px] select-none"
      :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    >
      <div
        class="flex will-change-transform"
        :style="{
          transform: `translateX(${trackOffset}%)`,
          transition: isDragging ? 'none' : 'transform 0.45s ease'
        }"
      >
        <div
          v-for="kid in kids"
          :key="kid.id"
          class="flex-none min-w-full bg-white/95 p-[20px] rounded-[15px] shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-center box-border"
        >
          <MemberCard :kid="kid" />
        </div>
      </div>
    </div>
    <!-- Swipe hint -->
    <div v-if="kids.length > 1" class="text-[14px] text-white mt-[6px] text-center font-medium tracking-[0.5px] shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
      ◀ 左右滑动切换成员 ▶
    </div>
  </div>
</template>