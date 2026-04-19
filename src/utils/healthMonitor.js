/**
 * 健康监控循环工具
 * 用于定期获取硬件数据并调用 AI 算法进行异常检测
 */
import { getRealTimeHealth, checkHealthAnomaly } from '@/api/health';
import { useWarningStore } from '@/stores/warningStore';

/**
 * 监控健康数据的心跳函数
 * @param {string} elderlyId - 老人ID
 * @param {Function} onAiResult - AI检测结果回调（可选）
 */
export const monitorHealthLoop = async (elderlyId, onAiResult) => {
  const warningStore = useWarningStore();

  try {
    // 1. 获取硬件最新数据 (目前是 health.js 里生成的模拟硬件数据)
    const realtimeData = await getRealTimeHealth(elderlyId);

    // 提取高压用于输入算法
    const sysBp = parseFloat(realtimeData.bloodPressure.split('/')[0]);

    // 2. 将数据送入 Python 的 MIRMAD 算法接口
    const aiResult = await checkHealthAnomaly({
      elderlyId: elderlyId,
      bloodOxygen: realtimeData.bloodOxygen,
      heartRate: realtimeData.heartRate,
      bloodPressureSys: sysBp
    });

    // 如果有回调，传递 AI 结果
    if (onAiResult && aiResult) {
      onAiResult(aiResult);
    }

    // 3. 算法判定：如果不健康 (is_anomaly === true)，直接生成系统预警！
    if (aiResult && aiResult.code === 200 && aiResult.data.is_anomaly) {

      const aiData = aiResult.data;

      // 调用 warningStore 中已有的 add 方法，将 AI 的智慧结论渲染到页面
      warningStore.add({
        elderlyId: elderlyId,
        type: '多维联合异常 (AI判定)', // 区别于传统的单点超标报警
        level: aiData.level, // high 或 medium
        desc: `AI 深度分析判定：${aiData.status}。高维空间游离分数已达 ${aiData.details['游离分数']}，请立即关注。`,
        details: aiData.details
      });
    }

    return {
      realtimeData,
      aiResult
    };

  } catch (error) {
    console.error('健康监控循环出错:', error);
    return null;
  }
};

/**
 * 启动定期健康监控
 * @param {string} elderlyId - 老人ID
 * @param {number} intervalMs - 监控间隔（毫秒），默认 10000ms (10秒)
 * @param {Function} onAiResult - AI检测结果回调（可选）
 * @returns {Object} { stop: Function } - 返回停止函数
 */
export const startHealthMonitor = (elderlyId, intervalMs = 10000, onAiResult) => {
  let timerId = null;

  // 立即执行一次
  monitorHealthLoop(elderlyId, onAiResult);

  // 启动定时轮询
  timerId = setInterval(() => {
    monitorHealthLoop(elderlyId, onAiResult);
  }, intervalMs);

  // 返回停止函数
  return {
    stop: () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  };
};
