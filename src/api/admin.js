// 后台管理相关接口（账户管理、数据统计等）
// import request from '../utils/request';

/**
 * 获取账户列表（支持筛选和分页）
 * @param {Object} params - 查询参数
 * @param {string} params.keyword - 关键字搜索（姓名/手机号/老人ID）
 * @param {string} params.role - 角色筛选（family/admin）
 * @param {string} params.status - 状态筛选（enabled/disabled）
 * @param {number} params.page - 页码（默认1）
 * @param {number} params.pageSize - 每页数量（默认20）
 * @returns {Promise} 返回账户列表和总数
 * 
 * 后端接口示例：
 * GET /api/admin/accounts?keyword=xxx&role=family&status=enabled&page=1&pageSize=20
 * Headers: { Authorization: "Bearer xxx" }
 * Response: { 
 *   code: 200, 
 *   data: { 
 *     list: [{ id, name, phone, elderlyId, role, status, createdAt, lastLoginAt }],
 *     total: 100,
 *     page: 1,
 *     pageSize: 20
 *   },
 *   msg: "成功"
 * }
 */
export const getAccountList = async (params = {}) => {
  // TODO: 对接真实后端时，取消注释下面这行，删除模拟代码
  // return request.get('/api/admin/accounts', { params });
  
  // 临时模拟数据（仅用于前端开发，后续必须删除）
  const mockAccounts = [
    {
      id: 'U1001',
      name: '张三',
      phone: '13800000001',
      elderlyId: '1001',
      role: 'family',
      status: 'enabled',
      createdAt: '2025-12-01 10:20',
      lastLoginAt: '2026-01-28 09:15'
    },
    {
      id: 'U1002',
      name: '李四',
      phone: '13800000002',
      elderlyId: '1002',
      role: 'family',
      status: 'enabled',
      createdAt: '2025-12-05 14:30',
      lastLoginAt: '2026-01-27 16:40'
    },
    {
      id: 'A0001',
      name: '系统管理员',
      phone: '13800009999',
      elderlyId: '-',
      role: 'admin',
      status: 'enabled',
      createdAt: '2025-11-20 09:00',
      lastLoginAt: '2026-01-29 08:00'
    },
    {
      id: 'U1003',
      name: '王五',
      phone: '13800000003',
      elderlyId: '1003',
      role: 'family',
      status: 'disabled',
      createdAt: '2025-12-10 11:10',
      lastLoginAt: '2025-12-20 13:35'
    }
  ];
  
  // 简单的模拟筛选逻辑
  let filtered = mockAccounts;
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.includes(kw) || 
      item.phone.includes(kw) || 
      String(item.elderlyId).includes(kw) ||
      item.id.toLowerCase().includes(kw)
    );
  }
  if (params.role) {
    filtered = filtered.filter(item => item.role === params.role);
  }
  if (params.status) {
    filtered = filtered.filter(item => item.status === params.status);
  }
  
  return Promise.resolve({
    list: filtered,
    total: filtered.length,
    page: params.page || 1,
    pageSize: params.pageSize || 20
  });
};

/**
 * 获取账户详情
 * @param {string} accountId - 账户ID
 * @returns {Promise} 返回账户详细信息
 * 
 * 后端接口示例：
 * GET /api/admin/accounts/:accountId
 * Response: { code: 200, data: { ...账户详情... }, msg: "成功" }
 */
export const getAccountDetail = async (accountId) => {
  // TODO: 对接真实后端
  // return request.get(`/api/admin/accounts/${accountId}`);
  
  return Promise.resolve({
    id: accountId,
    name: '示例账户',
    phone: '13800000000',
    elderlyId: '1001',
    role: 'family',
    status: 'enabled',
    createdAt: '2025-12-01 10:20',
    lastLoginAt: '2026-01-28 09:15'
  });
};

/**
 * 更新账户状态（启用/停用）
 * @param {string} accountId - 账户ID
 * @param {string} status - 新状态（enabled/disabled）
 * @returns {Promise}
 * 
 * 后端接口示例：
 * PUT /api/admin/accounts/:accountId/status
 * Body: { status: "enabled" }
 * Response: { code: 200, msg: "状态更新成功" }
 */
export const updateAccountStatus = async (accountId, status) => {
  // TODO: 对接真实后端
  // return request.put(`/api/admin/accounts/${accountId}/status`, { status });
  
  console.log(`更新账户状态: ${accountId}, 状态: ${status}`);
  return Promise.resolve({ msg: '状态更新成功' });
};

/**
 * 获取系统统计数据（用于后台仪表盘）
 * @returns {Promise} 返回统计数据
 * 
 * 后端接口示例：
 * GET /api/admin/statistics
 * Response: { 
 *   code: 200, 
 *   data: { 
 *     totalAccounts: 100,
 *     totalElderly: 80,
 *     onlineDevices: 75,
 *     todayWarnings: 5
 *   }
 * }
 */
export const getStatistics = async () => {
  // TODO: 对接真实后端
  // return request.get('/api/admin/statistics');
  
  return Promise.resolve({
    totalAccounts: 100,
    totalElderly: 80,
    onlineDevices: 75,
    todayWarnings: 5
  });
};

/**
 * 获取老人列表（管理员）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 关键字搜索（姓名/手机号/老人ID）
 * @returns {Promise} 返回老人列表
 * 
 * 后端接口示例：
 * GET /api/admin/elderly?page=1&pageSize=20&keyword=xxx
 * Headers: { Authorization: "Bearer xxx" }
 * Response: { 
 *   code: 200, 
 *   data: { 
 *     list: [
 *       {
 *         id: "1001",
 *         name: "张三",
 *         age: 72,
 *         gender: "男",
 *         phone: "13800001111",
 *         deviceStatus: "online",
 *         bindDate: "2025-12-01"
 *       }
 *     ],
 *     total: 50
 *   },
 *   msg: "获取成功"
 * }
 */
export const getElderlyList = async (params = {}) => {
  // TODO: 对接真实后端
  // return request.get('/api/admin/elderly', { params });
  
  // 临时模拟数据
  const mockElderlyList = [
    {
      id: '1001',
      name: '张三',
      age: 72,
      gender: '男',
      phone: '13800001111',
      deviceStatus: 'online',
      bindDate: '2025-12-01'
    },
    {
      id: '1002',
      name: '李四',
      age: 75,
      gender: '女',
      phone: '13800002222',
      deviceStatus: 'offline',
      bindDate: '2025-11-15'
    },
    {
      id: '1003',
      name: '王五',
      age: 68,
      gender: '男',
      phone: '13800003333',
      deviceStatus: 'online',
      bindDate: '2025-12-20'
    }
  ];
  
  let filtered = mockElderlyList;
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    filtered = filtered.filter(item => 
      item.name.includes(kw) || 
      item.phone.includes(kw) || 
      item.id.includes(kw)
    );
  }
  
  return Promise.resolve({
    list: filtered,
    total: filtered.length
  });
};

/**
 * 添加老人（管理员）
 * @param {Object} elderlyData - 老人信息
 * @param {string} elderlyData.id - 老人ID
 * @param {string} elderlyData.name - 姓名
 * @param {string} elderlyData.gender - 性别
 * @param {number} elderlyData.age - 年龄
 * @param {string} elderlyData.phone - 联系电话
 * @param {Array} elderlyData.chronicDiseases - 慢性病列表
 * @param {string} elderlyData.deviceId - 设备ID
 * @returns {Promise}
 * 
 * 后端接口示例：
 * POST /api/admin/elderly
 * Body: { id: "1003", name: "王五", gender: "男", age: 68, phone: "13800002222", chronicDiseases: ["糖尿病"], deviceId: "DEV003" }
 * Response: { code: 200, data: { elderlyId: "1003" }, msg: "添加成功" }
 */
export const addElderly = async (elderlyData) => {
  // TODO: 对接真实后端
  // return request.post('/api/admin/elderly', elderlyData);
  
  return Promise.resolve({
    elderlyId: elderlyData.id
  });
};

/**
 * 更新老人信息（管理员）
 * @param {string} elderlyId - 老人ID
 * @param {Object} elderlyData - 更新的老人信息
 * @returns {Promise}
 * 
 * 后端接口示例：
 * PUT /api/admin/elderly/1001
 * Body: { name: "王五", phone: "13800003333", chronicDiseases: ["糖尿病", "高血压"] }
 * Response: { code: 200, msg: "更新成功" }
 */
export const updateElderly = async (elderlyId, elderlyData) => {
  // TODO: 对接真实后端
  // return request.put(`/api/admin/elderly/${elderlyId}`, elderlyData);
  
  console.log(`更新老人信息: ${elderlyId}`, elderlyData);
  return Promise.resolve({ msg: '更新成功' });
};

/**
 * 删除老人（管理员）
 * @param {string} elderlyId - 老人ID
 * @returns {Promise}
 * 
 * 后端接口示例：
 * DELETE /api/admin/elderly/1001
 * Response: { code: 200, msg: "删除成功" }
 */
export const deleteElderly = async (elderlyId) => {
  // TODO: 对接真实后端
  // return request.delete(`/api/admin/elderly/${elderlyId}`);
  
  console.log(`删除老人: ${elderlyId}`);
  return Promise.resolve({ msg: '删除成功' });
};

/**
 * 绑定家属（管理员）
 * @param {Object} bindData - 绑定数据
 * @param {string} bindData.elderlyId - 老人ID
 * @param {string} bindData.familyPhone - 家属手机号
 * @param {string} bindData.relationship - 关系
 * @returns {Promise}
 * 
 * 后端接口示例：
 * POST /api/admin/family-bind
 * Body: { elderlyId: "1001", familyPhone: "13800000001", relationship: "父子" }
 * Response: { code: 200, msg: "绑定成功" }
 */
export const bindFamily = async (bindData) => {
  // TODO: 对接真实后端
  // return request.post('/api/admin/family-bind', bindData);
  
  console.log('绑定家属:', bindData);
  return Promise.resolve({ msg: '绑定成功' });
};
