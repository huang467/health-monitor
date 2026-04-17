<template>
  <div class="admin-dashboard">
    <AppHeader title="后台管理 - 仪表盘" />
    <AdminNav />

    <div class="container">
      <!-- 统计概览 -->
      <section class="stats-overview">
        <div class="stat-card primary">
          <div class="stat-icon">
            <IconSvg name="users" :size="32" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ elderlyStore.count }}</div>
            <div class="stat-label">老人总数</div>
          </div>
          <div class="stat-change positive">
            <IconSvg name="trending-up" :size="16" />
            <span>+3 本月新增</span>
          </div>
        </div>

        <div class="stat-card success">
          <div class="stat-icon">
            <IconSvg name="activity" :size="32" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ elderlyStore.onlineCount }}</div>
            <div class="stat-label">在线设备</div>
          </div>
          <div class="stat-change">
            <span>实时监测中</span>
          </div>
        </div>

        <div class="stat-card warning">
          <div class="stat-icon">
            <IconSvg name="alert-triangle" :size="32" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ warningStore.unreadCount }}</div>
            <div class="stat-label">未处理预警</div>
          </div>
          <div class="stat-change negative" v-if="warningStore.highPriorityCount > 0">
            <IconSvg name="alert-circle" :size="16" />
            <span>{{ warningStore.highPriorityCount }} 高优先级</span>
          </div>
        </div>

        <div class="stat-card info">
          <div class="stat-icon">
            <IconSvg name="calendar" :size="32" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ serviceStore.pendingCount }}</div>
            <div class="stat-label">待确认服务</div>
          </div>
          <div class="stat-change">
            <span>等待处理</span>
          </div>
        </div>
      </section>

      <!-- 快捷操作 -->
      <section class="quick-actions">
        <h2 class="section-title">
          <IconSvg name="zap" :size="24" />
          快捷操作
        </h2>
        <div class="actions-grid">
          <button class="action-card" @click="router.push('/admin/elderly')">
            <div class="action-icon blue">
              <IconSvg name="user-plus" :size="28" />
            </div>
            <span class="action-label">添加老人</span>
          </button>

          <button class="action-card" @click="router.push('/admin/warning')">
            <div class="action-icon orange">
              <IconSvg name="bell" :size="28" />
            </div>
            <span class="action-label">处理预警</span>
            <span v-if="warningStore.unreadCount > 0" class="action-badge">{{ warningStore.unreadCount }}</span>
          </button>

          <button class="action-card" @click="router.push('/admin/service')">
            <div class="action-icon green">
              <IconSvg name="check-square" :size="28" />
            </div>
            <span class="action-label">审核服务</span>
            <span v-if="serviceStore.pendingCount > 0" class="action-badge">{{ serviceStore.pendingCount }}</span>
          </button>

          <button class="action-card" @click="showStats()">
            <div class="action-icon purple">
              <IconSvg name="bar-chart-2" :size="28" />
            </div>
            <span class="action-label">数据报表</span>
          </button>
        </div>
      </section>

      <!-- 最近预警 -->
      <section class="recent-warnings">
        <div class="section-header">
          <h2 class="section-title">
            <IconSvg name="alert-triangle" :size="24" />
            最近预警
          </h2>
          <button class="view-all-btn" @click="router.push('/admin/warning')">
            查看全部
            <IconSvg name="chevron-right" :size="16" />
          </button>
        </div>

        <div class="warnings-list">
          <div
            v-for="warning in recentWarnings"
            :key="warning.id"
            class="warning-item"
            :class="warning.level"
           
           
          >
            <div class="warning-icon">
              <IconSvg name="alert-circle" :size="20" />
            </div>
            <div class="warning-content">
              <div class="warning-header">
                <span class="warning-type">{{ warning.type }}</span>
                <span class="warning-time">{{ warning.time }}</span>
              </div>
              <p class="warning-desc">{{ warning.desc }}</p>
              <div class="warning-elderly">
                <IconSvg name="user" :size="14" />
                <span>{{ getElderlyName(warning.elderlyId) }}</span>
              </div>
            </div>
            <div class="warning-actions">
              <button class="btn-handle" @click="handleWarning(warning)">处理</button>
            </div>
          </div>

          <div v-if="recentWarnings.length === 0" class="empty-state">
            <IconSvg name="check-circle" :size="48" />
            <p>暂无未处理预警</p>
          </div>
        </div>
      </section>

      <!-- 系统状态 -->
      <section class="system-status">
        <h2 class="section-title">
          <IconSvg name="server" :size="24" />
          系统状态
        </h2>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-icon online">
              <IconSvg name="wifi" :size="24" />
            </div>
            <div class="status-info">
              <span class="status-name">API 服务</span>
              <span class="status-text">运行正常</span>
            </div>
            <span class="status-badge online">在线</span>
          </div>

          <div class="status-item">
            <div class="status-icon online">
              <IconSvg name="database" :size="24" />
            </div>
            <div class="status-info">
              <span class="status-name">数据库</span>
              <span class="status-text">连接正常</span>
            </div>
            <span class="status-badge online">在线</span>
          </div>

          <div class="status-item">
            <div class="status-icon online">
              <IconSvg name="cpu" :size="24" />
            </div>
            <div class="status-info">
              <span class="status-name">硬件服务</span>
              <span class="status-text">{{ elderlyStore.onlineCount }} 设备在线</span>
            </div>
            <span class="status-badge online">正常</span>
          </div>

          <div class="status-item">
            <div class="status-icon warning">
              <IconSvg name="hard-drive" :size="24" />
            </div>
            <div class="status-info">
              <span class="status-name">存储空间</span>
              <span class="status-text">已使用 67%</span>
            </div>
            <span class="status-badge warning">注意</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '../components/AppHeader.vue';
import AdminNav from '../components/AdminNav.vue';
import { useElderlyStore } from '../stores/elderlyStore';
import { useWarningStore } from '../stores/warningStore';
import { useServiceStore } from '../stores/serviceStore';
import { useUIStore } from '../stores/uiStore';

const router = useRouter();
const elderlyStore = useElderlyStore();
const warningStore = useWarningStore();
const serviceStore = useServiceStore();
const uiStore = useUIStore();

// 最近预警（最多5条）
const recentWarnings = computed(() => {
  return warningStore.unread.slice(0, 5);
});

// 获取老人姓名
const getElderlyName = (elderlyId) => {
  const elderly = elderlyStore.getById(elderlyId);
  return elderly?.name || '未知老人';
};

// 处理预警
const handleWarning = async (warning) => {
  const confirmed = await uiStore.showConfirm({
    title: '处理预警',
    message: `确认已处理 "${warning.type}" 预警？`,
    confirmText: '确认处理',
    cancelText: '取消'
  });

  if (confirmed) {
    warningStore.handle(warning.id, '已确认并处理');
  }
};

// 统计数据
const showStats = () => {
  uiStore.showInfo('数据报表功能开发中...');
};
</script>

<style scoped lang="scss">
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding-bottom: 40px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

// 统计概览
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  }

  &.primary {
    .stat-icon {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #3b82f6;
    }
    .stat-value {
      color: #3b82f6;
    }
  }

  &.success {
    .stat-icon {
      background: linear-gradient(135deg, #dcfce7, #bbf7d0);
      color: #10b981;
    }
    .stat-value {
      color: #10b981;
    }
  }

  &.warning {
    .stat-icon {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #f59e0b;
    }
    .stat-value {
      color: #f59e0b;
    }
  }

  &.info {
    .stat-icon {
      background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
      color: #8b5cf6;
    }
    .stat-value {
      color: #8b5cf6;
    }
  }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;

  .stat-value {
    font-size: 32px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }
}

.stat-change {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;

  &.positive {
    color: #10b981;
  }

  &.negative {
    color: #ef4444;
  }
}

// 快捷操作
.quick-actions {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  }
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.blue {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #3b82f6;
  }

  &.orange {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #f59e0b;
  }

  &.green {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #10b981;
  }

  &.purple {
    background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
    color: #8b5cf6;
  }
}

.action-label {
  font-size: 15px;
  font-weight: 500;
  color: #475569;
}

.action-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-soft 2s ease-in-out infinite;
}

// 最近预警
.recent-warnings {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
}

.warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border-left: 4px solid;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  &.high {
    border-left-color: #ef4444;

    .warning-icon {
      background: #fee2e2;
      color: #dc2626;
    }
  }

  &.medium {
    border-left-color: #f59e0b;

    .warning-icon {
      background: #fef3c7;
      color: #d97706;
    }
  }

  &.low {
    border-left-color: #3b82f6;

    .warning-icon {
      background: #dbeafe;
      color: #2563eb;
    }
  }
}

.warning-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;

  .warning-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;

    .warning-type {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
    }

    .warning-time {
      font-size: 13px;
      color: #94a3b8;
    }
  }

  .warning-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 8px;
    line-height: 1.5;
  }

  .warning-elderly {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #94a3b8;
  }
}

.warning-actions {
  .btn-handle {
    padding: 8px 16px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  color: #94a3b8;

  p {
    margin-top: 12px;
    font-size: 15px;
  }
}

// 系统状态
.system-status {
  margin-bottom: 24px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.online {
    background: #dcfce7;
    color: #10b981;
  }

  &.warning {
    background: #fef3c7;
    color: #f59e0b;
  }

  &.offline {
    background: #fee2e2;
    color: #ef4444;
  }
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .status-name {
    font-size: 15px;
    font-weight: 600;
    color: #1e293b;
  }

  .status-text {
    font-size: 13px;
    color: #64748b;
  }
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  &.online {
    background: #dcfce7;
    color: #166534;
  }

  &.warning {
    background: #fef3c7;
    color: #92400e;
  }

  &.offline {
    background: #fee2e2;
    color: #991b1b;
  }
}

// 脉冲动画
@keyframes pulse-soft {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// 响应式
@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .warning-item {
    flex-direction: column;
  }

  .warning-actions {
    width: 100%;

    .btn-handle {
      width: 100%;
    }
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
