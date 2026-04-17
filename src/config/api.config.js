// API 配置文件 - 用于管理不同环境的接口地址
// 后续可以通过环境变量或构建配置来切换

const API_CONFIG = {
  // 开发环境（本地开发）
  development: {
    baseURL: 'http://localhost:8081', // 你的后端服务器地址
    timeout: 10000,
    // 硬件设备接口地址（如果硬件有独立的服务器）
    hardwareBaseURL: 'http://192.168.1.100:8080' // 示例：硬件设备IP
  },
  
  // 生产环境（部署后）
  production: {
    baseURL: 'https://api.yourdomain.com', // 生产环境后端地址
    timeout: 15000,
    hardwareBaseURL: 'https://hardware.yourdomain.com'
  }
};

// 根据当前环境选择配置
const env = process.env.NODE_ENV || 'development';
const currentConfig = API_CONFIG[env] || API_CONFIG.development;

export default currentConfig;
