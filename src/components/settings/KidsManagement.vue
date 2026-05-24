<script setup lang="ts">
import { ref } from 'vue'
import { AppModal } from '@/components/common'
import { useKidsStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const kidsStore = useKidsStore()

const emit = defineEmits<{
  openAvatarUpload: [kidId: number]
}>()

const newKidName = ref('')
const editingKidId = ref<number | null>(null)
const editingName = ref('')

function addKid() {
  if (!newKidName.value.trim()) return
  kidsStore.addKid(newKidName.value.trim())
  newKidName.value = ''
}

function startEditName(kidId: number, currentName: string) {
  editingKidId.value = kidId
  editingName.value = currentName
}

function saveEditName() {
  if (editingKidId.value && editingName.value.trim()) {
    kidsStore.editKidName(editingKidId.value, editingName.value.trim())
  }
  editingKidId.value = null
  editingName.value = ''
}

function deleteKid(kidId: number) {
  if (kidsStore.kids.length <= 2) {
    alert('至少保留2个成员')
    return
  }
  if (confirm('确定删除这个成员？所有数据将丢失')) {
    kidsStore.removeKid(kidId)
  }
}
</script>

<template>
  <AppModal v-model="isOpen" title="成员管理">
    <div v-for="kid in kidsStore.kids" :key="kid.id" class="flex items-center gap-3 p-3 mb-2 bg-gray-50 rounded-[10px]">
      <div v-if="kid.avatar" class="w-[50px] h-[50px] rounded-full overflow-hidden border-2 border-[#E0E0E0]">
        <img :src="kid.avatar" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] flex items-center justify-center text-[25px] border-2 border-[#E0E0E0]"> 👤</div>
      <div class="flex-1 ml-3">
        <div class="font-bold text-[#333]">{{ kid.name }}</div>
        <div class="text-[12px] text-[#666]">积分：{{ kid.totalPoints }} · 机会：{{ kid.drawChances }}次</div>
      </div>
      <div v-if="editingKidId === kid.id" class="flex gap-2">
        <input v-model="editingName" class="p-1 border rounded-[8px] text-[14px] w-[100px]" @keyup.enter="saveEditName" />
        <button class="p-1 bg-[#4CAF50] text-white rounded-[8px] text-[14px] cursor-pointer" @click="saveEditName">保存</button>
        <button class="p-1 bg-[#9E9E9E] text-white rounded-[8px] text-[14px] cursor-pointer" @click="editingKidId = null">取消</button>
      </div>
      <div v-else class="flex gap-2">
        <button class="p-1 bg-[#2196F3] text-white rounded-[8px] text-[14px] cursor-pointer" @click="emit('openAvatarUpload', kid.id)">📷</button>
        <button class="p-1 bg-[#FF9800] text-white rounded-[8px] text-[14px] cursor-pointer" @click="startEditName(kid.id, kid.name)">编辑</button>
        <button v-if="kidsStore.kids.length > 2" class="p-1 bg-[#F44336] text-white rounded-[8px] text-[14px] cursor-pointer" @click="deleteKid(kid.id)">删除</button>
      </div>
    </div>
    <div class="mt-4 p-3 bg-[#E8F5E9] rounded-[10px]">
      <input v-model="newKidName" placeholder="输入新成员名称" class="w-full p-2 border rounded-[8px] mb-2" @keyup.enter="addKid" />
      <button class="w-full p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="addKid">➕ 添加新成员</button>
    </div>
  </AppModal>
</template>