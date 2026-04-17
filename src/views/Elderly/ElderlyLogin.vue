<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-6">
    <div class="bg-white p-10 rounded-3xl shadow-xl w-full max-w-lg space-y-8">

      <div class="text-center space-y-2">
        <h1 class="text-5xl font-extrabold text-blue-600 tracking-wider">颐境感知</h1>
        <p class="text-2xl text-slate-500 font-medium">长者陪伴大屏</p>
      </div>

      <div class="space-y-6 mt-8">
        <div>
          <label class="block text-3xl font-bold text-slate-700 mb-4">📱 手机号码</label>
          <input
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            class="w-full text-3xl p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-3xl font-bold text-slate-700 mb-4">🔑 登录密码</label>
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="w-full text-3xl p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 outline-none"
            @keyup.enter="handleLogin"
          />
        </div>

        <div v-if="errorMsg" class="p-4 bg-red-100 text-red-600 text-xl rounded-xl font-bold text-center">
          {{ errorMsg }}
        </div>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full text-4xl font-bold text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 py-6 rounded-2xl shadow-lg shadow-blue-600/30 mt-8"
        >
          {{ loading ? '正在进入...' : '进入大屏' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { elderlyLogin } from '@/api/auth'

const router = useRouter()
const phone = ref('13800001111')
const password = ref('123456')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!phone.value || !password.value) {
    errorMsg.value = '必须填写手机号和密码哦！'
    return
  }

  loading.value = true
  errorMsg.value = ''

  const res = await elderlyLogin({ phone: phone.value, password: password.value })

  loading.value = false

  if (res.code === 200) {
    localStorage.setItem('elderly_id', res.data.elderlyInfo.id)
    localStorage.setItem('elderly_token', res.data.token)

    router.push('/elderly/dashboard')
  } else {
    errorMsg.value = res.msg
  }
}
</script>
