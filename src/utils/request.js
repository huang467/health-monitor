import axios from 'axios';
import apiConfig from '../config/api.config';

// 创建Axios实例，使用配置文件中的baseURL
const service = axios.create({
  baseURL: apiConfig.baseURL, // 从配置文件读取，支持环境切换
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器（添加token，统一处理请求）
service.interceptors.request.use(
  config => {
    // 从本地存储获取登录token
    // 优先使用家属端token，如果没有则使用管理员token
    const familyToken = localStorage.getItem('family_token');
    const adminToken = localStorage.getItem('admin_token');
    const token = familyToken || adminToken;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 可以在这里添加其他请求头，比如设备ID、版本号等
    // config.headers['X-Device-ID'] = localStorage.getItem('device_id');
    
    return config;
  },
  error => {
    console.error('请求拦截器错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器（统一处理响应数据和错误）
service.interceptors.response.use(
  response => {
    // 后端接口返回格式约定：{ code: 200, data: {}, msg: '成功' }
    const res = response.data;
    
    // 如果后端返回的code不是200，视为业务错误
    if (res.code !== 200) {
      // 401: token过期或未登录，尝试刷新token
      if (res.code === 401) {
        return handleTokenExpired();
      }
      
      // 403: 权限不足
      if (res.code === 403) {
        alert('权限不足，请联系管理员');
        // 可以跳转到登录页
        // window.location.href = '/login';
        return Promise.reject(res);
      }
      
      // 其他业务错误，显示后端返回的错误信息
      const errorMsg = res.msg || '请求失败，请稍后重试';
      console.error('接口错误：', errorMsg);
      // 注意：生产环境建议使用更友好的提示方式（如消息提示组件），而不是alert
      alert(errorMsg);
      return Promise.reject(res);
    }
    
    // 返回data字段，这样调用方直接拿到数据，不需要再 .data
    return res.data;
  },
  error => {
    // 网络错误或HTTP状态码错误（4xx, 5xx）
    console.error('请求失败：', error);
    
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status;
      
      if (status === 401) {
        // token过期，尝试刷新
        return handleTokenExpired();
      }
      
      if (status === 403) {
        alert('权限不足');
        return Promise.reject(error);
      }
      
      if (status === 404) {
        alert('接口不存在，请检查接口地址');
        return Promise.reject(error);
      }
      
      if (status >= 500) {
        alert('服务器错误，请稍后重试');
        return Promise.reject(error);
      }
      
      // 其他HTTP错误
      const errorMsg = error.response.data?.msg || `请求失败（${status}）`;
      alert(errorMsg);
    } else if (error.request) {
      // 请求已发出但没有收到响应（网络问题）
      alert('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      alert(`请求失败：${error.message}`);
    }
    
    return Promise.reject(error);
  }
);

/**
 * 处理token过期的情况
 * 尝试刷新token，如果刷新失败则跳转到登录页
 */
let isRefreshing = false; // 防止并发刷新
let failedQueue = []; // 存储刷新期间失败的请求

const handleTokenExpired = async () => {
  if (isRefreshing) {
    // 如果正在刷新，将当前请求加入队列
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }
  
  isRefreshing = true;
  
  try {
    // 动态导入避免循环依赖
    const { refreshToken } = await import('../api/auth');
    // 尝试刷新token
    const newTokenData = await refreshToken();
    const newToken = newTokenData.token;
    
    // 更新本地存储的token
    if (localStorage.getItem('family_token')) {
      localStorage.setItem('family_token', newToken);
    }
    if (localStorage.getItem('admin_token')) {
      localStorage.setItem('admin_token', newToken);
    }
    
    // 处理队列中的请求
    failedQueue.forEach(({ resolve }) => {
      resolve();
    });
    failedQueue = [];
    
    isRefreshing = false;
    
    // 重新发起原请求（这里简化处理，实际可以保存原请求配置）
    return Promise.reject({ code: 401, msg: '请重新发起请求' });
  } catch (refreshError) {
    // 刷新失败，清除登录状态，跳转到登录页
    localStorage.removeItem('family_token');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('family_login');
    localStorage.removeItem('admin_login');
    
    // 处理队列中的请求
    failedQueue.forEach(({ reject }) => {
      reject(refreshError);
    });
    failedQueue = [];
    
    isRefreshing = false;
    
    alert('登录已过期，请重新登录');
    // 跳转到登录页（根据当前路径判断是家属端还是后台）
    const isAdminPath = window.location.hash.includes('/admin');
    window.location.href = isAdminPath ? '/#/admin/login' : '/#/login';
    
    return Promise.reject(refreshError);
  }
};

export default service;