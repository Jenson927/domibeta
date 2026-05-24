<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  { label: '常用', emojis: ['📝', '⭐', '💯', '🏆', '🌟', '💡', '🎨', '😊', '🤝', '✅'] },
  { label: '生活', emojis: ['🧹', '🧺', '🪥', '🛏️', '⏰', '🌅', '🥐', '🍽', '🍲', '🛒'] },
  { label: '运动', emojis: ['🏃', '🚴', '🏊', '🚫', '💪', '🎯', '🏀', '⚽', '🚗', '🚶'] },
  { label: '学习', emojis: ['📖', '📚', '📋', '📕', '📓', '🎨', '✏️', '🧠', '🎓', '📝'] },
  { label: '行为', emojis: ['🙉', '😠', '🤬', '📢', '⏳', '💤', '🎮', '🤥', '📉', '😤'] },
  { label: '食物', emojis: ['🍦', '🍪', '🍗', '🍯', '🥐', '🍲', '🧸', '🌸', '💐', '💰'] },
  { label: '物品', emojis: ['📱', '💰', '🎁', '🧸', '🎬', '🛒', '👑', '💎', '🎪', '🎲'] },
  { label: '自然', emojis: ['🌳', '🏔️', '🌸', '☀️', '🌙', '🔥', '💧', '🌈', '⭐', '🍀'] }
]

function selectEmoji(emoji: string) {
  emit('update:modelValue', emoji)
  isOpen.value = false
}
</script>

<template>
  <div class="relative inline-block">
    <button
      class="w-10 h-10 border-2 border-[#E0E0E0] rounded-[10px] text-[24px] flex items-center justify-center cursor-pointer hover:border-[#2196F3] transition-colors"
      @click="isOpen = !isOpen"
    >
      {{ modelValue || '😀' }}
    </button>

    <Transition name="emoji-dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full left-0 mt-2 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] p-4 z-[2000] w-[280px] max-h-[300px] overflow-y-auto"
      >
        <div v-for="cat in EMOJI_CATEGORIES" :key="cat.label" class="mb-3">
          <div class="text-[12px] text-[#999] mb-1">{{ cat.label }}</div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="emoji in cat.emojis"
              :key="emoji"
              class="w-8 h-8 text-[18px] flex items-center justify-center rounded hover:bg-[#E3F2FD] cursor-pointer transition-colors border-none bg-transparent"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.emoji-dropdown-enter-active,
.emoji-dropdown-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.emoji-dropdown-enter-from,
.emoji-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>