<script setup lang="ts">
import { ref } from 'vue'
import { AppModal } from '@/components/common'
import { useConfigStore, useKidsStore } from '@/stores'
import { STORAGE_KEYS } from '@/types/localStorage'
import AddReasonsManagement from '@/components/settings/AddReasonsManagement.vue'
import DeductReasonsManagement from '@/components/settings/DeductReasonsManagement.vue'
import ExchangeManagement from '@/components/settings/ExchangeManagement.vue'
import ImportExport from '@/components/settings/ImportExport.vue'
import RewardManagement from '@/components/settings/RewardManagement.vue'
import BackgroundManagement from '@/components/settings/BackgroundManagement.vue'
import KidsManagement from '@/components/settings/KidsManagement.vue'
import RiddlesManagement from '@/components/settings/RiddlesManagement.vue'
import QuotesManagement from '@/components/settings/QuotesManagement.vue'
import AboutModal from '@/components/settings/AboutModal.vue'

const isOpen = defineModel<boolean>({ default: false })
const configStore = useConfigStore()
const kidsStore = useKidsStore()

const emit = defineEmits<{
  openAvatarUpload: [kidId: number]
}>()

const activeTab = ref('general')
const showAddReasons = ref(false)
const showDeductReasons = ref(false)
const showExchange = ref(false)
const showImportExport = ref(false)
const showRewardManagement = ref(false)
const showBackgroundManagement = ref(false)
const showKidsManagement = ref(false)
const showRiddlesManagement = ref(false)
const showQuotesManagement = ref(false)
const showAbout = ref(false)

// Password settings
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const settingsPassword = ref('')
const settingsVerified = ref(false)

// Exchange rate
const exchangeRate = ref(configStore.exchangeRate)

const tabs = [
  { key: 'general', label: '基本' },
  { key: 'background', label: '背景' },
  { key: 'kids', label: '成员' },
  { key: 'reasons', label: '原因' },
  { key: 'exchange', label: '兑换' },
  { key: 'rewards', label: '奖励' },
  { key: 'riddles', label: '谜语' },
  { key: 'quotes', label: '语录' },
  { key: 'data', label: '数据' }
]

function verifySettingsPassword() {
  if (configStore.hasPassword) {
    if (configStore.verifyMainPassword(settingsPassword.value)) {
      settingsVerified.value = true
    } else {
      alert('密码错误')
    }
  } else {
    settingsVerified.value = true
  }
}

function setPassword() {
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = '两次密码不一致'
    return
  }
  configStore.setPassword(newPassword.value)
  newPassword.value = ''
  confirmPassword.value = ''
  passwordError.value = ''
}

function clearPassword() {
  configStore.clearPassword()
}

function updateRate() {
  if (exchangeRate.value > 0) {
    configStore.updateExchangeRate(exchangeRate.value)
    kidsStore.updateDrawChances()
  }
}

function clearAllData() {
  const input = prompt('此操作将清除所有历史记录和积分！\n请输入 "确认清除" 来继续：')
  if (input === '确认清除') {
    localStorage.removeItem(STORAGE_KEYS.KIDS_DATA)
    localStorage.removeItem(STORAGE_KEYS.REWARDS_POOL)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_KID_ID)
    location.reload()
  }
}
</script>

<template>
  <AppModal v-model="isOpen" title="系统设置" :z-index="900">
    <!-- Password gate -->
    <template v-if="configStore.hasPassword && !settingsVerified">
      <div class="text-center py-4">
        <p class="text-[#666] mb-4">请输入密码以访问设置</p>
        <input v-model="settingsPassword" type="password" placeholder="请输入密码" class="w-full p-3 border-2 border-[#E0E0E0] rounded-[10px] text-center mb-4" @keyup.enter="verifySettingsPassword" />
        <button class="w-full p-3 bg-[#2196F3] text-white border-none rounded-[10px] cursor-pointer font-bold" @click="verifySettingsPassword">确认</button>
      </div>
    </template>

    <!-- Settings content -->
    <template v-else>
      <!-- Tab navigation -->
      <div class="flex flex-wrap gap-1 mb-4 border-b border-[#E0E0E0] pb-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-2 py-1 rounded-[8px] text-[13px] border-none cursor-pointer transition-colors"
          :class="activeTab === tab.key ? 'bg-[#2196F3] text-white' : 'bg-transparent text-[#666] hover:bg-[#E3F2FD]'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- General -->
      <div v-if="activeTab === 'general'">
        <div class="mb-4">
          <label class="block text-[#333] mb-2 font-bold">兑换比例</label>
          <input v-model.number="exchangeRate" type="number" min="1" class="w-full p-3 border-2 border-[#E0E0E0] rounded-[10px]" />
          <button class="mt-2 p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="updateRate">保存比例</button>
        </div>
        <div class="mb-4">
          <label class="block text-[#333] mb-2 font-bold">密码设置</label>
          <template v-if="!configStore.hasPassword">
            <input v-model="newPassword" type="password" placeholder="新密码" class="w-full p-2 border rounded-[8px] mb-2" />
            <input v-model="confirmPassword" type="password" placeholder="确认密码" class="w-full p-2 border rounded-[8px] mb-2" />
            <p v-if="passwordError" class="text-[#F44336] text-[14px] mb-2">{{ passwordError }}</p>
            <button class="p-2 bg-[#2196F3] text-white rounded-[8px] cursor-pointer" @click="setPassword">设置密码</button>
          </template>
          <template v-else>
            <p class="text-[14px] text-[#666] mb-2">已设置密码</p>
            <button class="p-2 bg-[#F44336] text-white rounded-[8px] cursor-pointer" @click="clearPassword">清除密码</button>
          </template>
        </div>
        <button class="w-full p-2 mb-2 bg-[#607D8B] text-white rounded-[8px] cursor-pointer" @click="showAbout = true">ℹ️ 关于</button>
      </div>

      <!-- Background -->
      <div v-if="activeTab === 'background'">
        <button class="w-full p-2 mb-2 bg-[#2196F3] text-white rounded-[8px] cursor-pointer" @click="showBackgroundManagement = true">管理背景照片</button>
      </div>

      <!-- Kids -->
      <div v-if="activeTab === 'kids'">
        <button class="w-full p-2 mb-2 bg-[#FF9800] text-white rounded-[8px] cursor-pointer" @click="showKidsManagement = true">管理成员</button>
      </div>

      <!-- Reasons -->
      <div v-if="activeTab === 'reasons'">
        <button class="w-full p-2 mb-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showAddReasons = true">管理加分原因</button>
        <button class="w-full p-2 mb-2 bg-[#F44336] text-white rounded-[8px] cursor-pointer" @click="showDeductReasons = true">管理扣分原因</button>
      </div>

      <!-- Exchange -->
      <div v-if="activeTab === 'exchange'">
        <button class="w-full p-2 mb-2 bg-[#FF9800] text-white rounded-[8px] cursor-pointer" @click="showExchange = true">管理兑换选项</button>
      </div>

      <!-- Rewards -->
      <div v-if="activeTab === 'rewards'">
        <button class="w-full p-2 mb-2 bg-[#9C27B0] text-white rounded-[8px] cursor-pointer" @click="showRewardManagement = true">管理奖励池</button>
      </div>

      <!-- Riddles -->
      <div v-if="activeTab === 'riddles'">
        <p class="text-[14px] text-[#666] mb-3">内容池：760条内置 + {{ configStore.systemConfig.customRiddles.length }}条自定义</p>
        <button class="w-full p-2 mb-2 bg-[#9C27B0] text-white rounded-[8px] cursor-pointer" @click="showRiddlesManagement = true">🧠 管理脑筋急转弯</button>
      </div>

      <!-- Quotes -->
      <div v-if="activeTab === 'quotes'">
        <p class="text-[14px] text-[#666] mb-3">内容池：545条内置 + {{ configStore.systemConfig.customQuotes.length }}条自定义</p>
        <button class="w-full p-2 mb-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showQuotesManagement = true">💡 管理每日一句</button>
      </div>

      <!-- Data -->
      <div v-if="activeTab === 'data'">
        <button class="w-full p-2 mb-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showImportExport = true">数据导入导出</button>
        <button class="w-full p-2 mb-2 bg-[#F44336] text-white rounded-[8px] cursor-pointer" @click="clearAllData">⚠️ 清除所有数据</button>
      </div>
    </template>
  </AppModal>

  <!-- Sub-modals -->
  <AddReasonsManagement v-model="showAddReasons" />
  <DeductReasonsManagement v-model="showDeductReasons" />
  <ExchangeManagement v-model="showExchange" />
  <RewardManagement v-model="showRewardManagement" />
  <ImportExport v-model="showImportExport" />
  <BackgroundManagement v-model="showBackgroundManagement" />
  <KidsManagement v-model="showKidsManagement" @open-avatar-upload="(kidId) => emit('openAvatarUpload', kidId)" />
  <RiddlesManagement v-model="showRiddlesManagement" />
  <QuotesManagement v-model="showQuotesManagement" />
  <AboutModal v-model="showAbout" />
</template>