<script setup lang="ts">
import { watch, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  zIndex?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Prevent body scroll when modal is open
watch(
  () => props.modelValue,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/50 flex items-center justify-center"
      :style="{ zIndex: zIndex ?? 1000 }"
      @click.self="close"
    >
      <div class="bg-white p-[30px] rounded-[15px] max-w-[500px] w-[90%] max-h-[80vh] overflow-y-auto relative">
        <!-- Header -->
        <div v-if="title" class="flex justify-between items-center mb-[20px]">
          <h2 class="text-[#333] font-bold">{{ title }}</h2>
          <button
            class="bg-none border-none text-[30px] cursor-pointer text-[#9E9E9E] leading-none hover:text-[#333] transition-colors"
            @click="close"
          >
            ×
          </button>
        </div>
        <!-- Body -->
        <slot />
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>