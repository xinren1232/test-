/**
 * 数据格式化工具函数
 */

/**
 * 将不良率转换为百分比格式
 * @param {number} rate - 不良率（小数形式，如0.05表示5%）
 * @returns {string} - 百分比格式的不良率（如"5.0%"）
 */
export function formatDefectRate(rate) {
  if (rate === null || rate === undefined) return '0%';
  return (rate * 100).toFixed(1) + '%';
}

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} - 格式化后的日期时间（如"2025-07-15 16:30"）
 */
export function formatDateTime(dateTime) {
  if (!dateTime) return '';
  
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-');
}

/**
 * 处理内存数据中的不良率
 * @param {Array} data - 内存数据
 * @returns {Array} - 处理后的数据
 */
export function processDefectRates(data) {
  if (!Array.isArray(data)) return data;
  
  return data.map(item => {
    if (item.defectRate !== undefined) {
      item.defectRateFormatted = formatDefectRate(item.defectRate);
    }
    return item;
  });
}
