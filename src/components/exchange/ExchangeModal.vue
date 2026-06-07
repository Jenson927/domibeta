<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import { useKidsStore, useConfigStore } from '@/stores'
import type { ExchangeOption } from '@/types/exchange'

const isOpen = defineModel<boolean>({ default: false })

const kidsStore = useKidsStore()
const configStore = useConfigStore()

const selectedOptionId = ref(0)
const quantity = ref(1)
const operationTime = ref('')
const exchangeResult = ref<string | null>(null)

const exchangeOptions = computed(() => configStore.allExchangeOptions)

const currentKid = computed(() => kidsStore.currentKid)

function selectOption(option: ExchangeOption) {
  selectedOptionId.value = option.id
  quantity.value = 1
  exchangeResult.value = null
}

function doExchange() {
  if (!selectedOptionId.value) return

  const time = operationTime.value
    ? new Date(operationTime.value).toISOString()
    : undefined

  const result = kidsStore.exchangePoints(selectedOptionId.value, quantity.value, time)
  if (result) {
    isOpen.value = false
    resetForm()
  } else {
    exchangeResult.value = 'fail'
  }
}

function resetForm() {
  selectedOptionId.value = 0
  quantity.value = 1
  operationTime.value = ''
  exchangeResult.value = null
}
</script>

<template>
  <AppModal v-model="isOpen" title="积分兑换">
    <!-- Current points display -->
    <div class="text-center mb-4">
      <p class="text-[#666] text-[14px]">
        {{ currentKid?.name }} 当前积分：
        <span class="font-bold text-[18px]" :class="currentKid?.totalPoints < 0 ? 'text-[#F44336]' : 'text-[#4CAF50]'">
          {{ currentKid?.totalPoints }}
        </span>
      </p>
    </div>

    <!-- Exchange options -->
    <FormGroup label="兑换选项">
      <div class="grid gap-2">
        <div
          v-for="option in exchangeOptions"
          :key="option.id"
          class="p-3 rounded-[10px] cursor-pointer transition-all border-2"
          :class="selectedOptionId === option.id ? 'border-[#FF9800] bg-[#FFF3E0]' : 'border-[#E0E0E0] bg-white hover:border-[#FF9800]'"
          @click="selectOption(option)"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[20px] mr-2">{{ option.icon }}</span>
              <span class="font-bold">{{ option.name }}</span>
              <span class="text-[#666] text-[14px] ml-1">{{ option.description }}</span>
            </div>
            <div class="text-[#FF9800] font-bold">{{ option.pointsRequired }}分/{{ option.unit }}</div>
          </div>
        </div>
      </div>
    </FormGroup>

    <!-- Quantity -->
    <FormGroup v-if="selectedOptionId" label="数量">
      <input
        v-model.number="quantity"
        type="number"
        min="1"
        max="100"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#FF9800] transition-colors"
      />
    </FormGroup>

    <!-- Operation time -->
    <FormGroup label="操作时间（可选）" hint="不填写则使用当前时间">
      <input
        v-model="operationTime"
        type="datetime-local"
        class="w-full p-3 text-[16px] border-2 border-[#E0E0E0] rounded-[10px] outline-none focus:border-[#FF9800] transition-colors"
      />
    </FormGroup>

    <!-- Result -->
    <div v-if="exchangeResult === 'fail'" class="p-3 rounded-[10px] mb-4 text-center font-bold bg-[#FFEBEE] text-[#F44336]">
      兑换失败：积分不足
    </div>

    <!-- Submit -->
    <button
      v-if="selectedOptionId"
      class="w-full p-3 bg-[#FF9800] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] hover:bg-[#F57C00] transition-colors"
      @click="doExchange"
    >
      确认兑换
    </button>
  </AppModal>
</template>