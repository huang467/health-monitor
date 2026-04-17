# API 对接指南

本文档说明如何将前端项目连接到真实的后端 API（硬件数据和数据库操作）。

---

## 📋 目录

1. [项目结构说明](#项目结构说明)
2. [快速开始](#快速开始)
3. [API 接口规范](#api-接口规范)
4. [分模块对接说明](#分模块对接说明)
5. [环境配置](#环境配置)
6. [常见问题](#常见问题)

---

## 📁 项目结构说明

```
src/
├── api/                    # API 接口封装
│   ├── auth.js            # 认证相关（登录、退出、刷新token）
│   ├── health.js          # 健康数据相关（硬件设备数据）
│   └── admin.js           # 后台管理相关（账户管理、统计）
├── utils/
│   └── request.js         # Axios 封装（请求/响应拦截器）
├── config/
│   └── api.config.js      # API 配置文件（环境切换）
└── views/                 # 页面组件（调用 API）
```

---

## 🚀 快速开始

### 步骤 1：配置后端地址

编辑 `src/config/api.config.js`，修改 `baseURL`：

```javascript
development: {
  baseURL: 'http://your-backend-server:8081', // 改成你的后端地址
  timeout: 10000
}
```

### 步骤 2：修改 API 文件，从模拟切换到真实接口

以 `src/api/health.js` 为例：

**修改前（模拟数据）：**
```javascript
export const getRealTimeHealth = async (elderlyId) => {
  // 模拟数据
  return Promise.resolve({ heartRate: 75, ... });
};
```

**修改后（真实接口）：**
```javascript
import request from '../utils/request';

export const getRealTimeHealth = async (elderlyId) => {
  // 取消注释下面这行，删除模拟代码
  return request.get('/api/health/realtime', { params: { elderlyId } });
};
```

### 步骤 3：确保后端返回格式符合约定

后端接口应返回以下格式：

```json
{
  "code": 200,
  "data": {
    // 实际数据
  },
  "msg": "成功"
}
```

---

## 📡 API 接口规范

### 统一响应格式

所有接口应遵循以下格式：

```json
{
  "code": 200,        // 状态码：200=成功，401=未登录，403=无权限，500=服务器错误
  "data": {},         // 实际数据
  "msg": "成功"       // 提示信息
}
```

### 认证方式

使用 **Bearer Token** 认证：

```
Headers: {
  "Authorization": "Bearer your_token_here"
}
```

Token 存储位置：
- 家属端：`localStorage.getItem('family_token')`
- 后台管理：`localStorage.getItem('admin_token')`

---

## 🔌 分模块对接说明

### 1. 认证模块 (`src/api/auth.js`)

#### 家属端登录

**接口：** `POST /api/auth/family/login`

**请求体：**
```json
{
  "phone": "13800000001",
  "password": "xxx",
  "elderlyId": "1001"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "phone": "13800000001",
      "elderlyId": "1001"
    }
  },
  "msg": "登录成功"
}
```

**前端调用：**
```javascript
import { familyLogin } from '@/api/auth';

const result = await familyLogin({
  phone: '13800000001',
  password: 'xxx',
  elderlyId: '1001'
});
// result.token 就是token，需要保存到 localStorage
localStorage.setItem('family_token', result.token);
localStorage.setItem('family_login', 'true');
```

#### 后台管理员登录

**接口：** `POST /api/auth/admin/login`

**请求体：**
```json
{
  "username": "admin",
  "password": "xxx"
}
```

**响应：** 同上，但 `userInfo` 字段可能不同。

---

### 2. 健康数据模块 (`src/api/health.js`)

#### 获取实时健康数据

**接口：** `GET /api/health/realtime?elderlyId=1001`

**响应：**
```json
{
  "code": 200,
  "data": {
    "heartRate": 75,              // 心率（次/分）
    "bloodPressure": "130/80",    // 血压（mmHg）
    "bloodOxygen": 98,            // 血氧（%）
    "updateTime": "2026-01-29 18:00:00",
    "deviceStatus": "online"      // 设备状态
  }
}
```

**前端调用：**
```javascript
import { getRealTimeHealth } from '@/api/health';

const data = await getRealTimeHealth('1001');
console.log(data.heartRate); // 75
```

#### 获取健康趋势数据

**接口：** `GET /api/health/trend?elderlyId=1001&type=heartRate&range=7`

**参数说明：**
- `type`: `heartRate` | `bloodPressure` | `bloodOxygen`
- `range`: `7` (近7天) | `30` (近30天)

**响应：**
```json
{
  "code": 200,
  "data": {
    "dates": ["2026-01-23", "2026-01-24", ...],
    "values": [75, 78, 82, ...],
    "unit": "次/分"
  }
}
```

#### 获取健康预警列表

**接口：** `GET /api/health/warnings?elderlyId=1001&page=1&pageSize=20`

**响应：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "W001",
        "time": "2026-01-29 18:00:00",
        "type": "血压异常",
        "desc": "血压145/92 mmHg",
        "status": "未处理",
        "level": "high"
      }
    ],
    "total": 10
  }
}
```

---

### 3. 后台管理模块 (`src/api/admin.js`)

#### 获取账户列表

**接口：** `GET /api/admin/accounts?keyword=xxx&role=family&status=enabled&page=1&pageSize=20`

**响应：**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": "U1001",
        "name": "张三",
        "phone": "13800000001",
        "elderlyId": "1001",
        "role": "family",
        "status": "enabled",
        "createdAt": "2025-12-01 10:20",
        "lastLoginAt": "2026-01-28 09:15"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## ⚙️ 环境配置

### 开发环境

在 `src/config/api.config.js` 中配置：

```javascript
development: {
  baseURL: 'http://localhost:8081',  // 本地后端
  timeout: 10000
}
```

### 生产环境

可以通过环境变量或构建配置切换：

```javascript
production: {
  baseURL: 'https://api.yourdomain.com',  // 生产环境
  timeout: 15000
}
```

---

## 🔧 常见问题

### Q1: 如何切换模拟数据和真实接口？

**A:** 在每个 API 文件中，找到对应的函数，取消注释真实接口调用，删除模拟代码。

例如 `health.js`：
```javascript
// ✅ 取消注释这行
return request.get('/api/health/realtime', { params: { elderlyId } });

// ⚠️ 删除这段模拟代码
// return Promise.resolve({ ... });
```

### Q2: Token 过期怎么办？

**A:** `src/utils/request.js` 中已实现自动刷新 token 的逻辑：
- 检测到 401 错误时，自动调用 `refreshToken()`
- 刷新成功后，重新发起原请求
- 刷新失败时，清除登录状态，跳转到登录页

### Q3: 如何添加新的 API 接口？

**A:** 
1. 在对应的 API 文件中添加新函数（如 `src/api/health.js`）
2. 使用 `request.get()` 或 `request.post()` 调用后端
3. 在页面组件中导入并使用

示例：
```javascript
// src/api/health.js
export const getNewData = async (params) => {
  return request.get('/api/health/new', { params });
};

// src/views/SomePage.vue
import { getNewData } from '@/api/health';
const data = await getNewData({ id: '123' });
```

### Q4: 后端返回格式不一致怎么办？

**A:** 修改 `src/utils/request.js` 中的响应拦截器，适配你的后端格式：

```javascript
service.interceptors.response.use(
  response => {
    // 如果你的后端直接返回 data，不需要 code 字段
    // 可以直接 return response.data;
    
    // 或者自定义处理逻辑
    const res = response.data;
    if (res.success) {  // 假设后端用 success 字段
      return res.data;
    }
    // ...
  }
);
```

### Q5: 如何处理硬件设备的实时数据推送？

**A:** 可以考虑以下方案：
1. **WebSocket 连接：** 在页面中建立 WebSocket 连接，接收硬件推送的数据
2. **轮询：** 使用 `setInterval` 定时请求接口（当前项目已实现）
3. **Server-Sent Events (SSE)：** 后端推送数据到前端

示例（WebSocket）：
```javascript
// 在 HealthDashboard.vue 中
const ws = new WebSocket('ws://your-backend/health/stream?elderlyId=1001');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  healthData.value = data;
};
```

---

## 📝 检查清单

对接完成后，请确认：

- [ ] 所有 API 文件中的模拟代码已删除
- [ ] `api.config.js` 中的 `baseURL` 已配置正确
- [ ] 后端接口返回格式符合约定
- [ ] Token 认证正常工作
- [ ] 错误处理（401/403/500）正常
- [ ] 页面中的数据能正常加载和刷新

---

## 🆘 需要帮助？

如果遇到问题，请检查：
1. 浏览器控制台的网络请求（Network 标签）
2. 后端接口日志
3. `src/utils/request.js` 中的拦截器逻辑

---

**最后更新：** 2026-01-29
