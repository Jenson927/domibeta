<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import { useKidsStore } from '@/stores'

const props = defineProps<{
  kidId: number
}>()

const isOpen = defineModel<boolean>({ default: false })
const kidsStore = useKidsStore()

const fileInputRef = ref<HTMLInputElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)

const imageSrc = ref<string | null>(null)
const cropX = ref(0)
const cropY = ref(0)
const cropSize = ref(80)
const isDragging = ref(false)

const kid = computed(() => kidsStore.kids.find(k => k.id === props.kidId))

function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  const file = input.files[0]
  if (!file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = (ev) => {
    imageSrc.value = ev.target?.result as string
    // Initialize crop center
    cropX.value = 0
    cropY.value = 0
    cropSize.value = 80
    renderCropPreview()
  }
  reader.readAsDataURL(file)
}

// Imperative Canvas crop - stays imperative per plan constraint
function renderCropPreview() {
  if (!previewCanvasRef.value || !imageSrc.value) return

  const canvas = previewCanvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const img = new Image()
  img.onload = () => {
    // Draw full image scaled to canvas
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
    const drawWidth = img.width * scale
    const drawHeight = img.height * scale

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, drawWidth, drawHeight)

    // Draw crop circle overlay
    ctx.beginPath()
    ctx.arc(cropX.value + cropSize.value / 2, cropY.value + cropSize.value / 2, cropSize.value / 2, 0, Math.PI * 2)
    ctx.strokeStyle = '#4CAF50'
    ctx.lineWidth = 3
    ctx.stroke()

    // Darken outside circle
    ctx.globalCompositeOperation = 'destination-in'
    ctx.beginPath()
    ctx.arc(cropX.value + cropSize.value / 2, cropY.value + cropSize.value / 2, cropSize.value / 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }
  img.src = imageSrc.value
}

function saveAvatar() {
  if (!canvasRef.value || !imageSrc.value) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Create a hidden canvas for crop extraction
  const extractCanvas = document.createElement('canvas')
  extractCanvas.width = 200
  extractCanvas.height = 200
  const extractCtx = extractCanvas.getContext('2d')!

  const img = new Image()
  img.onload = () => {
    const scale = Math.min(previewCanvasRef.value!.width / img.width, previewCanvasRef.value!.height / img.height)

    // Extract cropped region
    extractCtx.beginPath()
    extractCtx.arc(100, 100, 100, 0, Math.PI * 2)
    extractCtx.clip()
    extractCtx.drawImage(
      img,
      cropX.value / scale,
      cropY.value / scale,
      cropSize.value / scale,
      cropSize.value / scale,
      0,
      0,
      200,
      200
    )

    const avatarData = extractCanvas.toDataURL('image/jpeg', 0.8)
    kidsStore.updateAvatar(props.kidId, avatarData)
    isOpen.value = false
    imageSrc.value = null
  }
  img.src = imageSrc.value
}

// Touch/mouse drag for crop circle position
function handleCanvasMouseDown(e: MouseEvent) {
  isDragging.value = true
  const canvas = previewCanvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  cropX.value = e.clientX - rect.left - cropSize.value / 2
  cropY.value = e.clientY - rect.top - cropSize.value / 2
  renderCropPreview()
}

function handleCanvasMouseMove(e: MouseEvent) {
  if (!isDragging.value) return
  const canvas = previewCanvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  cropX.value = e.clientX - rect.left - cropSize.value / 2
  cropY.value = e.clientY - rect.top - cropSize.value / 2
  renderCropPreview()
}

function handleCanvasMouseUp() {
  isDragging.value = false
}

function removeAvatar() {
  kidsStore.updateAvatar(props.kidId, '')
  isOpen.value = false
}
</script>

<template>
  <AppModal v-model="isOpen" title="修改头像">
    <div v-if="kid">
      <!-- Current avatar -->
      <div class="text-center mb-4">
        <div
          class="w-[60px] h-[60px] rounded-full mx-auto bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center text-[30px] border-[3px] border-[#E0E0E0] overflow-hidden"
        >
          <img v-if="kid.avatar" :src="kid.avatar" class="w-full h-full object-cover rounded-full" />
          <span v-else>👤</span>
        </div>
      </div>

      <!-- File input -->
      <FormGroup label="选择头像图片">
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="w-full text-[14px]"
          @change="handleFileSelect"
        />
      </FormGroup>

      <!-- Crop preview (imperative Canvas) -->
      <div v-if="imageSrc" class="text-center">
        <canvas
          ref="previewCanvasRef"
          width="200"
          height="200"
          class="border-2 border-[#E0E0E0] rounded-[10px] cursor-move inline-block"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @mouseleave="handleCanvasMouseUp"
        />
        <p class="text-[12px] text-[#999] mt-2">拖动圆形选择裁剪区域</p>
      </div>

      <!-- Hidden canvas for extraction -->
      <canvas ref="canvasRef" width="200" height="200" class="hidden" />

      <!-- Action buttons -->
      <div class="flex gap-2 mt-4">
        <button
          v-if="imageSrc"
          class="flex-1 p-2 bg-[#4CAF50] text-white border-none rounded-[8px] cursor-pointer font-bold"
          @click="saveAvatar"
        >
          保存头像
        </button>
        <button
          v-if="kid.avatar"
          class="flex-1 p-2 bg-[#F44336] text-white border-none rounded-[8px] cursor-pointer"
          @click="removeAvatar"
        >
          删除头像
        </button>
      </div>
    </div>
  </AppModal>
</template>