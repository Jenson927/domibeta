<script setup lang="ts">
import { ref, computed } from 'vue'
import { AppModal } from '@/components/common'
import { useKidsStore } from '@/stores'

const isOpen = defineModel<boolean>({ default: false })
const kidsStore = useKidsStore()

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
}

const allRecords = computed<HistoryRecord[]>(() => {
  const records: HistoryRecord[] = []

  kidsStore.kids.forEach(kid => {
    if (selectedKidId.value !== 'all' && kid.id !== parseInt(selectedKidId.value)) return

    kid.pointsHistory.forEach((item, idx) => {
      const category = item.points > 0 ? 'add' : 'deduct'
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category,
        index: idx,
        recordType: 'pointsHistory',
        date: item.date,
        points: item.points,
        reason: item.reason,
        edited: item.edited
      })
    })

    kid.drawHistory.forEach((item, idx) => {
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category: 'draw',
        index: idx,
        recordType: 'drawHistory',
        date: item.date,
        points: -(item.pointsUsed || 0),
        reason: item.reward || item.reason,
        edited: item.edited
      })
    })

    kid.exchangeHistory.forEach((item, idx) => {
      records.push({
        kidId: kid.id,
        kidName: kid.name,
        category: 'exchange',
        index: idx,
        recordType: 'exchangeHistory',
        date: item.date,
        points: -(item.totalPoints || 0),
        reason: item.note || item.reason,
        edited: item.edited
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

function getIcon(category: string): string {
  const icons: Record<string, string> = { add: '➕', deduct: '➖', exchange: '🎁', draw: '🎰' }
  return icons[category] || '📋'
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
        <div class="text-[20px]">{{ getIcon(record.category) }}</div>
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
        <button class="p-1 bg-[#F44336] text-white rounded-[8px] text-[13px] cursor-pointer" @click="deleteRecord(record)">删除</button>
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
</template>