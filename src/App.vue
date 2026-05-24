<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useConfigStore, useKidsStore } from '@/stores'
import AppHeader from '@/components/layout/AppHeader.vue'
import SettingsButton from '@/components/layout/SettingsButton.vue'
import LoginScreen from '@/components/login/LoginScreen.vue'
import MemberCarousel from '@/components/carousel/MemberCarousel.vue'
import DailyQuote from '@/components/daily/DailyQuote.vue'
import DailyRiddle from '@/components/daily/DailyRiddle.vue'
import ProgressBar from '@/components/stats/ProgressBar.vue'
import WeekStats from '@/components/stats/WeekStats.vue'
import ActivityList from '@/components/activity/ActivityList.vue'
import AddPointsModal from '@/components/points/AddPointsModal.vue'
import DeductPointsModal from '@/components/points/DeductPointsModal.vue'
import ExchangeModal from '@/components/exchange/ExchangeModal.vue'
import HistoryModal from '@/components/activity/HistoryModal.vue'
import SettingsModal from '@/components/settings/SettingsModal.vue'
import DrawModal from '@/components/draw/DrawModal.vue'
import AvatarUpload from '@/components/member/AvatarUpload.vue'

const configStore = useConfigStore()
const kidsStore = useKidsStore()

const isLoggedIn = ref(!configStore.hasPassword)

// Modal visibility state
const showAddPoints = ref(false)
const showDeductPoints = ref(false)
const showExchange = ref(false)
const showDraw = ref(false)
const showHistory = ref(false)
const showSettings = ref(false)
const showAvatarUpload = ref(false)
const avatarUploadKidId = ref(0)

function onLoginSuccess() {
  isLoggedIn.value = true
}

function openAvatarUpload(kidId: number) {
  avatarUploadKidId.value = kidId
  showAvatarUpload.value = true
}

// Dynamic background rendering
const backgroundStyle = computed(() => {
  const photos = configStore.systemConfig.backgroundPhotos
  const style = configStore.systemConfig.backgroundStyle
  const currentIndex = configStore.systemConfig.currentPhotoIndex

  if (!photos || photos.length === 0) {
    return { backgroundColor: '#f5f5f5' }
  }

  const photo = photos[currentIndex] || photos[0]
  const bgSize = style === 'cover' ? 'cover' : style === 'contain' ? 'contain' : style === 'tile' ? 'auto' : style === 'stretch' ? '100% 100%' : 'auto'
  const bgRepeat = style === 'tile' ? 'repeat' : 'no-repeat'
  const bgPosition = style === 'center' ? 'center center' : 'center center'

  return {
    backgroundImage: `url(${photo})`,
    backgroundSize: bgSize,
    backgroundRepeat: bgRepeat,
    backgroundPosition: bgPosition,
    backgroundColor: '#f5f5f5'
  }
})

// Background carousel timer
let carouselTimer: ReturnType<typeof setInterval> | null = null

function startCarousel() {
  if (carouselTimer) clearInterval(carouselTimer)
  const photos = configStore.systemConfig.backgroundPhotos
  if (photos.length <= 1) return

  carouselTimer = setInterval(() => {
    const nextIndex = (configStore.systemConfig.currentPhotoIndex + 1) % photos.length
    configStore.$patch({ systemConfig: { ...configStore.systemConfig, currentPhotoIndex: nextIndex } })
  }, 5000)
}

function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}

onMounted(() => {
  if (configStore.systemConfig.backgroundMode === 'carousel' && configStore.systemConfig.backgroundPhotos.length > 0) {
    startCarousel()
  }
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <!-- Login Screen -->
  <LoginScreen v-if="!isLoggedIn" @login-success="onLoginSuccess" />

  <!-- Main App Content -->
  <div v-if="isLoggedIn" id="app-container" class="min-h-screen font-sans pb-20" :style="backgroundStyle">
    <AppHeader />

    <main class="container mx-auto px-4 max-w-lg">
      <!-- Carousel -->
      <MemberCarousel
        @add-points="showAddPoints = true"
        @deduct-points="showDeductPoints = true"
        @exchange="showExchange = true"
        @draw="showDraw = true"
      />

      <!-- Current kid panel -->
      <div v-if="kidsStore.currentKid" class="mb-4">
        <h2 class="text-[20px] font-bold text-[#333] mb-3">
          {{ kidsStore.currentKid.name }} 的小天地 🌟
        </h2>

        <DailyQuote />
        <DailyRiddle />
        <ProgressBar />
        <WeekStats />
      </div>

      <!-- Activity list -->
      <ActivityList @open-history="showHistory = true" />
    </main>

    <SettingsButton @click="showSettings = true" />
  </div>

  <!-- Modals -->
  <AddPointsModal v-model="showAddPoints" />
  <DeductPointsModal v-model="showDeductPoints" />
  <ExchangeModal v-model="showExchange" />
  <DrawModal v-model="showDraw" />
  <HistoryModal v-model="showHistory" />
  <SettingsModal v-model="showSettings" @open-avatar-upload="openAvatarUpload" />
  <AvatarUpload v-model="showAvatarUpload" :kid-id="avatarUploadKidId" />
</template>