<template>
  <div class="min-h-screen bg-slate-900 text-white flex flex-col overflow-hidden">

    <header class="flex justify-between items-center p-6 bg-slate-800/80 shadow-md">
      <div class="text-4xl font-bold tracking-widest text-emerald-400">
        {{ currentTime }}
      </div>

      <div class="flex items-center gap-8 bg-slate-700/50 px-6 py-3 rounded-2xl">
        <span class="text-2xl font-medium">
          ❤️ 心率: <span class="text-3xl font-bold ml-2">{{ health.heartRate || '--' }}</span>
        </span>
        <span class="text-2xl font-medium">
          🩸 血压: <span class="text-3xl font-bold ml-2">{{ health.bloodPressure || '--' }}</span>
        </span>
        <div class="flex items-center gap-2 ml-4">
          <div class="w-4 h-4 rounded-full bg-emerald-500 animate-pulse"></div>
          <span class="text-lg text-slate-300">设备在线</span>
        </div>
      </div>
    </header>

    <main class="flex-1 relative flex items-center justify-center p-6">
      <div class="w-full max-w-6xl h-full bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm overflow-hidden shadow-2xl">
        <DigitalHuman />
      </div>
    </main>

    <footer class="p-6 flex justify-between items-center bg-slate-800/80">
      <button @click="logout" class="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl text-2xl font-bold text-slate-300 transition-all">
        退出登录
      </button>

      <button @click="callEmergency" class="bg-red-600 hover:bg-red-500 text-white text-3xl font-bold py-5 px-24 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4">
        <span>🆘</span> 紧急呼叫家属
      </button>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getElderlyHealthMock } from '@/api/auth'
import DigitalHuman from '@/components/DigitalHuman.vue'

const router = useRouter()
const currentTime = ref('')
const health = ref({ heartRate: null, bloodPressure: null })
let clockTimer = null
let healthTimer = null

const updateTime = () => {
  const now = new Date()
  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')
  currentTime.value = `${hh}:${mm}`
}

const callEmergency = () => {
  alert('已向家属端发送紧急求助通知！(模拟)')
}

const logout = () => {
  localStorage.removeItem('elderly_token')
  localStorage.removeItem('elderly_id')
  router.replace('/elderly/login')
}

onMounted(() => {
  updateTime()
  clockTimer = setInterval(updateTime, 1000)

  getElderlyHealthMock().then(res => health.value = res.data)
  healthTimer = setInterval(async () => {
    const res = await getElderlyHealthMock()
    health.value.heartRate = res.data.heartRate + Math.floor(Math.random() * 5 - 2)
    health.value.bloodPressure = res.data.bloodPressure
  }, 5000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  if (healthTimer) clearInterval(healthTimer)
})
</script>
