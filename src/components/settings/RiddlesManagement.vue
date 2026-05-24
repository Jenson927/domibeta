<script setup lang="ts">
import { ref } from 'vue'
import { AppModal } from '@/components/common'
import { useConfigStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const configStore = useConfigStore()

const newQuestion = ref('')
const newAnswer = ref('')
const showAddForm = ref(false)

function addRiddle() {
  if (!newQuestion.value.trim() || !newAnswer.value.trim()) return
  configStore.addCustomRiddle({ q: newQuestion.value.trim(), a: newAnswer.value.trim() })
  newQuestion.value = ''
  newAnswer.value = ''
  showAddForm.value = false
}

function deleteRiddle(index: number) {
  if (confirm('确定删除这个脑筋急转弯？')) {
    configStore.removeCustomRiddle(index)
  }
}
</script>

<template>
  <AppModal v-model="isOpen" title="脑筋急转弯管理">
    <p class="text-[14px] text-[#666] mb-4">内容池：760条内置 + {{ configStore.systemConfig.customRiddles.length }}条自定义</p>

    <button v-if="!showAddForm" class="w-full p-2 mb-4 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showAddForm = true">➕ 添加自定义脑筋急转弯</button>

    <div v-if="showAddForm" class="mb-4 p-3 bg-[#E8F5E9] rounded-[10px]">
      <input v-model="newQuestion" placeholder="输入问题" class="w-full p-2 border rounded-[8px] mb-2" />
      <input v-model="newAnswer" placeholder="输入答案" class="w-full p-2 border rounded-[8px] mb-2" />
      <div class="flex gap-2">
        <button class="p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer flex-1" @click="addRiddle">添加</button>
        <button class="p-2 bg-[#9E9E9E] text-white rounded-[8px] cursor-pointer flex-1" @click="showAddForm = false">取消</button>
      </div>
    </div>

    <div v-if="configStore.systemConfig.customRiddles.length === 0" class="text-center text-[#999] py-4">暂无自定义脑筋急转弯</div>
    <div v-for="(riddle, index) in configStore.systemConfig.customRiddles" :key="index" class="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-[10px]">
      <div class="flex-1">
        <div class="font-bold text-[#333] text-[14px]">Q: {{ riddle.q }}</div>
        <div class="text-[12px] text-[#666]">A: {{ riddle.a }}</div>
      </div>
      <button class="p-1 bg-[#F44336] text-white rounded-[8px] text-[14px] cursor-pointer" @click="deleteRiddle(index)">删除</button>
    </div>
  </AppModal>
</template>