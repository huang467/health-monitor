<template>
  <header class="app-header">
    <div class="header-left">
      <button class="back-btn" @click="handleBack">
        <IconSvg name="arrow-left" :size="20" />
        <span>返回</span>
      </button>
    </div>

    <h1 class="header-title">{{ title }}</h1>

    <div class="header-right">
      <div class="user-info" v-if="isLoggedIn">
        <div class="user-avatar">
          <IconSvg name="user" :size="16" />
        </div>
        <span class="user-name">{{ userInfo }}</span>
      </div>

      <button
        v-if="showHomeBtn && !isAdminPage"
        class="action-btn home-btn"
        @click="router.push('/home')"
      >
        <IconSvg name="home" :size="18" />
        <span class="hide-mobile">首页</span>
      </button>

      <button class="action-btn logout-btn" @click="handleLogout">
        <IconSvg name="logout" :size="18" />
        <span class="hide-mobile">退出</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import IconSvg from './IconSvg.vue';

// eslint-disable-next-line no-undef
defineProps({
  title: { type: String, required: true },
  showHomeBtn: { type: Boolean, default: true }
});

const router = useRouter();
const route = useRoute();

const isLoggedIn = computed(() => {
  return localStorage.getItem('family_login') === 'true' ||
         localStorage.getItem('admin_login') === 'true';
});

const isAdminPage = computed(() => route.path.includes('/admin'));

const userInfo = computed(() => {
  if (localStorage.getItem('admin_login') === 'true') {
    return '管理员';
  } else if (localStorage.getItem('family_login') === 'true') {
    return '家属';
  }
  return '';
});

const handleBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    if (isAdminPage.value) {
      router.push('/admin/dashboard');
    } else {
      router.push('/home');
    }
  }
};

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('family_login');
    localStorage.removeItem('admin_login');
    localStorage.removeItem('hardware_token');
    localStorage.removeItem('family_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('current_elderly_id');
    localStorage.removeItem('current_elderly_name');

    if (isAdminPage.value) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  }
};
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none;
  }
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.header-right {
  justify-content: flex-end;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateX(-1px);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;

  span {
    white-space: nowrap;
  }
}

.home-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.25);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.logout-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;

  &:hover {
    background: rgba(220, 38, 38, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }

  .header-title {
    font-size: 16px;
    flex: 1;
  }

  .back-btn {
    padding: 8px 12px;
    font-size: 14px;

    span {
      display: none;
    }
  }

  .user-info {
    padding: 6px 10px;

    .user-name {
      display: none;
    }
  }

  .action-btn {
    padding: 8px;

    span {
      display: none;
    }
  }
}

@media (max-width: 480px) {
  .app-header {
    padding: 10px 12px;
  }

  .header-title {
    font-size: 15px;
  }

  .back-btn {
    padding: 6px 10px;
  }
}
</style>
