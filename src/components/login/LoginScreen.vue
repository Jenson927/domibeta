<script setup lang="ts">
import { ref } from 'vue'
import { useConfigStore } from '@/stores'

const configStore = useConfigStore()

const emit = defineEmits<{
  loginSuccess: []
}>()

const password = ref('')
const error = ref(false)

function handleLogin() {
  if (!password.value) {
    error.value = true
    return
  }

  if (configStore.verifyMainPassword(password.value)) {
    password.value = ''
    error.value = false
    emit('loginSuccess')
  } else {
    error.value = true
    password.value = ''
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]"
  >
    <div
      class="bg-white rounded-[20px] p-[50px_40px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] w-[90%] max-w-[400px] text-center"
    >
      <div class="text-[80px] mb-[30px]">🔐</div>
      <h1 class="text-[28px] text-[#333] mb-[15px] font-bold">积分管理系统</h1>
      <p class="text-[#666] text-[16px] mb-[30px]">请输入密码以访问系统</p>
      <div class="mb-[20px]">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          class="w-full p-[15px] text-[18px] border-2 rounded-[10px] text-center outline-none transition-colors"
          :class="error ? 'border-[#F44336]' : 'border-[#E0E0E0] focus:border-[#2196F3]'"
          @keyup.enter="handleLogin"
          ref="passwordInput"
        />
      </div>
      <p v-if="error" class="text-[#F44336] text-[14px] mb-[10px]">密码错误！</p>
      <button
        class="w-full p-[18px] text-[20px] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-[10px] cursor-pointer font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
        @click="handleLogin"
      >
        登录
      </button>
      <p v-if="!configStore.hasPassword" class="text-[#999] text-[14px] mt-[20px]">
        提示：首次使用无需密码
      </p>
    </div>
  </div>
</template>