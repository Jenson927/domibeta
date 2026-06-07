<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppModal, EmojiSelect } from '@/components/common'
import { useAddReasonsStore } from '@/stores'
import type { AddReason } from '@/types/reason'

const isOpen = defineModel<boolean>({ default: false })
const addReasonsStore = useAddReasonsStore()

const editingId = ref(0)
const newName = ref('')
const newIcon = ref('📝')
const newCategory = ref('学习')
const newPoints = ref(100)
const showAddForm = ref(false)

const ADD_CATEGORIES = ['学习', '生活', '品德', '运动', '其他']

const categoryOptions = computed(() => {
  const existingCats = addReasonsStore.categories
  const allCats = new Set([...existingCats, ...ADD_CATEGORIES])
  return Array.from(allCats)
})

function startAdd() {
  showAddForm.value = true
  newName.value = ''
  newIcon.value = '📝'
  newCategory.value = '学习'
  newPoints.value = 100
}

function addReason() {
  if (!newName.value) return
  addReasonsStore.addReason({
    name: newName.value,
    icon: newIcon.value,
    category: newCategory.value,
    points: newPoints.value
  })
  showAddForm.value = false
}

function startEdit(reason: AddReason) {
  editingId.value = reason.id
  newName.value = reason.name
  newIcon.value = reason.icon
  newCategory.value = reason.category
  newPoints.value = reason.points
}

function saveEdit() {
  if (!newName.value) return
  addReasonsStore.editReason(editingId.value, {
    name: newName.value,
    icon: newIcon.value,
    category: newCategory.value,
    points: newPoints.value
  })
  editingId.value = 0
}

function removeReason(id: number) {
  addReasonsStore.removeReason(id)
}
</script>

<template>
  <AppModal v-model="isOpen" title="加分原因管理">
    <!-- List -->
    <div class="mb-4">
      <div
        v-for="reason in addReasonsStore.allAddReasons"
        :key="reason.id"
        class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-[10px]"
      >
        <template v-if="editingId === reason.id">
          <div class="flex items-center gap-2 flex-1 flex-wrap">
            <EmojiSelect v-model="newIcon" />
            <input v-model="newName" class="flex-1 min-w-[80px] p-2 border rounded-[8px]" />
            <input v-model.number="newPoints" type="number" min="1" class="w-[70px] p-2 border rounded-[8px] text-center" />
            <select v-model="newCategory" class="p-2 border rounded-[8px]">
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <button class="p-2 bg-[#4CAF50] text-white rounded-[8px] ml-2" @click="saveEdit">保存</button>
        </template>
        <template v-else>
          <span>{{ reason.icon }} {{ reason.name }} <span class="text-[#4CAF50] text-[12px] font-bold">+{{ reason.points }}分</span> <span class="text-[#999] text-[12px]">({{ reason.category }})</span></span>
          <div class="flex gap-1">
            <button class="p-1 text-[#2196F3] border-none bg-transparent cursor-pointer" @click="startEdit(reason)">编辑</button>
            <button class="p-1 text-[#F44336] border-none bg-transparent cursor-pointer" @click="removeReason(reason.id)">删除</button>
          </div>
        </template>
      </div>
    </div>

    <!-- Add form -->
    <button v-if="!showAddForm" class="w-full p-2 bg-[#2196F3] text-white rounded-[8px] cursor-pointer" @click="startAdd">
      ➕ 添加新原因
    </button>
    <div v-else class="bg-[#E3F2FD] rounded-[10px] p-4">
      <div class="flex items-center gap-2 mb-2">
        <EmojiSelect v-model="newIcon" />
        <input v-model="newName" placeholder="原因名称" class="flex-1 p-2 border rounded-[8px]" />
      </div>
      <div class="flex items-center gap-2">
        <input v-model.number="newPoints" type="number" min="1" placeholder="积分" class="w-[80px] p-2 border rounded-[8px] text-center" />
        <select v-model="newCategory" class="flex-1 p-2 border rounded-[8px]">
          <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button class="p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="addReason">添加</button>
      </div>
    </div>
  </AppModal>
</template>
