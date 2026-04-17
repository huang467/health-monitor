<template>
  <div class="w-full h-full flex flex-col items-center justify-center p-4">
    <div v-if="!initialized" class="text-center space-y-6">
      <div class="w-32 h-32 bg-blue-500 rounded-full mx-auto animate-pulse flex items-center justify-center shadow-xl shadow-blue-500/30">
        <span class="text-5xl">🤖</span>
      </div>
      <h2 class="text-3xl font-bold text-white">AI 数字伴侣已就绪</h2>
      <p class="text-slate-400">请点击下方按钮唤醒系统并授权摄像头</p>
      <button @click="startSystem" class="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold text-xl text-white shadow-lg transition-all transform hover:scale-105 active:scale-95">
        ⚡ 唤醒数字人
      </button>
      <p v-if="initError" class="text-red-500 mt-4 font-bold">{{ initError }}</p>
    </div>

    <div v-else class="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

      <div class="space-y-8 flex flex-col items-center">
        <div class="relative flex flex-col items-center justify-center mt-6">
          <div :class="['relative w-64 h-64 rounded-[3.5rem] transition-all duration-300 ease-in-out shadow-2xl flex items-center justify-center', currentStyle.color, currentStyle.container]">
            <div class="absolute top-6 left-6 w-20 h-10 bg-white opacity-20 rounded-full blur-md"></div>
            <div class="flex flex-col items-center w-full transform scale-110">

              <div class="flex gap-10 mb-8 relative z-10">
                <div class="flex flex-col items-center gap-2">
                  <div :class="['w-12 h-2 bg-black/40 rounded-full transition-all duration-300 transform', currentStyle.eyebrowL]"></div>
                  <div :class="['bg-white rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner', currentStyle.eye]">
                    <div :class="['w-3 h-3 bg-slate-800 rounded-full transition-transform duration-300', currentStyle.pupil]"></div>
                  </div>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <div :class="['w-12 h-2 bg-black/40 rounded-full transition-all duration-300 transform scale-x-[-1]', currentStyle.eyebrowR]"></div>
                  <div :class="['bg-white rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner', currentStyle.eye]">
                    <div :class="['w-3 h-3 bg-slate-800 rounded-full transition-transform duration-300', currentStyle.pupil]"></div>
                  </div>
                </div>
              </div>

              <div class="h-12 flex items-center justify-center relative">
                <div :class="['transition-all duration-300', baseMouthClass]"></div>
              </div>

            </div>
          </div>
        </div>

        <div :class="['w-full max-w-sm p-4 rounded-xl text-center min-h-[80px] flex items-center justify-center transition-all bg-slate-800/80 border', speech.isSpeaking.value ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-slate-600']">
          <p :class="['text-lg font-medium', speech.isSpeaking.value ? 'text-white' : 'text-slate-400']">
            {{ speech.subtitle.value || '正在默默陪伴您...' }}
          </p>
        </div>

        <div class="relative w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg mt-4 opacity-50 hover:opacity-100 transition-opacity">
          <video ref="videoRef" muted playsInline class="w-full h-full object-cover"></video>
          <div class="absolute top-1 left-1 bg-black/60 px-2 py-1 rounded text-xs text-white">
            微表情识别: <span class="text-emerald-400 font-bold">{{ emotionMap[emotion] || emotion }}</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col h-[550px] bg-slate-800/80 rounded-3xl border border-slate-700 p-6 shadow-xl">
        <h3 class="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-4 flex justify-between items-center">
          <span>💬 陪伴记录</span>
          <span class="text-sm font-normal px-2 py-1 bg-slate-700 rounded-lg text-emerald-400">{{ store.status }}</span>
        </h3>

        <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          <div v-for="m in store.messages" :key="m.id" :class="['p-3 rounded-2xl text-sm max-w-[85%]', m.type === 'me' ? 'bg-blue-600 text-white ml-auto rounded-br-sm' : 'bg-slate-700 text-slate-200 rounded-bl-sm']">
            {{ m.content }}
          </div>
          <div v-if="store.isThinking" class="text-blue-400 text-sm animate-pulse flex items-center gap-2">
            <span class="w-2 h-2 bg-blue-400 rounded-full"></span> 数字人思考中...
          </div>
        </div>

        <div class="flex gap-3">
          <input v-model="inputText" @keyup.enter="send" placeholder="发消息测试..." class="flex-1 bg-slate-900 text-white p-4 rounded-2xl outline-none border border-slate-600 focus:border-blue-500 transition-colors" />
          <button @click="send" class="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/30">发送</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import * as faceapi from 'face-api.js'
import { useAgentStore } from '@/store/agentStore'
import { useAgentSpeech } from '@/hooks/useAgentSpeech'

const store = useAgentStore()
const speech = useAgentSpeech()

const initialized = ref(false)
const initError = ref('')
const videoRef = ref(null)
const emotion = ref('neutral')
const inputText = ref('')
let detectInterval = null

// 字典与样式
const emotionMap = { neutral: "平静", happy: "开心", sad: "悲伤", angry: "生气", surprised: "惊讶", fearful: "害怕", disgusted: "厌恶" }

const styles = {
  neutral: { color: 'bg-blue-500', eye: 'h-8 w-8', pupil: 'translate-0', eyebrowL: 'rotate-0 -translate-y-2', eyebrowR: 'rotate-0 -translate-y-2', mouth: 'w-12 bg-white rounded', container: '' },
  happy: { color: 'bg-yellow-400', eye: 'h-8 w-8', pupil: 'translate-y-[-2px]', eyebrowL: '-translate-y-4 rotate-0', eyebrowR: '-translate-y-4 rotate-0', mouth: 'w-16 border-b-4 border-white rounded-full', container: 'animate-bounce' },
  sad: { color: 'bg-indigo-600', eye: 'h-8 w-8 opacity-80', pupil: 'translate-y-2', eyebrowL: 'rotate-12 translate-y-0', eyebrowR: '-rotate-12 translate-y-0', mouth: 'w-14 border-t-4 border-white rounded-full mt-4', container: '' },
  angry: { color: 'bg-red-600', eye: 'h-7 w-7', pupil: 'scale-75', eyebrowL: '-rotate-12 translate-y-3', eyebrowR: 'rotate-12 translate-y-3', mouth: 'w-10 bg-white rounded', container: 'animate-pulse' },
  surprised: { color: 'bg-pink-500', eye: 'h-10 w-10', pupil: 'scale-75', eyebrowL: '-translate-y-6', eyebrowR: '-translate-y-6', mouth: 'w-12 h-12 border-4 border-white bg-transparent rounded-full', container: '' }
}

const currentStyle = computed(() => styles[emotion.value] || styles.neutral)
const baseMouthClass = computed(() => {
  const isSpeaking = speech.isSpeaking.value
  const mouthAnimation = isSpeaking ? 'animate-talk' : 'h-1'
  if (['happy', 'surprised', 'sad'].includes(emotion.value)) {
    return isSpeaking ? 'animate-pulse' : currentStyle.value.mouth
  }
  return `${currentStyle.value.mouth} ${mouthAnimation}`
})

const handleCameraError = (err) => {
  let errorMsg = '摄像头未知错误'
  
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    errorMsg = '用户拒绝了摄像头权限，或系统未授权浏览器访问。'
  } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    errorMsg = '未检测到摄像头设备，请检查硬件连接。'
  } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    errorMsg = '摄像头正被其他程序占用，或发生硬件级故障。'
  } else {
    errorMsg = `调用失败: ${err.message || err.name}`
  }

  initError.value = errorMsg

  const errorLog = {
    module: 'DigitalHuman_Camera',
    time: new Date().toISOString(),
    errorName: err.name,
    errorMessage: err.message,
    userAgent: navigator.userAgent
  }
  
  console.error('【系统异常捕获】前端设备调用报错:', errorLog)
}

const startSystem = async () => {
  try {
    initError.value = ''
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ])

    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    
    initialized.value = true
    
    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = stream
      videoRef.value.play()
    }

    store.initConnection()
    detectInterval = setInterval(detectFace, 500)

  } catch (err) {
    handleCameraError(err)
  }
}

const detectFace = async () => {
  if (!videoRef.value || speech.isSpeaking.value) return
  try {
    const result = await faceapi.detectSingleFace(videoRef.value, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
    if (result) {
      const expressions = result.expressions
      const maxExp = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b)
      emotion.value = maxExp
      store.emotion = maxExp
    }
  } catch (e) {}
}

const send = () => {
  if (inputText.value.trim()) {
    store.sendMessage(inputText.value)
    inputText.value = ''
  }
}

onBeforeUnmount(() => {
  if (detectInterval) clearInterval(detectInterval)
  if (videoRef.value && videoRef.value.srcObject) {
    videoRef.value.srcObject.getTracks().forEach(track => track.stop())
  }
})
</script>

<style scoped>
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
.animate-bounce { animation: bounce 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; transform: scale(0.95); } }
.animate-pulse { animation: pulse 2s infinite; }
@keyframes talk { 0%, 100% { height: 2px; } 50% { height: 8px; } }
.animate-talk { animation: talk 0.3s infinite; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
</style>