/**
 * 健康数据 Store
 * 管理所有健康相关的状态和操作
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useElderlyStore } from './elderlyStore';

// 健康指标配置
const HEALTH_INDICATORS = {
  heartRate: { name: '心率', unit: 'bpm', min: 60, max: 100, icon: 'heartbeat' },
  bloodPressure: { name: '血压', unit: 'mmHg', min: 90, max: 140, icon: 'activity' },
  bloodOxygen: { name: '血氧', unit: '%', min: 95, max: 100, icon: 'droplet' },
  bodyTemperature: { name: '体温', unit: '℃', min: 36.0, max: 37.3, icon: 'thermometer' },
  respirationRate: { name: '呼吸率', unit: '次/分', min: 12, max: 20, icon: 'wind' },
  bloodGlucose: { name: '血糖', unit: 'mmol/L', min: 3.9, max: 6.1, icon: 'droplet' }
};

export const useHealthStore = defineStore('health', () => {
  // ============ State ============
  const realtime = ref({}); // key为elderlyId
  const history = ref({});  // 历史数据
  const trends = ref({});   // 趋势数据
  const loading = ref(false);
  const lastUpdate = ref(null);

  // ============ Getters ============
  /**
   * 获取指定老人的健康数据
   */
  const getByElderlyId = computed(() => (elderlyId) => {
    return realtime.value[elderlyId] || generateDefaultHealthData();
  });

  /**
   * 当前选中老人的健康数据
   */
  const currentHealthData = computed(() => {
    const elderlyStore = useElderlyStore();
    const elderlyId = elderlyStore.currentElderlyId;
    return elderlyId ? getByElderlyId.value(elderlyId) : generateDefaultHealthData();
  });

  /**
   * 健康评分
   */
  const healthScore = computed(() => {
    const data = currentHealthData.value;
    let score = 85;

    if (data.heartRate >= 60 && data.heartRate <= 100) score += 3;
    if (data.bloodOxygen >= 95) score += 3;
    if (data.bloodPressure) {
      const [sys] = data.bloodPressure.split('/').map(Number);
      if (sys < 120) score += 4;
      else if (sys < 140) score += 2;
      else score -= 5;
    }
    if (data.bodyTemperature >= 36 && data.bodyTemperature <= 37.3) score += 2;
    if (data.respirationRate >= 12 && data.respirationRate <= 20) score += 2;

    return Math.min(100, Math.max(0, score));
  });

  /**
   * 健康状态等级
   */
  const healthStatus = computed(() => {
    const score = healthScore.value;
    if (score >= 90) return { level: 'excellent', text: '优秀', color: '#10b981' };
    if (score >= 80) return { level: 'good', text: '良好', color: '#3b82f6' };
    if (score >= 70) return { level: 'normal', text: '一般', color: '#f59e0b' };
    if (score >= 60) return { level: 'poor', text: '较差', color: '#f97316' };
    return { level: 'bad', text: '严重', color: '#ef4444' };
  });

  /**
   * 异常指标数量
   */
  const abnormalCount = computed(() => {
    const data = currentHealthData.value;
    let count = 0;

    if (data.heartRate < 60 || data.heartRate > 100) count++;
    if (data.bloodPressure) {
      const [sys, dia] = data.bloodPressure.split('/').map(Number);
      if (sys > 140 || dia > 90) count++;
    }
    if (data.bloodOxygen < 95) count++;
    if (data.bodyTemperature < 36 || data.bodyTemperature > 37.3) count++;
    if (data.respirationRate < 12 || data.respirationRate > 20) count++;
    if (data.bloodGlucose < 3.9 || data.bloodGlucose > 6.1) count++;

    return count;
  });

  /**
   * 正常指标数量
   */
  const normalCount = computed(() => 6 - abnormalCount.value);

  /**
   * 格式化的健康指标列表
   */
  const indicators = computed(() => {
    const data = currentHealthData.value;
    return Object.keys(HEALTH_INDICATORS).map(key => {
      const config = HEALTH_INDICATORS[key];
      const value = data[key];
      const status = getIndicatorStatus(key, value);

      return {
        key,
        name: config.name,
        value,
        unit: config.unit,
        icon: config.icon,
        status: status.level,
        statusText: status.text,
        isNormal: status.level === 'normal',
        trend: Math.floor(Math.random() * 3) - 1 // -1, 0, 1
      };
    });
  });

  // ============ Actions ============
  /**
   * 更新健康数据
   */
  const update = (elderlyId, data) => {
    realtime.value[elderlyId] = {
      ...realtime.value[elderlyId],
      ...data,
      updateTime: new Date().toLocaleString('zh-CN')
    };
    lastUpdate.value = new Date();

    // 同步更新老人的最后检查时间
    const elderlyStore = useElderlyStore();
    elderlyStore.updateLastCheck(elderlyId);
  };

  /**
   * 批量更新健康数据
   */
  const batchUpdate = (updates) => {
    updates.forEach(({ elderlyId, data }) => {
      update(elderlyId, data);
    });
  };

  /**
   * 获取指标状态
   */
  const getIndicatorStatus = (type, value) => {
    const config = HEALTH_INDICATORS[type];
    if (!config) return { level: 'normal', text: '正常' };

    if (type === 'bloodPressure') {
      if (!value) return { level: 'normal', text: '正常' };
      const [sys] = value.split('/').map(Number);
      if (sys < 120) return { level: 'normal', text: '正常' };
      if (sys < 140) return { level: 'warning', text: '偏高' };
      return { level: 'danger', text: '异常' };
    }

    if (value < config.min) return { level: value < config.min * 0.9 ? 'danger' : 'warning', text: '偏低' };
    if (value > config.max) return { level: value > config.max * 1.1 ? 'danger' : 'warning', text: '偏高' };
    return { level: 'normal', text: '正常' };
  };

  /**
   * 设置趋势数据
   */
  const setTrends = (elderlyId, type, data) => {
    if (!trends.value[elderlyId]) trends.value[elderlyId] = {};
    trends.value[elderlyId][type] = data;
  };

  /**
   * 获取趋势数据
   */
  const getTrends = (elderlyId, type) => {
    return trends.value[elderlyId]?.[type] || { dates: [], values: [] };
  };

  /**
   * 清空数据
   */
  const reset = () => {
    realtime.value = {};
    history.value = {};
    trends.value = {};
    lastUpdate.value = null;
  };

  return {
    // State
    realtime,
    history,
    trends,
    loading,
    lastUpdate,

    // Getters
    getByElderlyId,
    currentHealthData,
    healthScore,
    healthStatus,
    abnormalCount,
    normalCount,
    indicators,

    // Actions
    update,
    batchUpdate,
    getIndicatorStatus,
    setTrends,
    getTrends,
    reset
  };
});

/**
 * 生成默认健康数据
 */
function generateDefaultHealthData() {
  return {
    heartRate: 75,
    bloodPressure: '135/85',
    bloodOxygen: 98,
    bodyTemperature: 36.5,
    respirationRate: 16,
    bloodGlucose: 5.2,
    updateTime: new Date().toLocaleString('zh-CN'),
    deviceStatus: 'online'
  };
}
