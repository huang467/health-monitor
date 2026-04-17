/**
 * 错误消息常量
 * 统一管理应用中的错误提示信息
 */

/**
 * 老人列表相关错误
 */
export const ELDERLY_LIST_ERRORS = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  SERVER_ERROR: '服务器异常，请稍后重试',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  PERMISSION_ERROR: '权限不足，请登录后重试',
  DEFAULT_ERROR: '获取老人列表失败，请稍后重试'
};

/**
 * 登录相关错误
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: '用户名或密码错误',
  ACCOUNT_LOCKED: '账户已被锁定，请联系管理员',
  ACCOUNT_DISABLED: '账户已被禁用',
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  DEFAULT_ERROR: '登录失败，请稍后重试'
};

/**
 * 数据操作相关错误
 */
export const DATA_ERRORS = {
  SAVE_FAILED: '保存数据失败',
  LOAD_FAILED: '加载数据失败',
  INVALID_DATA: '数据格式错误',
  DEFAULT_ERROR: '数据操作失败，请稍后重试'
};

/**
 * 根据错误类型获取错误消息
 * @param {string} errorType - 错误类型
 * @param {Object} errorMap - 错误映射对象
 * @param {string} customMessage - 自定义错误消息
 * @returns {string} 错误消息
 */
export function getErrorMessage(errorType, errorMap, customMessage = null) {
  if (customMessage) {
    return customMessage;
  }
  return errorMap[errorType] || errorMap.DEFAULT_ERROR || '操作失败，请稍后重试';
}

/**
 * 根据错误对象获取错误消息
 * @param {Error} error - 错误对象
 * @param {Object} errorMap - 错误映射对象
 * @returns {string} 错误消息
 */
export function getErrorFromException(error, errorMap) {
  if (!error) {
    return errorMap?.DEFAULT_ERROR || '未知错误';
  }

  // 如果错误对象有 message 属性，直接返回
  if (error.message) {
    return error.message;
  }

  // 如果是网络错误
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    return errorMap?.NETWORK_ERROR || errorMap?.DEFAULT_ERROR;
  }

  // 默认返回通用错误消息
  return errorMap?.DEFAULT_ERROR || '操作失败，请稍后重试';
}
