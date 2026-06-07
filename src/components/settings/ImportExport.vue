<script setup lang="ts">
import { ref } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import {
  exportAllData,
  downloadExportFile,
  readImportFile,
  importAllData
} from '@/utils/importExport'
import { useKidsStore, useRewardsStore, useAddReasonsStore, useDeductReasonsStore, useConfigStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })

const kidsStore = useKidsStore()
const rewardsStore = useRewardsStore()
const addReasonsStore = useAddReasonsStore()
const deductReasonsStore = useDeductReasonsStore()
const configStore = useConfigStore()

const importError = ref('')
const importSuccess = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function handleExport() {
  const data = exportAllData()
  downloadExportFile(data)
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return

  importError.value = ''
  importSuccess.value = false

  try {
    const data = await readImportFile(input.files[0])
    const success = importAllData(data)

    if (success) {
      // Reload stores from localStorage
      kidsStore.$patch({ kids: data.kids_data, currentKidId: data.current_kid_id || 1 })
      rewardsStore.$patch({ rewards: data.rewards_pool })
      addReasonsStore.$patch({ addReasons: data.reasons_pool })
      deductReasonsStore.$patch({ deductReasons: data.deduct_reasons_pool })
      // Bug fix: configStore was previously not synced — system config (password,
      // exchange rate, background, riddles, etc.) stayed stale until reload.
      configStore.$patch({ systemConfig: data.system_config })

      importSuccess.value = true
    } else {
      importError.value = '数据格式不正确，导入失败'
    }
  } catch (e) {
    importError.value = (e as Error).message
  }

  // Reset file input
  input.value = ''
}
</script>

<template>
  <AppModal v-model="isOpen" title="数据导入导出">
    <!-- Export section -->
    <FormGroup label="导出数据">
      <button
        class="w-full p-3 bg-[#4CAF50] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] hover:bg-[#388E3C] transition-colors"
        @click="handleExport"
      >
        📥 导出所有数据
      </button>
      <p class="text-[#999] text-[12px] mt-2">将所有积分数据导出为JSON文件</p>
    </FormGroup>

    <!-- Import section -->
    <FormGroup label="导入数据">
      <input
        ref="fileInput"
        type="file"
        accept=".json"
        class="hidden"
        @change="handleImport"
      />
      <button
        class="w-full p-3 bg-[#2196F3] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] hover:bg-[#1976D2] transition-colors"
        @click="triggerImport"
      >
        📤 导入数据
      </button>
      <p class="text-[#999] text-[12px] mt-2">从JSON文件恢复数据（将覆盖当前数据）</p>
      <p v-if="importError" class="text-[#F44336] text-[14px] mt-2">{{ importError }}</p>
      <p v-if="importSuccess" class="text-[#4CAF50] text-[14px] mt-2">✅ 数据导入成功！</p>
    </FormGroup>
  </AppModal>
</template>