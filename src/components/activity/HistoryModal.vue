<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppModal } from '@/components/common'
import { useKidsStore } from '@/stores'
import { useAddReasonsStore } from '@/stores/addReasonsStore'
import { useDeductReasonsStore } from '@/stores/deductReasonsStore'
import { useConfigStore } from '@/stores/configStore'
import { useRewardsStore } from '@/stores/rewardsStore'
import type { PointsHistoryItem, DrawHistoryItem, ExchangeHistoryItem } from '@/types/kid'

const isOpen = defineModel<boolean>({ default: false })
const kidsStore = useKidsStore()
const addReasonsStore = useAddReasonsStore()
const deductReasonsStore = useDeductReasonsStore()
const configStore = useConfigStore()
const rewardsStore = useRewardsStore()

const activeTab = ref('all')
const selectedKidId = ref<string>('all')
const currentPage = ref(1)
const pageSize = 20

const tabOptions = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'add', label: '加分', icon: '➕' },
  { key: 'deduct', label: '扣分', icon: '➖' },
  { key: 'exchange', label: '兑换', icon: '🎁' },
  { key: 'draw', label: '兑奖', icon: '🎰' }
]

interface HistoryRecord {
  kidId: number
  kidName: string
  category: string
  index: number
  recordType: string
  date: string
  points: number
  reason: string
  edited?: boolean
  icon: string
}

const allRecords = computed<HistoryRecord[]>(() => {
  const records: HistoryRecord[] = []

  kidsStore.kids.forEach(kid => {
    if (selectedKidId.value !== 'all' && kid.id !== parseInt(selectedKidId.value)) return

    kid.pointsHistory.forEach((item, idx) => {
      const category = item.points > 0 ? 'add' : 'deduct'
      let icon = item.icon
      if (!icon) {
        const reasonText = item.reason.replace(/^扣除：/, '')
        icon = item.points > 0
          ? (addReasonsStore.allAddReasons.find(r => reasonText === r.name || reasonText.includes(r.name))?.icon || '➕')
          : (deductReasonsStore.allDeductReasons.find(r => reasonText === r.name || reasonText.includes(r.name))?.icon || '➖')
      }
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category,
        index: idx,
        recordType: 'pointsHistory',
        date: item.date,
        points: item.points,
        reason: item.reason,
        edited: item.edited,
        icon
      })
    })

    kid.drawHistory.forEach((item, idx) => {
      let icon = item.icon
      if (!icon) {
        const rewardName = item.reward || item.reason
        icon = rewardsStore.allRewards.find(r => rewardName === r.name || rewardName.includes(r.name))?.icon || '🎰'
      }
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category: 'draw',
        index: idx,
        recordType: 'drawHistory',
        date: item.date,
        points: -(item.pointsUsed || 0),
        reason: item.reward || item.reason,
        edited: item.edited,
        icon
      })
    })

    kid.exchangeHistory.forEach((item, idx) => {
      let icon = item.icon
      if (!icon) {
        const noteName = item.note || item.reason
        icon = configStore.allExchangeOptions.find(o => noteName === o.name || noteName.includes(o.name))?.icon || '🎁'
      }
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category: 'exchange',
        index: idx,
        recordType: 'exchangeHistory',
        date: item.date,
        points: -(item.totalPoints || 0),
        reason: item.note || item.reason,
        edited: item.edited,
        icon
      })
    })
  })

  // Filter by tab
  const filtered = activeTab.value === 'all'
    ? records
    : records.filter(r => r.category === activeTab.value)

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return filtered
})

const totalPages = computed(() => Math.ceil(allRecords.value.length / pageSize) || 1)

const pageRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return allRecords.value.slice(start, start + pageSize)
})

const totalAddPoints = computed(() => {
  return allRecords.value
    .filter(r => r.category === 'add')
    .reduce((sum, r) => sum + Math.abs(r.points), 0)
})

const totalDeductPoints = computed(() => {
  return allRecords.value
    .filter(r => r.category === 'deduct')
    .reduce((sum, r) => sum + Math.abs(r.points), 0)
})

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  if (dateStr.includes('T')) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getPointsDisplay(record: HistoryRecord): string {
  const abs = Math.abs(record.points)
  if (record.category === 'add') return `+${abs}`
  return `-${abs}`
}

function switchTab(tab: string) {
  activeTab.value = tab
  currentPage.value = 1
}

function onKidFilterChange() {
  currentPage.value = 1
}

function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

function deleteRecord(record: HistoryRecord) {
  if (!confirm('确定删除这条记录？删除后积分将回滚。')) return
  const kid = kidsStore.kids.find(k => k.id === record.kidId)
  if (!kid) return

  // Rollback points
  kid.totalPoints += Math.abs(record.points)

  // Remove from history array
  kid[record.recordType as 'pointsHistory' | 'drawHistory' | 'exchangeHistory'].splice(record.index, 1)
  kidsStore.updateDrawChances()
}

// ---- Edit Record Feature ----

const showEditModal = ref(false)
const editKidId = ref(0)
const editRecordType = ref('pointsHistory')
const editRecordIndex = ref(0)
const editOriginalCategory = ref('')
const editOriginalRecord = ref<any>(null)

const editType = ref('add')
const editPoints = ref(0)
const editReason = ref('')
const editReward = ref('')
const editDate = ref('')
const editDateChanged = ref(false)

function toDateStr(isoStr: string): string {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

function openEdit(record: HistoryRecord) {
  const kid = kidsStore.kids.find(k => k.id === record.kidId)
  if (!kid) return

  editKidId.value = record.kidId
  editRecordType.value = record.recordType
  editRecordIndex.value = record.index
  editOriginalCategory.value = record.category

  // Capture the full original record
  const arr = kid[record.recordType as 'pointsHistory' | 'drawHistory' | 'exchangeHistory']
  const orig = arr[record.index]
  if (!orig) return
  editOriginalRecord.value = { ...orig }

  // Pre-fill form
  editType.value = record.category
  editPoints.value = Math.abs(record.points)
  editDate.value = toDateStr(orig.date)
  editDateChanged.value = false

  // Pre-fill reason/reward
  if (record.category === 'add') {
    editReason.value = record.reason || ''
    editReward.value = ''
  } else if (record.category === 'deduct') {
    // Strip "扣除：" prefix if present
    editReason.value = (record.reason || '').replace(/^扣除：/, '')
    editReward.value = ''
  } else if (record.category === 'exchange') {
    editReason.value = ''
    editReward.value = (orig as any).optionName || record.reason || ''
  } else if (record.category === 'draw') {
    editReason.value = ''
    editReward.value = (orig as any).reward || record.reason || ''
  }

  showEditModal.value = true
}

const addReasons = computed(() => addReasonsStore.allAddReasons)
const deductReasons = computed(() => deductReasonsStore.allDeductReasons)
const allExchangeOptions = computed(() => {
  const defs = configStore.allExchangeOptions
  return defs.map(o => ({ name: o.name, value: o.name }))
})
const allRewards = computed(() => rewardsStore.allRewards.map(r => ({ name: r.name, value: r.name })))

function saveEdit() {
  const kid = kidsStore.kids.find(k => k.id === editKidId.value)
  if (!kid || !editOriginalRecord.value) return

  const orig = editOriginalRecord.value
  const oldType = editOriginalCategory.value
  const newType = editType.value
  const newPoints = editPoints.value || 0

  // Calculate old points impact
  let oldImpact = orig.points || 0

  // Calculate new points impact
  let newImpact = newType === 'add' ? newPoints : -newPoints

  const pointsDiff = newImpact - oldImpact

  // Build the new record with proper type
  const base = {
    date: editDateChanged.value && editDate.value ? editDate.value : orig.date,
    edited: true as const,
    editCount: (orig.editCount || 0) + 1,
    lastEditTime: new Date().toISOString()
  }

  if (newType === 'add' || newType === 'deduct') {
    const reason = newType === 'add' ? (editReason.value || '') : '扣除：' + (editReason.value || '')
    const reasonName = editReason.value.replace(/^[^\s]+\s/, '')
    let icon = orig.icon
    if (newType === 'add') {
      icon = addReasonsStore.allAddReasons.find(r => reasonName === r.name || reasonName.includes(r.name) || editReason.value === r.name)?.icon || orig.icon || '➕'
    } else {
      icon = deductReasonsStore.allDeductReasons.find(r => reasonName === r.name || reasonName.includes(r.name) || editReason.value === r.name)?.icon || orig.icon || '➖'
    }
    const newRecord: PointsHistoryItem = {
      ...base,
      points: newImpact,
      reason,
      icon
    }
    applyRecord(newRecord)
  } else if (newType === 'exchange') {
    const exchangeIcon = configStore.allExchangeOptions.find(o => o.name === editReward.value || editReward.value.includes(o.name))?.icon || orig.icon || '🎁'
    const newRecord: ExchangeHistoryItem = {
      ...base,
      id: (orig as ExchangeHistoryItem).id || Date.now(),
      exchangeOptionId: (orig as ExchangeHistoryItem).exchangeOptionId || 0,
      optionName: editReward.value || '',
      points: newImpact,
      pointsConsumed: newPoints,
      quantity: 1,
      totalPoints: newPoints,
      date: base.date,
      category: newType,
      note: editReward.value || '',
      reason: editReward.value || '',
      icon: exchangeIcon
    }
    applyRecord(newRecord)
  } else if (newType === 'draw') {
    const drawIcon = rewardsStore.allRewards.find(r => r.name === editReward.value || editReward.value.includes(r.name))?.icon || orig.icon || '🎰'
    const newRecord: DrawHistoryItem = {
      ...base,
      reward: editReward.value || '',
      points: newImpact,
      pointsUsed: newPoints,
      reason: editReward.value || '',
      icon: drawIcon
    }
    applyRecord(newRecord)
  }
}

function applyRecord(newRecord: PointsHistoryItem | DrawHistoryItem | ExchangeHistoryItem) {
  const kid = kidsStore.kids.find(k => k.id === editKidId.value)
  if (!kid || !editOriginalRecord.value) return

  const orig = editOriginalRecord.value
  const newRecordType = editType.value === 'draw' ? 'drawHistory' :
                        editType.value === 'exchange' ? 'exchangeHistory' : 'pointsHistory'

  const oldArr = kid[editRecordType.value as 'pointsHistory' | 'drawHistory' | 'exchangeHistory']
  const oldIdx = editRecordIndex.value

  // Calculate points diff
  let oldImpact = orig.points || 0
  let newImpact = (newRecord as any).points || 0
  const pointsDiff = newImpact - oldImpact

  if (editRecordType.value !== newRecordType) {
    oldArr.splice(oldIdx, 1)
    kid[newRecordType].push(newRecord as any)
  } else {
    oldArr[oldIdx] = newRecord as any
  }

  if (pointsDiff !== 0) {
    kid.totalPoints += pointsDiff
  }

  kidsStore.updateDrawChances()
  showEditModal.value = false
}

function deleteFromEdit() {
  showEditModal.value = false
  // Find the record in the current list matching the editing record
  const kid = kidsStore.kids.find(k => k.id === editKidId.value)
  if (!kid) return
  const arr = kid[editRecordType.value as 'pointsHistory' | 'drawHistory' | 'exchangeHistory']
  const record = arr[editRecordIndex.value]
  if (!record) return

  if (!confirm('确定删除这条记录？删除后积分将回滚。')) return

  const pointsToRollback = -(record.points || 0)
  arr.splice(editRecordIndex.value, 1)
  kid.totalPoints += pointsToRollback
  kidsStore.updateDrawChances()
}

function clearHistory() {
  const kid = kidsStore.currentKid
  if (!kid) return
  if (confirm('确定要清空当前成员的所有历史记录吗？')) {
    kidsStore.clearHistory(kid.id)
  }
}
</script>

<template>
  <AppModal v-model="isOpen" title="历史记录管理">
    <!-- Filters -->
    <div class="mb-3">
      <!-- Kid selector -->
      <select
        class="w-full p-2 border rounded-[8px] mb-2 text-[14px]"
        :value="selectedKidId"
        @change="selectedKidId = ($event.target as HTMLSelectElement).value; onKidFilterChange()"
      >
        <option value="all">所有成员</option>
        <option v-for="kid in kidsStore.kids" :key="kid.id" :value="kid.id">{{ kid.name }}</option>
      </select>

      <!-- Category tabs -->
      <div class="flex gap-1 mb-2">
        <button
          v-for="tab in tabOptions"
          :key="tab.key"
          class="px-2 py-1 rounded-[8px] text-[13px] border-none cursor-pointer transition-colors"
          :class="activeTab === tab.key ? 'bg-[#2196F3] text-white' : 'bg-[#E3F2FD] text-[#333]'"
          @click="switchTab(tab.key)"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </div>

      <!-- Stats summary -->
      <div class="flex gap-4 text-[14px] text-[#666] mb-2">
        <span>共 {{ allRecords.length }} 条</span>
        <span class="text-[#4CAF50]">+{{ totalAddPoints }}</span>
        <span class="text-[#F44336]">-{{ totalDeductPoints }}</span>
      </div>
    </div>

    <!-- Records list -->
    <div v-if="pageRecords.length === 0" class="text-center text-[#999] py-6">暂无历史记录</div>
    <div v-else class="max-h-[50vh] overflow-y-auto">
      <div
        v-for="record in pageRecords"
        :key="`${record.kidId}-${record.recordType}-${record.index}-${record.date}`"
        class="flex items-center gap-2 p-3 mb-2 bg-gray-50 rounded-[10px]"
      >
        <div class="text-[20px]">{{ record.icon }}</div>
        <div class="flex-1">
          <div class="flex justify-between items-center">
            <span class="text-[14px] font-bold text-[#333]">
              {{ record.category === 'exchange' ? '兑换：' : record.category === 'draw' ? '兑奖：' : '' }}{{ record.reason }}
              <span v-if="record.edited" class="text-[#FF9800] text-[12px]">(已编辑)</span>
            </span>
            <span class="text-[14px] font-bold" :class="record.category === 'add' ? 'text-[#4CAF50]' : 'text-[#F44336]'">{{ getPointsDisplay(record) }}</span>
          </div>
          <div class="text-[12px] text-[#666]">
            👤 {{ record.kidName }} · {{ formatDate(record.date) }}
          </div>
        </div>
        <button class="p-1 px-2 bg-[#2196F3] text-white rounded-[8px] text-[13px] cursor-pointer mr-1" @click="openEdit(record)">编辑</button>
        <button class="p-1 px-2 bg-[#F44336] text-white rounded-[8px] text-[13px] cursor-pointer" @click="deleteRecord(record)">删除</button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="allRecords.length > 0" class="flex justify-between items-center mt-3 text-[14px] text-[#666]">
      <span>第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <div class="flex gap-2">
        <button class="p-1 px-3 bg-[#E3F2FD] rounded-[8px] cursor-pointer" :disabled="currentPage <= 1" @click="prevPage">上一页</button>
        <button class="p-1 px-3 bg-[#E3F2FD] rounded-[8px] cursor-pointer" :disabled="currentPage >= totalPages" @click="nextPage">下一页</button>
      </div>
    </div>

    <!-- Clear history button -->
    <button v-if="kidsStore.currentKid" class="w-full p-2 mt-3 bg-[#F44336] text-white border-none rounded-[8px] cursor-pointer" @click="clearHistory">🗑️ 清空当前成员历史</button>
  </AppModal>

  <!-- Edit Record Modal -->
  <AppModal v-model="showEditModal" title="✏️ 编辑记录" :z-index="1100">
    <div v-if="editOriginalRecord" class="py-2">
      <!-- Original record info -->
      <div class="bg-gray-50 rounded-[10px] p-3 mb-4 text-[13px]">
        <div class="flex justify-between mb-1">
          <span class="text-[#666]">原始类型：</span>
          <span class="font-bold">{{ editOriginalCategory === 'add' ? '➕ 加分' : editOriginalCategory === 'deduct' ? '➖ 扣分' : editOriginalCategory === 'exchange' ? '🎁 兑换' : '🎰 兑奖' }}</span>
        </div>
        <div class="flex justify-between mb-1">
          <span class="text-[#666]">原始积分：</span>
          <span class="font-bold" :class="editOriginalCategory === 'add' ? 'text-[#4CAF50]' : 'text-[#F44336]'">
            {{ editOriginalCategory === 'add' ? '+' : '-' }}{{ Math.abs(editOriginalRecord.points || 0) }}
          </span>
        </div>
        <div class="flex justify-between mb-1">
          <span class="text-[#666]">原始原因：</span>
          <span class="font-bold">{{ editOriginalRecord.reason || editOriginalRecord.reward || editOriginalRecord.optionName || '-' }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-[#666]">原始日期：</span>
          <span class="font-bold">{{ formatDate(editOriginalRecord.date) }}</span>
        </div>
      </div>

      <!-- Edit form -->
      <div class="mb-3">
        <label class="block text-[#333] mb-1 text-[14px] font-bold">记录类型</label>
        <select v-model="editType" class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px] text-[14px]">
          <option value="add">➕ 加分</option>
          <option value="deduct">➖ 扣分</option>
          <option value="exchange">🎁 积分兑换</option>
          <option value="draw">🎰 兑奖</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="block text-[#333] mb-1 text-[14px] font-bold">积分变化</label>
        <input v-model.number="editPoints" type="number" min="0" placeholder="输入积分值" class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px] text-[14px]" />
      </div>

      <!-- Reason selector (add/deduct) -->
      <div v-if="editType === 'add' || editType === 'deduct'" class="mb-3">
        <label class="block text-[#333] mb-1 text-[14px] font-bold">原因/说明</label>
        <select v-model="editReason" class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px] text-[14px]">
          <option value="">-- 请选择 --</option>
          <option
            v-for="r in editType === 'add' ? addReasons : deductReasons"
            :key="r.id"
            :value="r.icon + ' ' + r.name"
          >
            {{ r.icon }} {{ r.name }}
          </option>
        </select>
      </div>

      <!-- Reward selector (exchange/draw) -->
      <div v-if="editType === 'exchange' || editType === 'draw'" class="mb-3">
        <label class="block text-[#333] mb-1 text-[14px] font-bold">{{ editType === 'exchange' ? '兑换选项' : '奖励名称' }}</label>
        <select v-model="editReward" class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px] text-[14px]">
          <option value="">-- 请选择 --</option>
          <option
            v-for="opt in editType === 'exchange' ? allExchangeOptions : allRewards"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.name }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <label class="block text-[#333] mb-1 text-[14px] font-bold">日期</label>
        <input v-model="editDate" type="date" class="w-full p-2 border-2 border-[#E0E0E0] rounded-[8px] text-[14px]" @change="editDateChanged = true" />
        <p class="text-[#999] text-[12px] mt-1">不修改则保持原时间</p>
      </div>

      <!-- Points impact warning -->
      <div class="bg-[#FFF3E0] text-[#E65100] p-3 rounded-[10px] text-[13px] mb-4">
        ⚠️ 修改此记录将影响成员总积分
      </div>

      <!-- Action buttons -->
      <div class="flex gap-2">
        <button class="flex-1 p-2 bg-[#F44336] text-white rounded-[8px] cursor-pointer text-[14px]" @click="deleteFromEdit">🗑️ 删除记录</button>
        <button class="flex-1 p-2 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer text-[14px]" @click="saveEdit">💾 保存修改</button>
      </div>
    </div>
  </AppModal>
</template>
