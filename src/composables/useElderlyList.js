/**
 * 老人列表管理 Composable
 * 封装老人列表相关的状态和逻辑
 */
import { ref } from 'vue';
import { getFamilyElderlyList } from '../api/auth';
import { getErrorFromException, ELDERLY_LIST_ERRORS } from '../constants/errorMessages';

/**
 * 使用老人列表管理
 * @returns {Object} 包含 elderlyList, isLoading, errorMessage, fetchElderlyList
 */
export function useElderlyList() {
  // 响应式状态
  const elderlyList = ref([]);
  const isLoading = ref(true);
  const errorMessage = ref('');

  // 获取家属关联的老人列表
  const fetchElderlyList = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = '';
      const response = await getFamilyElderlyList();
      elderlyList.value = response.list || [];
    } catch (error) {
      errorMessage.value = getErrorFromException(error, ELDERLY_LIST_ERRORS);
      console.error('获取老人列表失败：', error);
    } finally {
      isLoading.value = false;
    }
  };

  // 初始化时获取数据
  fetchElderlyList();

  // 返回状态和方法
  return {
    elderlyList,
    isLoading,
    errorMessage,
    fetchElderlyList
  };
}
