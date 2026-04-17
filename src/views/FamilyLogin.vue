<template>
  <div class="login-page">
    <!-- 背景装饰 -->
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
            <IconSvg name="heart" :size="48" />
          </div>
          <h1 class="brand-title">老人健康监测系统</h1>
          <p class="brand-subtitle">实时关注老人健康状况，让关爱更及时</p>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="activity" :size="20" />
              </div>
              <span>实时健康监测</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="bell" :size="20" />
              </div>
              <span>智能预警提醒</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <IconSvg name="users" :size="20" />
              </div>
              <span>家属远程关怀</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单 -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>家属登录</h2>
            <p>欢迎回来，请登录您的账户</p>
          </div>

          <div class="admin-link">
            <router-link to="/admin/login">
              <IconSvg name="shield" :size="14" />
              <span>管理员入口</span>
            </router-link>
          </div>

          <form @submit.prevent="handleLogin" class="login-form">
            <div class="form-group" :class="{ 'has-error': errors.phone }">
              <label>手机号码</label>
              <div class="input-wrapper">
                <IconSvg name="phone" :size="18" class="input-icon" />
                <input
                  v-model="phone"
                  type="tel"
                  placeholder="请输入绑定的手机号"
                  maxlength="11"
                  @blur="validatePhone"
                >
              </div>
              <div class="error-message" v-if="errors.phone">
                <IconSvg name="alert-circle" :size="14" />
                <span>{{ errors.phone }}</span>
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

            <div class="form-options">
              <label class="remember-me">
                <input type="checkbox" v-model="rememberMe">
                <span>记住我</span>
              </label>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>

            <button
              type="submit"
              class="login-btn"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="loading-spinner"></span>
              <span v-else>登录</span>
            </button>
          </form>

          <div class="test-account">
            <div class="test-divider">
              <span>测试账号</span>
            </div>
            <div class="test-info">
              <p><strong>手机号：</strong>13800000001</p>
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
import { familyLogin } from '../api/auth';

const router = useRouter();

const phone = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isSubmitting = ref(false);

const errors = reactive({
  phone: '',
  password: ''
});

const validatePhone = () => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phone.value) {
    errors.phone = '请输入手机号';
  } else if (!phoneRegex.test(phone.value)) {
    errors.phone = '请输入正确的手机号格式';
  } else {
    errors.phone = '';
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
  validatePhone();
  validatePassword();
  return !errors.phone && !errors.password;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const response = await familyLogin({
      phone: phone.value,
      password: password.value
    });

    localStorage.setItem('family_login', 'true');
    localStorage.setItem('family_phone', phone.value);
    localStorage.setItem('family_token', response.token);

    router.push('/select-elderly');
  } catch (error) {
    console.error('登录失败：', error);
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
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
  position: relative;
  overflow: hidden;
  padding: 24px;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}

.bg-circle-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  top: -200px;
  right: -100px;
  opacity: 0.1;
}

.bg-circle-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  bottom: -100px;
  left: -100px;
  opacity: 0.1;
}

.bg-circle-3 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  top: 50%;
  left: 30%;
  opacity: 0.05;
}

// 登录容器
.login-container {
  display: grid;
  grid-template-columns: 1fr 480px;
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

// 品牌区域
.brand-section {
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
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
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 12px;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 18px;
  opacity: 0.85;
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

// 表单区域
.form-section {
  padding: 60px;
  display: flex;
  align-items: center;
}

.form-card {
  width: 100%;
}

.form-header {
  margin-bottom: 32px;

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

.admin-link {
  margin-bottom: 24px;
  text-align: right;

  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      color: #1d4ed8;
    }
  }
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
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
    justify-content: center;
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

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #4b5563;
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      accent-color: #2563eb;
    }
  }

  .forgot-link {
    font-size: 14px;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #1d4ed8;
    }
  }
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
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
    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
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

// 测试账号
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

// 响应式
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
  }

  .form-section {
    padding: 32px 24px;
  }

  .form-header h2 {
    font-size: 24px;
  }
}
</style>
