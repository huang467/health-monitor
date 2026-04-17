<template>
  <div class="health-card" :class="[status, { 'hover-lift': hoverable }]" @click="$emit('click')">
    <div class="card-header">
      <div class="card-title-wrapper">
        <div class="card-icon" :class="`icon-${status}`">
          <IconSvg :name="icon || 'activity'" :size="22" />
        </div>
        <h4 class="card-title">{{ title }}</h4>
      </div>
      <div class="card-trend" v-if="trend">
        <IconSvg
          :name="trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'minus'"
          :size="16"
          :class="trend"
        />
      </div>
    </div>
    <div class="card-body">
      <div class="card-value-container">
        <p class="card-value" :class="status">{{ displayValue }}</p>
        <p class="card-unit">{{ unit }}</p>
      </div>
      <div class="card-status-badge" :class="status">
        <IconSvg :name="statusIcon" :size="14" />
        <span>{{ statusText }}</span>
      </div>
    </div>
    <div class="card-footer" v-if="normalRange">
      <div class="range-info">
        <IconSvg name="info" :size="12" />
        <span>正常范围: {{ normalRange }}</span>
      </div>
    </div>
  </div>
</template>

/* eslint-disable no-undef */
<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, required: true },
  isNormal: { type: Boolean, default: true },
  normalRange: { type: String, default: '' },
  status: { type: String, default: 'normal' }, // normal, warning, danger
  icon: { type: String, default: 'activity' },
  trend: { type: String, default: '' }, // up, down, stable
  hoverable: { type: Boolean, default: true }
});

defineEmits(['click']);

const statusText = computed(() => {
  const texts = {
    normal: '正常',
    warning: '注意',
    danger: '异常'
  };
  return texts[props.status] || '正常';
});

const statusIcon = computed(() => {
  const icons = {
    normal: 'check-circle',
    warning: 'alert-triangle',
    danger: 'alert-circle'
  };
  return icons[props.status] || 'check-circle';
});

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(1);
  }
  return props.value;
});
</script>

<style scoped lang="scss">
.health-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  }

  &.normal {
    border-color: #dcfce7;
  }

  &.warning {
    border-color: #fef3c7;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  }

  &.danger {
    border-color: #fee2e2;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    animation: pulse-border 2s ease-in-out infinite;
  }
}

@keyframes pulse-border {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }
  50% {
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.1);
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-normal {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #16a34a;
  }

  &.icon-warning {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #d97706;
  }

  &.icon-danger {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
  }
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  margin: 0;
}

.card-trend {
  .up {
    color: #10b981;
  }

  .down {
    color: #ef4444;
  }

  .stable {
    color: #94a3b8;
  }
}

.card-body {
  margin-bottom: 16px;
}

.card-value-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;

  .card-value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1;

    &.normal {
      color: #16a34a;
    }

    &.warning {
      color: #d97706;
    }

    &.danger {
      color: #dc2626;
    }
  }

  .card-unit {
    font-size: 14px;
    color: #94a3b8;
    font-weight: 500;
  }
}

.card-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;

  &.normal {
    background: #dcfce7;
    color: #166534;
  }

  &.warning {
    background: #fef3c7;
    color: #92400e;
  }

  &.danger {
    background: #fee2e2;
    color: #991b1b;
    animation: pulse-soft 2s ease-in-out infinite;
  }
}

@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.range-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .health-card {
    padding: 20px;
  }

  .card-value-container .card-value {
    font-size: 28px;
  }
}
</style>
