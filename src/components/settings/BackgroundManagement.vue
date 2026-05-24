<script setup lang="ts">
import { ref } from 'vue'
import { AppModal } from '@/components/common'
import { useConfigStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const configStore = useConfigStore()

const fileInputRef = ref<HTMLInputElement | null>(null)

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (dataUrl) {
      configStore.addBackgroundPhoto(dataUrl)
    }
  }
  reader.readAsDataURL(file)
  // Reset input so same file can be selected again
  input.value = ''
}

function selectPhoto(index: number) {
  configStore.systemConfig.currentPhotoIndex = index
  configStore.$patch({ systemConfig: { ...configStore.systemConfig } })
}

function deletePhoto(index: number) {
  if (confirm('确定删除这张照片？')) {
    configStore.removeBackgroundPhoto(index)
  }
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}
</script>

<template>
  <AppModal v-model="isOpen" title="背景照片管理">
    <!-- Upload area -->
    <div class="p-4 mb-4 bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-[10px] text-center cursor-pointer" @click="triggerFileUpload">
      <div class="text-[30px]">📷</div>
      <p class="text-[#333] font-bold">点击上传照片</p>
      <p class="text-[12px] text-[#9E9E9E]">建议使用游玩照片作为背景</p>
    </div>
    <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="handleFileUpload" />

    <!-- Photo grid -->
    <div v-if="configStore.systemConfig.backgroundPhotos.length > 0" class="grid grid-cols-3 gap-2 mb-4">
      <div
        v-for="(photo, index) in configStore.systemConfig.backgroundPhotos"
        :key="index"
        class="relative rounded-[8px] overflow-hidden border-2 cursor-pointer transition-colors"
        :class="index === configStore.systemConfig.currentPhotoIndex ? 'border-[#2196F3]' : 'border-[#E0E0E0]'"
        @click="selectPhoto(index)"
      >
        <img :src="photo" class="w-full h-[80px] object-cover" />
        <button
          class="absolute top-1 right-1 w-[24px] h-[24px] bg-[#F44336] text-white rounded-full text-[14px] flex items-center justify-center cursor-pointer border-none"
          @click.stop="deletePhoto(index)"
        >×</button>
      </div>
    </div>
    <div v-else class="text-center text-[#999] py-4 mb-4">暂无背景照片</div>

    <!-- Mode selector -->
    <div class="mb-4">
      <label class="block text-[#333] font-bold mb-2">显示模式</label>
      <select
        class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px]"
        :value="configStore.systemConfig.backgroundMode"
        @change="configStore.updateBackgroundMode(($event.target as HTMLSelectElement).value)"
      >
        <option value="carousel">轮播切换（每5秒）</option>
        <option value="fixed">固定显示</option>
      </select>
    </div>

    <!-- Style selector -->
    <div class="mb-4">
      <label class="block text-[#333] font-bold mb-2">背景风格</label>
      <select
        class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px]"
        :value="configStore.systemConfig.backgroundStyle"
        @change="configStore.updateBackgroundStyle(($event.target as HTMLSelectElement).value)"
      >
        <option value="cover">覆盖（填满屏幕）</option>
        <option value="contain">适配（完整显示）</option>
        <option value="tile">平铺（重复排列）</option>
        <option value="stretch">拉伸（强制填充）</option>
        <option value="center">居中（原尺寸居中）</option>
      </select>
    </div>
  </AppModal>
</template>