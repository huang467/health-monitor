<template>
  <div class="login-page">
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <IconSvg name="shield" :size="48" />
          </div>
          <h1 class="brand-title">后台管理系统</h1>
          <p class="brand-subtitle">老人健康监测平台管理端</p>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="users" :size="20" />
              </div>
              <span>老人档案管理</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="alert-triangle" :size="20" />
              </div>
              <span>预警处理中心</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="bar-chart-2" :size="20" />
              </div>
              <span>数据统计分析</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>管理员登录</h2>
            <p>请使用管理员账号登录后台</p>
          </div>

          <div class="family-link">
            <router-link to="/login">
              <IconSvg name="arrow-left" :size="14" />
              <span>返回家属端</span>
            </router-link>
          </div>

          <div class="error-banner" v-if="errorMessage">
            <IconSvg name="alert-circle" :size="16" />
            <span>{{ errorMessage }}</span>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group" :class="{ 'has-error': errors.username }">
              <label>管理员账号</label>
              <div class="input-wrapper">
                <IconSvg name="user" :size="18" class="input-icon" />
                <input
                  v-model="username"
                  type="text"
                  placeholder="请输入管理员账号"
                  @blur="validateUsername"
                >
              </div>
              <div class="error-message" v-if="errors.username">
                <IconSvg name="alert-circle" :size="14" />
                <span>{{ errors.username }}</span>
              </div>
            </div>

            <div class="form-group" :class="{ 'has-error': errors.password }">
              <label>登录密码</label>
              <div class="input-wrapper">
                <IconSvg name="lock" :size="18" class="input-icon" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  @blur="validatePassword"
                >
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                >
                  <IconSvg :name="showPassword ? 'eye-off' : 'eye'" :size="18" />
                </button>
              </div>
              <div class="error-message" v-if="errors.password">
                <IconSvg name="alert-circle" :size="14" />
                <span>{{ errors.password }}</span>
              </div>
            </div>

            <button
              type="submit"
              class="login-btn"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              <span v-else>登录后台</span>
            </button>
          </form>

          <div class="test-account">
            <div class="test-divider">
              <span>测试账号</span>
            </div>
            <div class="test-info">
              <p><strong>账号：</strong>admin</p>
              <p><strong>密码：</strong>123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import IconSvg from '../components/IconSvg.vue';
import { adminLogin } from '../api/auth';

const router = useRouter();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);

const errors = reactive({
  username: '',
  password: ''
});

const validateUsername = () => {
  if (!username.value) {
    errors.username = '请输入管理员账号';
  } else {
    errors.username = '';
  }
};

const validatePassword = () => {
  if (!password.value) {
    errors.password = '请输入密码';
  } else if (password.value.length < 6) {
    errors.password = '密码长度至少6位';
  } else {
    errors.password = '';
  }
};

const validateForm = () => {
  validateUsername();
  validatePassword();
  return !errors.username && !errors.password;
};

const handleLogin = async () => {
  if (!validateForm()) {
    errorMessage.value = '请检查输入信息';
    return;
  }

  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const response = await adminLogin({
      username: username.value,
      password: password.value
    });

    localStorage.setItem('admin_login', 'true');
    localStorage.setItem('admin_name', username.value);
    localStorage.setItem('admin_token', response.token);

    router.push('/admin/dashboard');
  } catch (error) {
    errorMessage.value = `登录失败：${error.message || '请稍后重试'}`;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  top: -200px;
  right: -100px;
  opacity: 0.12;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  bottom: -100px;
  left: -100px;
  opacity: 0.1;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: 50%;
  left: 30%;
  opacity: 0.06;
}

.login-container {
  display: grid;
  grid-template-columns: 1fr 480px;
  width: 100%;
  max-width: 1100px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  z-index: 1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-section {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%);
  padding: 60px;
  display: flex;
  align-items: center;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
}

.brand-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-title {
  font-size: 34px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 17px;
  opacity: 0.8;
  margin: 0 0 48px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 16px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.form-section {
  padding: 60px;
  display: flex;
  align-items: center;
  background: #ffffff;
}

.form-card {
  width: 100%;
}

.form-header {
  margin-bottom: 24px;

  h2 {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px;
  }

  p {
    font-size: 15px;
    color: #64748b;
    margin: 0;
  }
}

.family-link {
  margin-bottom: 20px;

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #6366f1;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      color: #4f46e5;
    }
  }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
}

.login-form {
  .form-group {
    margin-bottom: 24px;

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
    }

    &.has-error {
      .input-wrapper {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    }
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 0 16px;
    transition: all 0.2s ease;

    &:focus-within {
      background: white;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 14px 0;
      font-size: 15px;
      color: #1e293b;
      outline: none;

      &::placeholder {
        color: #9ca3af;
      }
    }
  }

  .input-icon {
    color: #9ca3af;
    margin-right: 12px;
  }

  .password-toggle {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    transition: color 0.2s ease;

    &:hover {
      color: #6b7280;
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    color: #ef4444;
  }
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.test-account {
  margin-top: 32px;

  .test-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e5e7eb;
    }

    span {
      font-size: 13px;
      color: #9ca3af;
      font-weight: 500;
    }
  }

  .test-info {
    background: #f9fafb;
    border-radius: 12px;
    padding: 16px;

    p {
      margin: 0;
      font-size: 14px;
      color: #4b5563;
      line-height: 1.6;

      strong {
        color: #1e293b;
        font-weight: 600;
      }

      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }
  }
}

@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    max-width: 480px;
  }

  .brand-section {
    display: none;
  }

  .form-section {
    padding: 40px 32px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0;
    background: white;
  }

  .login-container {
    border-radius: 0;
    box-shadow: none;
    border: none;
  }

  .form-section {
    padding: 32px 24px;
  }

  .form-header h2 {
    font-size: 24px;
  }
}
</style>
