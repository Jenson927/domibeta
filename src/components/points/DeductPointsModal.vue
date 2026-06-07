<script setup lang="ts">
import { ref, watch } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import { useKidsStore, useDeductReasonsStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })

const kidsStore = useKidsStore()
const deductReasonsStore = useDeductReasonsStore()

const points = ref(10)
const selectedReasonId = ref(0)
const customReason = ref('')
const useCustomReason = ref(false)
const operationTime = ref('')
const showConfirm = ref(false)

watch(selectedReasonId, (newId) => {
  if (newId) {
    const reason = deductReasonsStore.allDeductReasons.find(r => r.id === newId)
    if (reason) points.value = reason.points
  }
})

function submit() {
  const selectedReason = useCustomReason.value
    ? null
    : deductReasonsStore.allDeductReasons.find(r => r.id === selectedReasonId.value)
  const reason = selectedReason?.name || (useCustomReason.value ? customReason.value : '未知原因')

  if (!reason) return
  if (points.value <= 0) return

  const kid = kidsStore.currentKid
  if (kid && kid.totalPoints - points.value < 0) {
    showConfirm.value = true
    return
  }

  doDeduct(reason, selectedReason?.icon || '➖')
}

function confirmDeduct() {
  const selectedReason = useCustomReason.value
    ? null
    : deductReasonsStore.allDeductReasons.find(r => r.id === selectedReasonId.value)
  const reason = selectedReason?.name || (useCustomReason.value ? customReason.value : '未知原因')

  doDeduct(reason, selectedReason?.icon || '➖')
  showConfirm.value = false
}

function doDeduct(reason: string, icon: string) {
  const time = operationTime.value
    ? new Date(operationTime.value).toISOString()
    : undefined

  kidsStore.deductPoints(points.value, reason, time, icon)
  isOpen.value = false
  resetForm()
}

function resetForm() {
  points.value = 10
  selectedReasonId.value = 0
  customReason.value = ''
  useCustomReason.value = false
  operationTime.value = ''
  showConfirm.value = false
}
</script>

<template>
  <AppModal v-model="isOpen" title="扣除积分">
    <p class="text-[#666] text-[14px] mb-[15px]">
      为 <span class="text-[#F44336] font-bold">{{ kidsStore.currentKid?.name }}</span> 扣除积分
    </p>

    <!-- Negative points warning confirm dialog -->
    <div v-if="showConfirm" class="bg-[#FFF3E0] rounded-[10px] p-4 mb-4">
      <p class="text-[#E65100] font-bold mb-2">⚠️ 警告：积分将变为负数！</p>
      <p class="text-[#666] text-[14px] mb-3">
        扣除 {{ points }} 分后，{{ kidsStore.currentKid?.name }} 的积分将变为
        <span class="text-[#F44336] font-bold">{{ kidsStore.currentKid?.totalPoints - points }} 分</span>
      </p>
      <div class="flex gap-2">
        <button
          class="p-2 bg-[#F44336] text-white border-none rounded-[8px] cursor-pointer font-bold hover:bg-[#D32F2F] transition-colors"
          @click="confirmDeduct"
        >
          确认扣除
        </button>
        <button
          class="p-2 bg-[#9E9E9E] text-white border-none rounded-[8px] cursor-pointer hover:bg-[#757575] transition-colors"
          @click="showConfirm = false"
        >
          取消
        </button>
      </div>
    </div>

    <template v-if="!showConfirm">
      <FormGroup label="扣除积分数量">
        <input
          v-model.number="points"
          type="number"
          min="1"
          max="1000"
          class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#F44336] transition-colors"
        />
      </FormGroup>

      <FormGroup label="扣分原因">
        <select
          v-model.number="selectedReasonId"
          class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#F44336] transition-colors"
          :disabled="useCustomReason"
        >
          <option value="0" disabled>请选择原因</option>
          <option v-for="reason in deductReasonsStore.allDeductReasons" :key="reason.id" :value="reason.id">
            {{ reason.icon }} {{ reason.name }} ({{ reason.category }})
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
          class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#F44336] transition-colors"
        />
      </FormGroup>

      <FormGroup label="操作时间（可选）" hint="不填写则使用当前时间">
        <input
          v-model="operationTime"
          type="datetime-local"
          class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#F44336] transition-colors"
        />
      </FormGroup>

      <button
        class="w-full p-3 bg-[#F44336] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] hover:bg-[#D32F2F] transition-colors"
        @click="submit"
      >
        确认扣除
      </button>
    </template>
  </AppModal>
</template>