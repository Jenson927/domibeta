<script setup lang="ts">
import { ref } from 'vue'
import { AppModal } from '@/components/common'
import { useConfigStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const configStore = useConfigStore()

const newQuote = ref('')
const showAddForm = ref(false)

function addQuote() {
  if (!newQuote.value.trim()) return
  configStore.addCustomQuote(newQuote.value.trim())
  newQuote.value = ''
  showAddForm.value = false
}

function deleteQuote(index: number) {
  if (confirm('确定删除这条每日一句？')) {
    configStore.removeCustomQuote(index)
  }
}
</script>

<template>
  <AppModal v-model="isOpen" title="每日一句管理">
    <p class="text-[14px] text-[#666] mb-4">内容池：545条内置 + {{ configStore.systemConfig.customQuotes.length }}条自定义</p>

    <button v-if="!showAddForm" class="w-full p-2 mb-4 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showAddForm = true">➕ 添加自定义每日一句</button>

    <div v-if="showAddForm" class="mb-4 p-3 bg-[#E8F5E9] rounded-[10px]">
      <input v-model="newQuote" placeholder="输入每日一句内容" class="w-full p-2 border rounded-[8px] mb-2" @keyup.enter="addQuote" />
      <div class="flex gap-2">
        <button class="p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer flex-1" @click="addQuote">添加</button>
        <button class="p-2 bg-[#9E9E9E] text-white rounded-[8px] cursor-pointer flex-1" @click="showAddForm = false">取消</button>
      </div>
    </div>

    <div v-if="configStore.systemConfig.customQuotes.length === 0" class="text-center text-[#999] py-4">暂无自定义每日一句</div>
    <div v-for="(quote, index) in configStore.systemConfig.customQuotes" :key="index" class="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-[10px]">
      <div class="flex-1 text-[14px] text-[#333]">{{ quote }}</div>
      <button class="p-1 bg-[#F44336] text-white rounded-[8px] text-[14px] cursor-pointer" @click="deleteQuote(index)">删除</button>
    </div>
  </AppModal>
</template>