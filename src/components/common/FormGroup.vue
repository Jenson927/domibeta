<script setup lang="ts">
defineProps<{
  label?: string
  hint?: string
}>()
</script>

<template>
  <div class="mb-[20px]">
    <label v-if="label" class="block text-[#333] mb-[8px] font-medium">{{ label }}</label>
    <slot />
    <p v-if="hint" class="text-[#999] text-[12px] mt-[5px]">{{ hint }}</p>
  </div>
</template>