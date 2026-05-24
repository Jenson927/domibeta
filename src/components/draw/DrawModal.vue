<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { AppModal, FormGroup } from '@/components/common'
import { useKidsStore, useConfigStore, useRewardsStore } from '@/stores'
import DrawScroll from './DrawScroll.vue'
import DrawResult from './DrawResult.vue'
import DrawParticles from './DrawParticles.vue'
import type { Reward } from '@/types/reward'

const isOpen = defineModel<boolean>({ default: false })
const kidsStore = useKidsStore()
const configStore = useConfigStore()
const rewardsStore = useRewardsStore()

const kid = computed(() => kidsStore.currentKid)
const canDraw = computed(() => kid.value?.drawChances > 0)

const isDrawing = ref(false)
const drawResult = ref<Reward | null>(null)
const showResult = ref(false)
const operationTime = ref('')

function startDraw() {
  if (!kid.value || !canDraw.value) return

  const reward = rewardsStore.getRandomReward()
  isDrawing.value = true
  drawResult.value = reward
  showResult.value = false

  // The DrawScroll component handles animation via imperative DOM
  // It will call onDrawComplete when done
}

function onDrawComplete() {
  isDrawing.value = false
  showResult.value = true

  // Actually perform the draw in the store
  const time = operationTime.value ? new Date(operationTime.value).toISOString() : undefined
  kidsStore.drawReward(time)
}

function resetDraw() {
  drawResult.value = null
  showResult.value = false
  isDrawing.value = false
  operationTime.value = ''
}

onUnmounted(() => {
  isDrawing.value = false
})
</script>

<template>
  <AppModal v-model="isOpen" title="积分兑奖">
    <div v-if="kid">
      <p class="text-center text-[#666] text-[14px] mb-4">
        {{ kid.name }} 当前积分：
        <span class="font-bold" :class="kid.totalPoints < 0 ? 'text-[#F44336]' : 'text-[#4CAF50]'">
          {{ kid.totalPoints }}
        </span>
        | 兑奖机会：{{ kid.drawChances }}次
      </p>

      <!-- Draw scroll (imperative animation) -->
      <DrawScroll
        v-if="isDrawing && drawResult"
        :rewards="rewardsStore.allRewards"
        :target-reward="drawResult"
        @complete="onDrawComplete"
      />

      <!-- Draw result -->
      <DrawResult v-if="showResult && drawResult" :reward="drawResult" />

      <!-- Start button -->
      <template v-if="!isDrawing && !showResult">
        <button
          v-if="canDraw"
          class="w-full p-3 bg-[#9C27B0] text-white border-none rounded-[10px] cursor-pointer font-bold text-[18px] hover:bg-[#7B1FA2] transition-colors"
          @click="startDraw"
        >
          🎰 开始兑奖
        </button>
        <p v-else class="text-center text-[#999] py-4">
          {{ kid.totalPoints < 0 ? '积分不足（当前欠分）' : `还需 ${configStore.exchangeRate - (kid.totalPoints % configStore.exchangeRate)} 积分` }}
        </p>

        <FormGroup label="操作时间（可选）" hint="不填写则使用当前时间">
          <input
            v-model="operationTime"
            type="datetime-local"
            class="w-full p-3 border-2 border-[#E0E0E0] rounded-[10px]"
          />
        </FormGroup>
      </template>

      <!-- Reset button after result -->
      <button
        v-if="showResult"
        class="w-full p-3 bg-[#2196F3] text-white border-none rounded-[10px] cursor-pointer font-bold text-[16px] mt-4 hover:bg-[#1976D2] transition-colors"
        @click="resetDraw"
      >
        再来一次 🔄
      </button>
    </div>
  </AppModal>

  <!-- Particle celebration overlay -->
  <DrawParticles v-if="showResult" />
</template>