/**
 * Store 入口文件
 * 统一导出所有 Pinia stores
 */
import { createPinia } from 'pinia';

// 创建 Pinia 实例
export const pinia = createPinia();

// 导出各个 store
export { useElderlyStore } from './elderlyStore';
export { useHealthStore } from './healthStore';
export { useWarningStore } from './warningStore';
export { useServiceStore } from './serviceStore';
export { useUIStore } from './uiStore';

export default pinia;
