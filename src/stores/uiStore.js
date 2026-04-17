/**
 * UI Store
 * 管理全局 UI 状态和交互
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUIStore = defineStore('ui', () => {
  // ============ State ============
  // Toast 通知队列
  const toasts = ref([]);

  // 全局加载状态
  const globalLoading = ref(false);
  const loadingText = ref('加载中...');

  // 模态框状态
  const modals = ref({
    confirm: { show: false, title: '', message: '', onConfirm: null, onCancel: null },
    prompt: { show: false, title: '', message: '', value: '', onConfirm: null, onCancel: null }
  });

  // 侧边栏状态
  const sidebarCollapsed = ref(false);

  // 主题
  const theme = ref(localStorage.getItem('theme') || 'light');

  // 页面切换动画
  const pageTransition = ref('fade');

  // ============ Getters ============
  const isDark = computed(() => theme.value === 'dark');
  const hasToast = computed(() => toasts.value.length > 0);
  const activeToasts = computed(() => toasts.value);

  // ============ Actions ============
  /**
   * 显示 Toast 通知
   */
  const showToast = (options) => {
    const toast = {
      id: Date.now() + Math.random(),
      type: options.type || 'info', // success, error, warning, info
      title: options.title || '',
      message: options.message || '',
      duration: options.duration || 3000,
      closable: options.closable !== false,
      position: options.position || 'top-right'
    };

    toasts.value.push(toast);

    // 自动移除
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
    }

    return toast.id;
  };

  /**
   * 移除 Toast
   */
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  /**
   * 显示成功 Toast
   */
  const showSuccess = (message, title = '成功') => {
    return showToast({ type: 'success', title, message });
  };

  /**
   * 显示错误 Toast
   */
  const showError = (message, title = '错误') => {
    return showToast({ type: 'error', title, message, duration: 5000 });
  };

  /**
   * 显示警告 Toast
   */
  const showWarning = (message, title = '警告') => {
    return showToast({ type: 'warning', title, message });
  };

  /**
   * 显示信息 Toast
   */
  const showInfo = (message, title = '提示') => {
    return showToast({ type: 'info', title, message });
  };

  /**
   * 设置全局加载状态
   */
  const setLoading = (loading, text = '加载中...') => {
    globalLoading.value = loading;
    loadingText.value = text;
  };

  /**
   * 显示确认对话框
   */
  const showConfirm = (options) => {
    return new Promise((resolve) => {
      modals.value.confirm = {
        show: true,
        title: options.title || '确认',
        message: options.message || '',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        type: options.type || 'info',
        onConfirm: () => {
          modals.value.confirm.show = false;
          resolve(true);
        },
        onCancel: () => {
          modals.value.confirm.show = false;
          resolve(false);
        }
      };
    });
  };

  /**
   * 显示输入对话框
   */
  const showPrompt = (options) => {
    return new Promise((resolve) => {
      modals.value.prompt = {
        show: true,
        title: options.title || '请输入',
        message: options.message || '',
        value: options.defaultValue || '',
        placeholder: options.placeholder || '',
        confirmText: options.confirmText || '确认',
        cancelText: options.cancelText || '取消',
        onConfirm: (value) => {
          modals.value.prompt.show = false;
          resolve(value);
        },
        onCancel: () => {
          modals.value.prompt.show = false;
          resolve(null);
        }
      };
    });
  };

  /**
   * 切换侧边栏
   */
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', theme.value);
    applyTheme();
  };

  /**
   * 应用主题
   */
  const applyTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value);
  };

  /**
   * 设置页面过渡动画
   */
  const setPageTransition = (transition) => {
    pageTransition.value = transition;
  };

  /**
   * 初始化
   */
  const init = () => {
    applyTheme();
  };

  return {
    // State
    toasts,
    globalLoading,
    loadingText,
    modals,
    sidebarCollapsed,
    theme,
    pageTransition,

    // Getters
    isDark,
    hasToast,
    activeToasts,

    // Actions
    showToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setLoading,
    showConfirm,
    showPrompt,
    toggleSidebar,
    toggleTheme,
    applyTheme,
    setPageTransition,
    init
  };
});
