<script setup lang="ts">
import { computed } from 'vue'
import { useKidsStore } from '@/stores'

const kidsStore = useKidsStore()
const kid = computed(() => kidsStore.currentKid)

const emit = defineEmits<{
  openHistory: []
}>()

// Combined activity items (most recent first, limited to 10)
const recentActivities = computed(() => {
  if (!kid.value) return []

  const items: { date: string; text: string; type: 'add' | 'deduct' | 'exchange' | 'draw' }[] = []

  // Points history
  kid.value.pointsHistory.forEach(item => {
    const isAdd = item.points > 0
    items.push({
      date: item.date,
      text: `${item.reason} ${isAdd ? '+' : ''}${item.points}分`,
      type: isAdd ? 'add' : 'deduct'
    })
  })

  // Draw history
  kid.value.drawHistory.forEach(item => {
    items.push({
      date: item.date,
      text: `兑奖：${item.reward} (-${item.pointsUsed}分)`,
      type: 'draw'
    })
  })

  // Exchange history
  kid.value.exchangeHistory.forEach(item => {
    items.push({
      date: item.date,
      text: `兑换：${item.note} (-${item.totalPoints}分)`,
      type: 'exchange'
    })
  })

  // Sort by date descending
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return items.slice(0, 10)
})

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}
</script>

<template>
  <div class="mt-4">
    <h3 class="text-[#333] font-bold mb-2 flex items-center justify-between clear-both">
      活动记录
      <button class="p-[8px_16px] text-[14px] bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer" @click="emit('openHistory')">
        查看历史记录
      </button>
    </h3>
    <div v-if="recentActivities.length === 0" class="text-center text-[#999] py-4">
      暂无活动记录
    </div>
    <div v-else>
      <div
        v-for="activity in recentActivities"
        :key="activity.date + activity.text"
        class="flex items-center justify-between p-2 mb-1 bg-white rounded-[8px] shadow-sm"
      >
        <span
          class="text-[14px]"
          :class="{
            'text-[#4CAF50]': activity.type === 'add',
            'text-[#F44336]': activity.type === 'deduct',
            'text-[#9C27B0]': activity.type === 'draw',
            'text-[#FF9800]': activity.type === 'exchange'
          }"
        >
          {{ activity.text }}
        </span>
        <span class="text-[12px] text-[#999]">{{ formatTime(activity.date) }}</span>
      </div>
    </div>
  </div>
</template>