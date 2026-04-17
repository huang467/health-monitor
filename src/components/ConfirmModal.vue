<!-- 确认对话框组件 -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modals.confirm.show"
        class="confirm-modal-overlay"
        @click="handleCancel"
      >
        <Transition name="scale">
          <div
            v-if="modals.confirm.show"
            class="confirm-modal"
            @click.stop
          >
            <div
              class="confirm-icon"
              :class="`icon-${modals.confirm.type}`"
            >
              <IconSvg :name="getIconName(modals.confirm.type)" :size="32" />
            </div>
            <h3 class="confirm-title">{{ modals.confirm.title }}</h3>
            <p class="confirm-message">{{ modals.confirm.message }}</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="handleCancel">
                {{ modals.confirm.cancelText }}
              </button>
              <button class="btn-confirm" @click="handleConfirm">
                {{ modals.confirm.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { useUIStore } from '../stores/uiStore';

const uiStore = useUIStore();
const modals = computed(() => uiStore.modals);

const getIconName = (type) => {
  const iconMap = {
    success: 'check-circle',
    error: 'x-circle',
    warning: 'alert-triangle',
    info: 'info'
  };
  return iconMap[type] || 'help-circle';
};

const handleConfirm = () => {
  modals.value.confirm.onConfirm?.();
};

const handleCancel = () => {
  modals.value.confirm.onCancel?.();
};
</script>

<style scoped lang="scss">
.confirm-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9997;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-modal {
  background: white;
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  text-align: center;
}

.confirm-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;

  &.icon-info {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #3b82f6;
  }

  &.icon-success {
    background: linear-gradient(135deg, #d1fae5, #a7f3d0);
    color: #10b981;
  }

  &.icon-warning {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #f59e0b;
  }

  &.icon-error {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #ef4444;
  }
}

.confirm-title {
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 12px;
}

.confirm-message {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 28px;
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 12px;

  button {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-cancel {
    background: #f1f5f9;
    color: #475569;

    &:hover {
      background: #e2e8f0;
    }
  }

  .btn-confirm {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);

    &:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
    }
  }
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-leave-active {
  animation: scale-out 0.2s ease;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@media (max-width: 480px) {
  .confirm-modal {
    padding: 24px;
  }

  .confirm-icon {
    width: 60px;
    height: 60px;
  }

  .confirm-title {
    font-size: 20px;
  }

  .confirm-actions {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
}
</style>
