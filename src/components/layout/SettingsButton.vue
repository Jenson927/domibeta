<script setup lang="ts">
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    class="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-full shadow-lg text-xl flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 z-50"
    @click="emit('click')"
  >
    ⚙️
  </button>
</template>