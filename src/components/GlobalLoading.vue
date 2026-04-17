<!-- 全局加载组件 -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="globalLoading" class="global-loading">
        <div class="loading-content">
          <div class="loading-spinner">
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
            <div class="spinner-ring"></div>
          </div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../stores/uiStore';

const uiStore = useUIStore();
const globalLoading = computed(() => uiStore.globalLoading);
const loadingText = computed(() => uiStore.loadingText);
</script>

<style scoped lang="scss">
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;

  .spinner-ring {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 4px solid transparent;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    &:nth-child(2) {
      width: 70%;
      height: 70%;
      top: 15%;
      left: 15%;
      border-top-color: #10b981;
      animation-duration: 1.5s;
      animation-direction: reverse;
    }

    &:nth-child(3) {
      width: 40%;
      height: 40%;
      top: 30%;
      left: 30%;
      border-top-color: #f59e0b;
      animation-duration: 2s;
    }
  }
}

.loading-text {
  font-size: 16px;
  color: #475569;
  font-weight: 500;
  margin: 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
