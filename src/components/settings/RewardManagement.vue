<script setup lang="ts">
import { ref } from 'vue'
import { AppModal, EmojiSelect } from '@/components/common'
import { useRewardsStore } from '@/stores'
import type { Reward } from '@/types/reward'

const isOpen = defineModel<boolean>({ default: false })
const rewardsStore = useRewardsStore()

const editingId = ref(0)
const newName = ref('')
const newIcon = ref('🎁')
const newWeight = ref(20)
const showAddForm = ref(false)

function startEdit(reward: Reward) {
  editingId.value = reward.id
  newName.value = reward.name
  newIcon.value = reward.icon
  newWeight.value = reward.weight
}

function saveEdit() {
  if (!newName.value) return
  rewardsStore.editReward(editingId.value, {
    name: newName.value,
    icon: newIcon.value,
    weight: newWeight.value
  })
  editingId.value = 0
}

function addReward() {
  if (!newName.value) return
  rewardsStore.addReward({
    name: newName.value,
    icon: newIcon.value,
    weight: newWeight.value
  })
  showAddForm.value = false
  newName.value = ''
  newIcon.value = '🎁'
  newWeight.value = 20
}

function removeReward(id: number) {
  rewardsStore.removeReward(id)
}
</script>

<template>
  <AppModal v-model="isOpen" title="奖励管理">
    <!-- List -->
    <div class="mb-4">
      <div
        v-for="reward in rewardsStore.allRewards"
        :key="reward.id"
        class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-[10px]"
      >
        <template v-if="editingId === reward.id">
          <div class="flex items-center gap-2 flex-1">
            <EmojiSelect v-model="newIcon" />
            <input v-model="newName" class="flex-1 p-1 border rounded-[6px]" />
            <input v-model.number="newWeight" type="number" min="1" max="100" class="w-[60px] p-1 border rounded-[6px]" />
          </div>
          <button class="p-1 bg-[#4CAF50] text-white rounded-[6px] ml-2" @click="saveEdit">保存</button>
        </template>
        <template v-else>
          <span>{{ reward.icon }} {{ reward.name }}</span>
          <span class="text-[12px] text-[#999]">权重: {{ reward.weight }}</span>
          <div class="flex gap-1">
            <button class="p-1 text-[#2196F3]" @click="startEdit(reward)">编辑</button>
            <button class="p-1 text-[#F44336]" @click="removeReward(reward.id)">删除</button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add form -->
    <button v-if="!showAddForm" class="w-full p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showAddForm = true">
      ➕ 添加新奖励
    </button>
    <div v-if="showAddForm" class="bg-[#FFF3E0] rounded-[10px] p-3">
      <div class="flex items-center gap-2 mb-2">
        <EmojiSelect v-model="newIcon" />
        <input v-model="newName" placeholder="奖励名称" class="flex-1 p-2 border rounded-[8px]" />
      </div>
      <div class="flex items-center gap-2 mb-2">
        <label class="text-[14px]">权重:</label>
        <input v-model.number="newWeight" type="range" min="1" max="100" class="flex-1" />
        <span class="text-[14px]">{{ newWeight }}</span>
      </div>
      <button class="w-full p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="addReward">添加</button>
    </div>
  </AppModal>
</template>