warning: in the working copy of 'src/components/activity/ActivityList.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/daily/DailyRiddle.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/components/settings/RiddlesManagement.vue', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/stores/configStore.ts', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'src/types/config.ts', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/components/activity/ActivityList.vue b/src/components/activity/ActivityList.vue[m
[1mindex 2f78555..75b2145 100644[m
[1m--- a/src/components/activity/ActivityList.vue[m
[1m+++ b/src/components/activity/ActivityList.vue[m
[36m@@ -67,9 +67,9 @@[m [mfunction formatTime(dateStr: string): string {[m
 [m
 <template>[m
   <div class="mt-4">[m
[31m-    <h3 class="text-[#333] font-bold mb-2">[m
[32m+[m[32m    <h3 class="text-[#333] font-bold mb-2 flex items-center justify-between clear-both">[m
       活动记录[m
[31m-      <button class="float-right p-[8px_16px] text-[14px] bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer" @click="emit('openHistory')">[m
[32m+[m[32m      <button class="p-[8px_16px] text-[14px] bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer" @click="emit('openHistory')">[m
         查看历史记录[m
       </button>[m
     </h3>[m
[1mdiff --git a/src/components/daily/DailyRiddle.vue b/src/components/daily/DailyRiddle.vue[m
[1mindex ac64e95..1848779 100644[m
[1m--- a/src/components/daily/DailyRiddle.vue[m
[1m+++ b/src/components/daily/DailyRiddle.vue[m
[36m@@ -1,32 +1,31 @@[m
 <script setup lang="ts">[m
[31m-import { ref, computed } from 'vue'[m
[32m+[m[32mimport { ref, shallowRef, watch, onUnmounted } from 'vue'[m
 import { useKidsStore, useConfigStore } from '@/stores'[m
 [m
 const kidsStore = useKidsStore()[m
 const configStore = useConfigStore()[m
 [m
 const showAnswer = ref(false)[m
[32m+[m[32mconst countdown = ref<number | null>(null)[m
[32m+[m[32mconst currentRiddleIndex = ref<number | null>(null)[m
[32m+[m[32mconst kidRiddleHistory = shallowRef<Record<number, string[]>>({})[m
[32m+[m[32mlet countdownTimer: ReturnType<typeof setInterval> | null = null[m
 [m
[31m-// Per-kid riddle state (in-memory)[m
[31m-const kidCurrentRiddle: Record<number, number> = {}[m
[31m-const kidRiddleHistory: Record<number, string[]> = {}[m
[32m+[m[32mfunction getAllRiddles() {[m
[32m+[m[32m  return defaultRiddles.concat(configStore.systemConfig.customRiddles || [])[m
[32m+[m[32m}[m
 [m
[31m-const currentRiddle = computed(() => {[m
[32m+[m[32mfunction selectNewRiddle() {[m
   const kid = kidsStore.currentKid[m
[31m-  if (!kid) return null[m
[32m+[m[32m  if (!kid) return[m
 [m
[31m-  // Combine default + custom riddles[m
[31m-  const allRiddles = defaultRiddles.concat(configStore.systemConfig.customRiddles || [])[m
[31m-  if (allRiddles.length === 0) return null[m
[32m+[m[32m  const allRiddles = getAllRiddles()[m
[32m+[m[32m  if (allRiddles.length === 0) return[m
 [m
[31m-  // If kid already has an index, use it[m
[31m-  if (kidCurrentRiddle[kid.id] !== undefined) {[m
[31m-    return allRiddles[kidCurrentRiddle[kid.id]][m
[32m+[m[32m  if (!kidRiddleHistory.value[kid.id]) {[m
[32m+[m[32m    kidRiddleHistory.value = { ...kidRiddleHistory.value, [kid.id]: [] }[m
   }[m
[31m-[m
[31m-  // Smart random: avoid recent 10[m
[31m-  if (!kidRiddleHistory[kid.id]) kidRiddleHistory[kid.id] = [][m
[31m-  const history = kidRiddleHistory[kid.id][m
[32m+[m[32m  const history = kidRiddleHistory.value[kid.id][m
 [m
   let randomIndex: number[m
   let attempts = 0[m
[36m@@ -40,44 +39,97 @@[m [mconst currentRiddle = computed(() => {[m
     if (!history.includes(selectedQ)) break[m
   } while (true)[m
 [m
[31m-  kidCurrentRiddle[kid.id] = randomIndex[m
[31m-  // Track by question text (not index)[m
[31m-  history.push(allRiddles[randomIndex].q)[m
[31m-  if (history.length > 10) history.shift()[m
[32m+[m[32m  currentRiddleIndex.value = randomIndex[m
[32m+[m[41m  [m
[32m+[m[32m  const newHistory = [...history][m
[32m+[m[32m  newHistory.push(allRiddles[randomIndex].q)[m
[32m+[m[32m  if (newHistory.length > 10) newHistory.shift()[m
[32m+[m[32m  kidRiddleHistory.value = { ...kidRiddleHistory.value, [kid.id]: newHistory }[m
[32m+[m[32m}[m
 [m
[31m-  return allRiddles[randomIndex][m
[31m-})[m
[32m+[m[32mfunction getCurrentRiddle() {[m
[32m+[m[32m  const kid = kidsStore.currentKid[m
[32m+[m[32m  if (!kid || currentRiddleIndex.value === null) return null[m
[32m+[m[32m  const allRiddles = getAllRiddles()[m
[32m+[m[32m  if (allRiddles.length === 0) return null[m
[32m+[m[32m  return allRiddles[currentRiddleIndex.value][m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32mwatch([m
[32m+[m[32m  () => kidsStore.currentKid?.id,[m
[32m+[m[32m  (newKidId) => {[m
[32m+[m[32m    if (newKidId) {[m
[32m+[m[32m      selectNewRiddle()[m
[32m+[m[32m    }[m
[32m+[m[32m  },[m
[32m+[m[32m  { immediate: true }[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mfunction clearCountdown() {[m
[32m+[m[32m  if (countdownTimer) {[m
[32m+[m[32m    clearInterval(countdownTimer)[m
[32m+[m[32m    countdownTimer = null[m
[32m+[m[32m  }[m
[32m+[m[32m  countdown.value = null[m
[32m+[m[32m}[m
 [m
 function toggleAnswer() {[m
[31m-  showAnswer.value = !showAnswer.value[m
[32m+[m[32m  if (showAnswer.value) {[m
[32m+[m[32m    showAnswer.value = false[m
[32m+[m[32m    clearCountdown()[m
[32m+[m[32m    return[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  const delay = configStore.systemConfig.riddleAnswerDelay[m
[32m+[m[32m  const actualDelay = typeof delay === 'number' && delay >= 0 ? delay : 3[m
[32m+[m[41m  [m
[32m+[m[32m  if (actualDelay <= 0) {[m
[32m+[m[32m    showAnswer.value = true[m
[32m+[m[32m    return[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  countdown.value = actualDelay[m
[32m+[m[41m  [m
[32m+[m[32m  countdownTimer = setInterval(() => {[m
[32m+[m[32m    if (countdown.value !== null && countdown.value > 0) {[m
[32m+[m[32m      countdown.value--[m
[32m+[m[32m    } else {[m
[32m+[m[32m      clearCountdown()[m
[32m+[m[32m      showAnswer.value = true[m
[32m+[m[32m    }[m
[32m+[m[32m  }, 1000)[m
 }[m
 [m
 function nextRiddle() {[m
   showAnswer.value = false[m
[31m-  const kid = kidsStore.currentKid[m
[31m-  if (!kid) return[m
[31m-  // Clear current riddle index so computed re-selects[m
[31m-  delete kidCurrentRiddle[kid.id][m
[32m+[m[32m  clearCountdown()[m
[32m+[m[32m  selectNewRiddle()[m
 }[m
 [m
[31m-// Import default riddles - will be filled in Task 13 data extraction[m
[32m+[m[32monUnmounted(() => {[m
[32m+[m[32m  clearCountdown()[m
[32m+[m[32m})[m
[32m+[m
 import { defaultRiddles } from '@/data/defaultRiddles'[m
 </script>[m
 [m
 <template>[m
   <div class="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] rounded-[15px] p-4 mb-4 shadow-sm">[m
     <div class="text-[16px] font-bold text-[#1565C0] mb-2">🧠 脑筋急转弯</div>[m
[31m-    <div v-if="currentRiddle" class="text-[15px] text-[#333] leading-relaxed mb-2">[m
[31m-      Q: {{ currentRiddle.q }}[m
[32m+[m[32m    <div v-if="getCurrentRiddle()" class="text-[15px] text-[#333] leading-relaxed mb-2">[m
[32m+[m[32m      Q: {{ getCurrentRiddle().q }}[m
     </div>[m
     <button[m
       class="p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors mb-2"[m
       @click="toggleAnswer"[m
     >[m
[31m-      {{ showAnswer ? '隐藏答案 ▲' : '点击查看答案 ▼' }}[m
[32m+[m[32m      {{ showAnswer ? '隐藏答案 ▲' : '查看答案 ▼' }}[m
     </button>[m
[31m-    <div v-if="showAnswer && currentRiddle" class="text-[15px] text-[#4CAF50] font-bold mt-2">[m
[31m-      ✓ 答案：{{ currentRiddle.a }}[m
[32m+[m[32m    <div v-if="countdown !== null" class="text-[14px] text-[#FF9800] mt-2">[m
[32m+[m[32m      ⏳ 答案将在 {{ countdown }} 秒后揭晓...[m
[32m+[m[32m    </div>[m
[32m+[m[32m    <div v-if="showAnswer && getCurrentRiddle()" class="text-[15px] text-[#4CAF50] font-bold mt-2">[m
[32m+[m[32m      ✓ 答案：{{ getCurrentRiddle().a }}[m
     </div>[m
     <button[m
       class="mt-2 p-2 bg-[#2196F3] text-white border-none rounded-[8px] cursor-pointer text-[14px] hover:bg-[#1976D2] transition-colors"[m
[1mdiff --git a/src/components/settings/RiddlesManagement.vue b/src/components/settings/RiddlesManagement.vue[m
[1mindex daeb05b..e683cb8 100644[m
[1m--- a/src/components/settings/RiddlesManagement.vue[m
[1m+++ b/src/components/settings/RiddlesManagement.vue[m
[36m@@ -1,5 +1,5 @@[m
 <script setup lang="ts">[m
[31m-import { ref } from 'vue'[m
[32m+[m[32mimport { ref, watch } from 'vue'[m
 import { AppModal } from '@/components/common'[m
 import { useConfigStore } from '@/stores'[m
 [m
[36m@@ -9,6 +9,21 @@[m [mconst configStore = useConfigStore()[m
 const newQuestion = ref('')[m
 const newAnswer = ref('')[m
 const showAddForm = ref(false)[m
[32m+[m[32mconst answerDelay = ref(3)[m
[32m+[m[32mconst showSaveSuccess = ref(false)[m
[32m+[m
[32m+[m[32mwatch([m
[32m+[m[32m  () => configStore.systemConfig.riddleAnswerDelay,[m
[32m+[m[32m  (newDelay) => {[m
[32m+[m[32m    answerDelay.value = newDelay[m
[32m+[m[32m  }[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mwatch(isOpen, (newVal) => {[m
[32m+[m[32m  if (newVal) {[m
[32m+[m[32m    answerDelay.value = configStore.systemConfig.riddleAnswerDelay[m
[32m+[m[32m  }[m
[32m+[m[32m})[m
 [m
 function addRiddle() {[m
   if (!newQuestion.value.trim() || !newAnswer.value.trim()) return[m
[36m@@ -23,12 +38,50 @@[m [mfunction deleteRiddle(index: number) {[m
     configStore.removeCustomRiddle(index)[m
   }[m
 }[m
[32m+[m
[32m+[m[32mfunction saveAnswerDelay() {[m
[32m+[m[32m  const delay = Math.max(0, Math.min(60, answerDelay.value))[m
[32m+[m[32m  answerDelay.value = delay[m
[32m+[m[32m  configStore.updateRiddleAnswerDelay(delay)[m
[32m+[m[41m  [m
[32m+[m[32m  showSaveSuccess.value = true[m
[32m+[m[32m  setTimeout(() => {[m
[32m+[m[32m    showSaveSuccess.value = false[m
[32m+[m[32m  }, 2000)[m
[32m+[m[32m}[m
 </script>[m
 [m
 <template>[m
   <AppModal v-model="isOpen" title="脑筋急转弯管理">[m
     <p class="text-[14px] text-[#666] mb-4">内容池：760条内置 + {{ configStore.systemConfig.customRiddles.length }}条自定义</p>[m
 [m
[32m+[m[32m    <div class="mb-4 p-3 bg-[#FFF3E0] rounded-[10px]">[m
[32m+[m[32m      <div class="flex items-center gap-3 mb-2">[m
[32m+[m[32m        <span class="text-[14px] text-[#333]">答案显示延迟</span>[m
[32m+[m[32m        <input[m
[32m+[m[32m          v-model.number="answerDelay"[m
[32m+[m[32m          type="number"[m
[32m+[m[32m          min="0"[m
[32m+[m[32m          max="60"[m
[32m+[m[32m          class="w-[80px] p-1 border rounded-[6px] text-center text-[14px]"[m
[32m+[m[32m        />[m
[32m+[m[32m        <span class="text-[12px] text-[#FF9800]">秒</span>[m
[32m+[m[32m        <button[m
[32m+[m[32m          class="ml-auto p-1 bg-[#2196F3] text-white rounded-[6px] text-[12px] cursor-pointer"[m
[32m+[m[32m          @click="saveAnswerDelay"[m
[32m+[m[32m        >[m
[32m+[m[32m          保存[m
[32m+[m[32m        </button>[m
[32m+[m[32m        <span[m
[32m+[m[32m          v-if="showSaveSuccess"[m
[32m+[m[32m          class="text-[12px] text-[#4CAF50] ml-1"[m
[32m+[m[32m        >[m
[32m+[m[32m          ✓ 已保存[m
[32m+[m[32m        </span>[m
[32m+[m[32m      </div>[m
[32m+[m[32m      <p class="text-[12px] text-[#666]">设置点击"查看答案"后延迟多久显示答案，默认3秒</p>[m
[32m+[m[32m    </div>[m
[32m+[m
     <button v-if="!showAddForm" class="w-full p-2 mb-4 bg-[#4CAF50] text-white rounded-[8px] cursor-pointer" @click="showAddForm = true">➕ 添加自定义脑筋急转弯</button>[m
 [m
     <div v-if="showAddForm" class="mb-4 p-3 bg-[#E8F5E9] rounded-[10px]">[m
[1mdiff --git a/src/stores/configStore.ts b/src/stores/configStore.ts[m
[1mindex 532b5f8..f6aa557 100644[m
[1m--- a/src/stores/configStore.ts[m
[1m+++ b/src/stores/configStore.ts[m
[36m@@ -18,6 +18,7 @@[m [mexport const useConfigStore = defineStore('config', {[m
           customRiddles: [],[m
           exchangeOptions: [],[m
           customQuotes: [],[m
[32m+[m[32m          riddleAnswerDelay: 3,[m
           ...stored[m
         }[m
       : {[m
[36m@@ -29,7 +30,8 @@[m [mexport const useConfigStore = defineStore('config', {[m
           password: '',[m
           customRiddles: [],[m
           exchangeOptions: [],[m
[31m-          customQuotes: [][m
[32m+[m[32m          customQuotes: [],[m
[32m+[m[32m          riddleAnswerDelay: 3[m
         }[m
 [m
     // Ensure exchangeOptions are initialized[m
[36m@@ -133,6 +135,11 @@[m [mexport const useConfigStore = defineStore('config', {[m
     removeCustomQuote(index: number) {[m
       this.systemConfig.customQuotes.splice(index, 1)[m
       saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)[m
[32m+[m[32m    },[m
[32m+[m
[32m+[m[32m    updateRiddleAnswerDelay(delay: number) {[m
[32m+[m[32m      this.systemConfig.riddleAnswerDelay = delay[m
[32m+[m[32m      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, this.systemConfig)[m
     }[m
   }[m
 })[m
\ No newline at end of file[m
[1mdiff --git a/src/types/config.ts b/src/types/config.ts[m
[1mindex f4f5f9c..e7253fa 100644[m
[1m--- a/src/types/config.ts[m
[1m+++ b/src/types/config.ts[m
[36m@@ -17,6 +17,7 @@[m [mexport interface SystemConfig {[m
   customRiddles: Riddle[][m
   exchangeOptions: ExchangeOption[][m
   customQuotes: string[][m
[32m+[m[32m  riddleAnswerDelay: number // Delay in seconds before showing answer[m
 }[m
 [m
 // Re-export ExchangeOption for convenience[m
