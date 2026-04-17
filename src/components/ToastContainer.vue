<!-- Toast 通知容器 -->
<template>
  <Teleport to="body">
    <div class="toast-container" :class="position">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[`toast-${toast.type}`, { 'toast-leaving': toast.leaving }]"
          @mouseenter="pauseToast(toast)"
          @mouseleave="resumeToast(toast)"
        >
          <div class="toast-icon">
            <IconSvg :name="getIconName(toast.type)" :size="24" />
          </div>
          <div class="toast-content">
            <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button
            v-if="toast.closable"
            class="toast-close"
            @click="removeToast(toast.id)"
          >
            <IconSvg name="x" :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../stores/uiStore';

const uiStore = useUIStore();
const toasts = computed(() => uiStore.activeToasts);
const position = computed(() => uiStore.activeToasts[0]?.position || 'top-right');

const getIconName = (type) => {
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  return iconMap[type] || 'info';
};

const removeToast = (id) => {
  uiStore.removeToast(id);
};

// eslint-disable-next-line no-unused-vars
const pauseToast = (_toast) => {
  // 可以在这里添加暂停逻辑
};

// eslint-disable-next-line no-unused-vars
const resumeToast = (_toast) => {
  // 可以在这里添加恢复逻辑
};
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
  padding: 24px;

  &.top-right {
    top: 0;
    right: 0;
  }

  &.top-left {
    top: 0;
    left: 0;
  }

  &.top-center {
    top: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  &.bottom-right {
    bottom: 0;
    right: 0;
  }

  &.bottom-left {
    bottom: 0;
    left: 0;
  }

  &.bottom-center {
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 420px;
  pointer-events: auto;
  border-left: 4px solid;

  &.toast-success {
    border-left-color: #10b981;
    .toast-icon {
      color: #10b981;
    }
  }

  &.toast-error {
    border-left-color: #ef4444;
    .toast-icon {
      color: #ef4444;
    }
  }

  &.toast-warning {
    border-left-color: #f59e0b;
    .toast-icon {
      color: #f59e0b;
    }
  }

  &.toast-info {
    border-left-color: #3b82f6;
    .toast-icon {
      color: #3b82f6;
    }
  }
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.toast-content {
  flex: 1;
  min-width: 0;

  .toast-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 4px;
  }

  .toast-message {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
    word-wrap: break-word;
  }
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f1f5f9;
    color: #475569;
  }
}

// Toast 动画
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .toast-container {
    left: 16px !important;
    right: 16px !important;
    padding: 16px;

    &.top-right,
    &.top-left,
    &.top-center {
      top: 0;
      transform: none;
    }

    &.bottom-right,
    &.bottom-left,
    &.bottom-center {
      bottom: 0;
      transform: none;
    }
  }

  .toast {
    min-width: auto;
    max-width: none;
    width: 100%;
  }
}
</style>
