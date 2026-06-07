<script setup lang="ts">
import { ref, watch } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import { useKidsStore, useAddReasonsStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })

const kidsStore = useKidsStore()
const addReasonsStore = useAddReasonsStore()

const points = ref(100)
const selectedReasonId = ref(0)
const customReason = ref('')
const useCustomReason = ref(false)
const operationTime = ref('')

watch(selectedReasonId, (newId) => {
  if (newId) {
    const reason = addReasonsStore.allAddReasons.find(r => r.id === newId)
    if (reason) points.value = reason.points
  }
})

function submit() {
  const selectedReason = useCustomReason.value
    ? null
    : addReasonsStore.allAddReasons.find(r => r.id === selectedReasonId.value)
  const reason = selectedReason?.name || (useCustomReason.value ? customReason.value : '未知原因')
  const icon = selectedReason?.icon || '➕'

  if (!reason) return
  if (points.value <= 0) return

  const time = operationTime.value
    ? new Date(operationTime.value).toISOString()
    : undefined

  kidsStore.addPoints(points.value, reason, time, icon)
  isOpen.value = false
  resetForm()
}

function resetForm() {
  points.value = 100
  selectedReasonId.value = 0
  customReason.value = ''
  useCustomReason.value = false
  operationTime.value = ''
}
</script>

<template>
  <AppModal v-model="isOpen" title="添加积分">
    <p class="text-[#666] text-[14px] mb-[15px]">
      为 <span class="text-[#4CAF50] font-bold">{{ kidsStore.currentKid?.name }}</span> 添加积分
    </p>

    <FormGroup label="添加积分数量">
      <input
        v-model.number="points"
        type="number"
        min="1"
        max="1000"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#4CAF50] transition-colors"
      />
    </FormGroup>

    <FormGroup label="加分原因">
      <select
        v-model.number="selectedReasonId"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#4CAF50] transition-colors"
        :disabled="useCustomReason"
      >
        <option value="0" disabled>请选择原因</option>
        <option v-for="reason in addReasonsStore.allAddReasons" :key="reason.id" :value="reason.id">
          {{ reason.icon }} {{ reason.name }} (+{{ reason.points }}分)
        </option>
      </select>
      <div class="flex items-center gap-2 mt-2">
        <input v-model="useCustomReason" type="checkbox" class="cursor-pointer" />
        <span class="text-[14px] text-[#666]">自定义原因</span>
      </div>
    </FormGroup>

    <FormGroup v-if="useCustomReason" label="自定义原因">
      <input
        v-model="customReason"
        type="text"
        placeholder="请输入自定义原因"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#4CAF50] transition-colors"
      />
    </FormGroup>

    <FormGroup label="操作时间（可选）" hint="不填写则使用当前时间">
      <input
        v-model="operationTime"
        type="datetime-local"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#4CAF50] transition-colors"
      />
    </FormGroup>

    <button
      class="w-full p-3 bg-[#4CAF50] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] hover:bg-[#388E3C] transition-colors"
      @click="submit"
    >
      确认添加
    </button>
  </AppModal>
</template>