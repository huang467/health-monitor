<template>
  <div class="elderly-info-card" @click="handleClick">
    <div class="card-header">
      <div class="elderly-name">{{ elderly.name }}</div>
      <div class="elderly-status" :class="elderly.deviceStatus">
        {{ deviceStatusText }}
      </div>
    </div>
    <div class="card-body">
      <div class="info-row">
        <span class="label">老人ID：</span>
        <span class="value">{{ elderly.id }}</span>
      </div>
      <div class="info-row">
        <span class="label">年龄：</span>
        <span class="value">{{ elderly.age }}岁</span>
      </div>
      <div class="info-row">
        <span class="label">性别：</span>
        <span class="value">{{ elderly.gender }}</span>
      </div>
      <div class="info-row">
        <span class="label">关系：</span>
        <span class="value">{{ elderly.relationship }}</span>
      </div>
      <div class="info-row">
        <span class="label">慢性病：</span>
        <span class="value">{{ chronicDiseasesText }}</span>
      </div>
      <div class="info-row">
        <span class="label">绑定日期：</span>
        <span class="value">{{ elderly.bindDate }}</span>
      </div>
    </div>
    <div class="card-footer">
      <div class="select-btn">点击选择</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

/**
 * 老人信息卡片组件
 * @prop {Object} elderly - 老人信息对象
 * @prop {Boolean} clickable - 是否可点击（默认true）
 * @emits {Object} click - 点击事件
 */
// eslint-disable-next-line no-undef
const props = defineProps({
  elderly: {
    type: Object,
    required: true
  },
  clickable: {
    type: Boolean,
    default: true
  }
});

// eslint-disable-next-line no-undef
const emit = defineEmits(['click']);

// 设备状态文本
const deviceStatusText = computed(() => {
  const statusMap = {
    online: '在线',
    offline: '离线'
  };
  return statusMap[props.elderly.deviceStatus] || '未知';
});

// 慢性病文本
const chronicDiseasesText = computed(() => {
  if (!props.elderly.chronicDiseases || !Array.isArray(props.elderly.chronicDiseases)) {
    return '无';
  }
  return props.elderly.chronicDiseases.join('、');
});

// 处理点击
const handleClick = () => {
  if (props.clickable) {
    emit('click', props.elderly);
  }
};
</script>

<style scoped lang="scss">
.elderly-info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 24px;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  }

  &:active {
    transform: scale(1.02);
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e2e8f0;

    .elderly-name {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .elderly-status {
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;

      &.online {
        background: rgba(22, 163, 74, 0.1);
        color: #16a34a;
      }

      &.offline {
        background: rgba(100, 116, 139, 0.1);
        color: #64748b;
      }
    }
  }

  .card-body {
    margin-bottom: 20px;

    .info-row {
      display: flex;
      margin-bottom: 10px;
      font-size: 13px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        color: #64748b;
        width: 70px;
        flex-shrink: 0;
      }

      .value {
        color: #1e293b;
        font-weight: 500;
        flex: 1;
      }
    }
  }

  .card-footer {
    .select-btn {
      text-align: center;
      padding: 10px;
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.25s ease;
    }
  }

  &:hover .select-btn {
    background: #2563eb;
    color: #fff;
  }
}

@media (max-width: 768px) {
  .elderly-info-card {
    padding: 20px;

    .card-body {
      .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .label {
        width: auto;
        flex-shrink: 1;
      }
    }
  }
}
</style>
