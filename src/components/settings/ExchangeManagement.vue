<script setup lang="ts">
import { ref } from 'vue'
import { AppModal, EmojiSelect } from '@/components/common'
import { useConfigStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const configStore = useConfigStore()
const newName = ref('')
const newDescription = ref('')
const newIcon = ref('📱')
const newPointsRequired = ref(100)
const newUnit = ref('分钟')
const newCategory = ref('time')
const newEnabled = ref(true)
const showAddForm = ref(false)

function startAdd() {
  showAddForm.value = true
  newName.value = ''
  newDescription.value = ''
  newIcon.value = '📱'
  newPointsRequired.value = 100
  newUnit.value = '分钟'
  newCategory.value = 'time'
  newEnabled.value = true
}

function addOption() {
  if (!newName.value) return
  configStore.addExchangeOption({
    name: newName.value,
    description: newDescription.value,
    pointsRequired: newPointsRequired.value,
    unit: newUnit.value,
    category: newCategory.value,
    icon: newIcon.value,
    enabled: newEnabled.value
  })
  showAddForm.value = false
}

function removeOption(id: number) {
  configStore.removeExchangeOption(id)
}
</script>

<template>
  <AppModal v-model="isOpen" title="兑换选项管理">
    <!-- List -->
    <div class="mb-4">
      <div
        v-for="option in configStore.allExchangeOptions"
        :key="option.id"
        class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-[10px]"
      >
        <div>
          <span class="text-[20px] mr-1">{{ option.icon }}</span>
          <span class="font-bold">{{ option.name }}</span>
          <span class="text-[#666] text-[14px] ml-1">{{ option.description }}</span>
          <span class="text-[#FF9800] text-[14px] ml-1">{{ option.pointsRequired }}分/{{ option.unit }}</span>
        </div>
        <button class="p-1 text-[#F44336] border-none bg-transparent cursor-pointer" @click="removeOption(option.id)">删除</button>
      </div>
    </div>

    <!-- Add form -->
    <button v-if="!showAddForm" class="w-full p-2 bg-[#FF9800] text-white rounded-[8px] cursor-pointer" @click="startAdd">
      ➕ 添加兑换选项
    </button>
    <div v-else class="bg-[#FFF3E0] rounded-[10px] p-4">
      <div class="flex items-center gap-2 mb-2">
        <EmojiSelect v-model="newIcon" />
        <input v-model="newName" placeholder="选项名称" class="flex-1 p-2 border rounded-[8px]" />
      </div>
      <input v-model="newDescription" placeholder="描述" class="w-full p-2 border rounded-[8px] mb-2" />
      <div class="flex items-center gap-2 mb-2">
        <input v-model.number="newPointsRequired" type="number" placeholder="积分" class="flex-1 p-2 border rounded-[8px]" />
        <input v-model="newUnit" placeholder="单位" class="flex-1 p-2 border rounded-[8px]" />
        <select v-model="newCategory" class="flex-1 p-2 border rounded-[8px]">
          <option value="time">时间</option>
          <option value="item">物品</option>
          <option value="other">其他</option>
        </select>
      </div>
      <div class="flex items-center gap-2 mb-2">
        <input v-model="newEnabled" type="checkbox" class="cursor-pointer" />
        <span class="text-[14px]">启用</span>
      </div>
      <button class="w-full p-2 bg-[#FF9800] text-white rounded-[8px] cursor-pointer" @click="addOption">添加</button>
    </div>
  </AppModal>
</template>