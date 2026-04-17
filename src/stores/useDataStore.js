/**
 * 统一数据管理中心
 * 处理老人、健康数据、预警、服务预约等所有数据的关联关系
 */
import { reactive, computed, watch } from 'vue';

// 创建全局响应式数据存储
const dataStore = reactive({
  // 老人基础数据
  elderly: {
    list: [],
    current: null,
    loaded: false
  },

  // 健康数据
  health: {
    realtime: {}, // 实时数据，key为elderlyId
    history: {},  // 历史数据
    trends: {}    // 趋势数据
  },

  // 预警数据
  warnings: {
    list: [],
    unread: 0
  },

  // 服务预约
  services: {
    list: [],
    pending: 0
  },

  // 家属信息
  families: {},

  // 设备状态
  devices: {}
});

// 从localStorage加载数据
const loadFromStorage = () => {
  // 加载老人列表
  const elderlyList = localStorage.getItem('elderlyList');
  if (elderlyList) {
    dataStore.elderly.list = JSON.parse(elderlyList);
  }

  // 加载当前选中老人
  const currentElderly = localStorage.getItem('current_elderly_info');
  if (currentElderly) {
    try {
      dataStore.elderly.current = JSON.parse(currentElderly);
    } catch (e) {
      console.error('解析当前老人信息失败:', e);
    }
  }

  // 加载健康数据
  const healthData = localStorage.getItem('healthData');
  if (healthData) {
    dataStore.health.realtime = JSON.parse(healthData);
  }

  // 加载预警数据
  const warnings = localStorage.getItem('warnings');
  if (warnings) {
    dataStore.warnings.list = JSON.parse(warnings);
    dataStore.warnings.unread = dataStore.warnings.list.filter(w => w.status === '未处理').length;
  }

  // 加载服务预约
  const services = localStorage.getItem('serviceOrders');
  if (services) {
    dataStore.services.list = JSON.parse(services);
    dataStore.services.pending = dataStore.services.list.filter(s => s.status === '待确认（社区审核中）').length;
  }

  dataStore.elderly.loaded = true;
};

// 保存到localStorage
const saveToStorage = () => {
  localStorage.setItem('elderlyList', JSON.stringify(dataStore.elderly.list));
  if (dataStore.elderly.current) {
    localStorage.setItem('current_elderly_id', dataStore.elderly.current.id);
    localStorage.setItem('current_elderly_name', dataStore.elderly.current.name);
    localStorage.setItem('current_elderly_info', JSON.stringify(dataStore.elderly.current));
  }
  localStorage.setItem('healthData', JSON.stringify(dataStore.health.realtime));
  localStorage.setItem('warnings', JSON.stringify(dataStore.warnings.list));
  localStorage.setItem('serviceOrders', JSON.stringify(dataStore.services.list));
};

// 监听数据变化自动保存
watch(() => dataStore.elderly.list, saveToStorage, { deep: true });
watch(() => dataStore.warnings.list, () => {
  dataStore.warnings.unread = dataStore.warnings.list.filter(w => w.status === '未处理').length;
  saveToStorage();
}, { deep: true });
watch(() => dataStore.services.list, () => {
  dataStore.services.pending = dataStore.services.list.filter(s => s.status === '待确认（社区审核中）').length;
  saveToStorage();
}, { deep: true });

// API方法
export const useDataStore = () => {
  // 初始化加载
  if (!dataStore.elderly.loaded) {
    loadFromStorage();
  }

  return {
    // 原始数据
    store: dataStore,

    // 计算属性
    elderlyCount: computed(() => dataStore.elderly.list.length),
    activeElderlyCount: computed(() => dataStore.elderly.list.filter(e => e.deviceStatus === 'online').length),
    warningCount: computed(() => dataStore.warnings.unread),
    pendingServiceCount: computed(() => dataStore.services.pending),

    // 老人相关方法
    elderly: {
      // 获取所有老人
      getAll: () => dataStore.elderly.list,

      // 获取单个老人
      getById: (id) => {
        if (!id) return null;
        return dataStore.elderly.list.find(e => e.id === id || e.id === String(id));
      },

      // 设置当前老人
      setCurrent: (elderly) => {
        dataStore.elderly.current = elderly;
        localStorage.setItem('current_elderly_id', elderly.id);
        localStorage.setItem('current_elderly_name', elderly.name);
        localStorage.setItem('current_elderly_info', JSON.stringify(elderly));
      },

      // 获取当前老人
      getCurrent: () => dataStore.elderly.current,

      // 添加老人
      add: (elderly) => {
        const newElderly = {
          ...elderly,
          id: elderly.id || Date.now().toString(),
          deviceStatus: elderly.deviceStatus || 'online',
          bindDate: new Date().toISOString().split('T')[0],
          lastHealthCheck: new Date().toISOString().split('T')[0]
        };
        dataStore.elderly.list.unshift(newElderly);
        return newElderly;
      },

      // 更新老人
      update: (id, data) => {
        if (!id) return null;
        const index = dataStore.elderly.list.findIndex(e => e.id === id || e.id === String(id));
        if (index !== -1) {
          dataStore.elderly.list[index] = { ...dataStore.elderly.list[index], ...data };
          // 如果更新的是当前老人，同步更新
          if (dataStore.elderly.current?.id === id) {
            dataStore.elderly.current = { ...dataStore.elderly.current, ...data };
          }
          return dataStore.elderly.list[index];
        }
        return null;
      },

      // 删除老人
      remove: (id) => {
        if (!id) return;
        dataStore.elderly.list = dataStore.elderly.list.filter(e => e.id !== id && e.id !== String(id));
        if (dataStore.elderly.current?.id === id) {
          dataStore.elderly.current = null;
          localStorage.removeItem('current_elderly_id');
          localStorage.removeItem('current_elderly_name');
          localStorage.removeItem('current_elderly_info');
        }
      }
    },

    // 健康数据方法
    health: {
      // 获取老人健康数据
      getByElderlyId: (elderlyId) => {
        return dataStore.health.realtime[elderlyId] || generateMockHealthData();
      },

      // 更新健康数据
      update: (elderlyId, data) => {
        dataStore.health.realtime[elderlyId] = {
          ...dataStore.health.realtime[elderlyId],
          ...data,
          updateTime: new Date().toLocaleString('zh-CN')
        };
        // 更新老人的最后检查时间
        const elderly = dataStore.elderly.list.find(e => e.id === elderlyId);
        if (elderly) {
          elderly.lastHealthCheck = new Date().toISOString().split('T')[0];
        }
      }
    },

    // 预警方法
    warnings: {
      getAll: () => dataStore.warnings.list,

      getByElderlyId: (elderlyId) => {
        return dataStore.warnings.list.filter(w => w.elderlyId === elderlyId);
      },

      add: (warning) => {
        const newWarning = {
          ...warning,
          id: Date.now().toString(),
          time: new Date().toLocaleString('zh-CN'),
          status: '未处理'
        };
        dataStore.warnings.list.unshift(newWarning);
        return newWarning;
      },

      handle: (id, note) => {
        const warning = dataStore.warnings.list.find(w => w.id === id);
        if (warning) {
          warning.status = '已处理';
          warning.handledAt = new Date().toLocaleString('zh-CN');
          warning.handleNote = note;
        }
      },

      // 生成模拟预警数据
      generateMock: (elderlyId) => {
        const types = ['血压异常', '心率偏高', '血氧偏低', '体温异常'];
        const levels = ['high', 'medium', 'low'];
        const warnings = [];

        for (let i = 0; i < 5; i++) {
          warnings.push({
            id: `W${Date.now()}_${i}`,
            elderlyId,
            type: types[Math.floor(Math.random() * types.length)],
            level: levels[Math.floor(Math.random() * levels.length)],
            desc: '监测到指标异常，请关注',
            time: new Date(Date.now() - i * 86400000).toLocaleString('zh-CN'),
            status: i < 2 ? '未处理' : '已处理',
            details: { value: '异常值', normalRange: '正常范围' }
          });
        }
        dataStore.warnings.list = [...warnings, ...dataStore.warnings.list];
        return warnings;
      }
    },

    // 服务预约方法
    services: {
      getAll: () => dataStore.services.list,

      getByElderlyId: (elderlyId) => {
        return dataStore.services.list.filter(s => s.elderlyId === elderlyId);
      },

      add: (service) => {
        const newService = {
          ...service,
          orderId: 'ORD' + Date.now(),
          status: '待确认（社区审核中）',
          createTime: new Date().toLocaleString('zh-CN')
        };
        dataStore.services.list.unshift(newService);
        return newService;
      },

      updateStatus: (orderId, status) => {
        const service = dataStore.services.list.find(s => s.orderId === orderId);
        if (service) {
          service.status = status;
        }
      },

      addEvaluation: (orderId, evaluation) => {
        const service = dataStore.services.list.find(s => s.orderId === orderId);
        if (service) {
          service.evaluation = evaluation;
        }
      }
    },

    // 重置数据
    reset: () => {
      dataStore.elderly.list = [];
      dataStore.elderly.current = null;
      dataStore.health.realtime = {};
      dataStore.warnings.list = [];
      dataStore.services.list = [];
      saveToStorage();
    }
  };
};

// 生成模拟健康数据
function generateMockHealthData() {
  return {
    heartRate: Math.floor(Math.random() * 20) + 65,
    bloodPressure: `${Math.floor(Math.random() * 30) + 120}/${Math.floor(Math.random() * 20) + 70}`,
    bloodOxygen: Math.floor(Math.random() * 5) + 95,
    bodyTemperature: (Math.random() * 0.5 + 36.2).toFixed(1),
    respirationRate: Math.floor(Math.random() * 6) + 14,
    bloodGlucose: (Math.random() * 2 + 4.5).toFixed(1),
    updateTime: new Date().toLocaleString('zh-CN'),
    deviceStatus: 'online'
  };
}

export default dataStore;
