<template>
  <nav class="admin-nav">
    <div class="nav-container">
      <div
        v-for="item in navItems"
        :key="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
        @click="navigateTo(item.path)"
      >
        <div class="nav-icon-wrapper">
          <IconSvg :name="item.icon" :size="22" />
        </div>
        <span class="nav-text">{{ item.name }}</span>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import IconSvg from './IconSvg.vue';

const router = useRouter();
const route = useRoute();

const navItems = [
  { name: '账户管理', path: '/admin/dashboard', icon: 'clipboard' },
  { name: '老人管理', path: '/admin/elderly', icon: 'user' },
  { name: '健康数据', path: '/admin/health', icon: 'chart' },
  { name: '预警管理', path: '/admin/warning', icon: 'warning' },
  { name: '服务管理', path: '/admin/service', icon: 'calendar' },
  { name: '数据统计', path: '/admin/statistics', icon: 'trend' }
];

const isActive = (path) => route.path.startsWith(path);

const navigateTo = (path) => {
  router.push(path);
};
</script>

<style scoped lang="scss">
.admin-nav {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 73px;
  z-index: 999;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;

  &:hover {
    color: #2563eb;
    background: rgba(37, 99, 235, 0.05);
  }

  &.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
    background: rgba(37, 99, 235, 0.08);

    .nav-icon-wrapper {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
  }
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  transition: all 0.25s ease;
}

@media (max-width: 768px) {
  .admin-nav {
    top: 57px;
  }

  .nav-container {
    padding: 0 16px;
  }

  .nav-item {
    padding: 12px 16px;
    font-size: 14px;
    gap: 8px;

    .nav-text {
      display: none;
    }
  }

  .nav-icon-wrapper {
    width: 40px;
    height: 40px;

    :deep(svg) {
      width: 22px;
      height: 22px;
    }
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 12px;
  }

  .nav-item {
    padding: 10px 12px;
  }

  .nav-icon-wrapper {
    width: 36px;
    height: 36px;

    :deep(svg) {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
