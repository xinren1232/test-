
/**
 * 场景字段映射配置
 */

// 库存场景字段
const INVENTORY_FIELDS = [
  '工厂', '仓库', '物料编码', '物料名称', '供应商', 
  '数量', '状态', '入库时间', '到期时间', '备注'
];

// 上线场景字段
const ONLINE_FIELDS = [
  '工厂', '基线', '项目', '物料编码', '物料名称', '供应商', 
  '批次号', '不良率', '本周异常', '检验日期', '备注'
];

// 测试场景字段
const TESTING_FIELDS = [
  '测试编号', '日期', '项目', '基线', '物料编码', '数量', 
  '物料名称', '供应商', '测试结果', '不合格描述', '备注'
];

// 批次管理场景字段
const BATCH_FIELDS = [
  '批次号', '物料编码', '物料名称', '供应商', '数量', 
  '入库日期', '产线异常', '测试异常', '备注'
];

/**
 * 格式化库存数据为标准字段
 * @param {Array} data - 原始库存数据
 * @returns {Array} - 格式化后的数据
 */
function formatInventoryData(data) {
  return data.map(item => ({
    '工厂': item.factory || '',
    '仓库': item.storage_location || item.warehouse || '',
    '物料编码': item.materialCode || '',
    '物料名称': item.materialName || '',
    '供应商': item.supplier || '',
    '数量': item.quantity || 0,
    '状态': item.status || '',
    '入库时间': formatDateTime(item.inboundTime),
    '到期时间': formatDateTime(item.lastUpdateTime),
    '备注': item.notes || (item.materialName + '库存记录')
  }));
}

/**
 * 格式化上线数据为标准字段
 * @param {Array} data - 原始上线数据
 * @returns {Array} - 格式化后的数据
 */
function formatOnlineData(data) {
  return data.map(item => ({
    '工厂': item.factory || '',
    '基线': item.baselineId || '',
    '项目': item.projectId || '',
    '物料编码': item.materialCode || '',
    '物料名称': item.materialName || '',
    '供应商': item.supplier || '',
    '批次号': item.batchNo || '',
    '不良率': formatDefectRate(item.defectRate),
    '本周异常': generateWeeklyAbnormal(),
    '检验日期': formatDateTime(item.onlineTime),
    '备注': item.notes || (item.materialName + '上线记录')
  }));
}

/**
 * 格式化测试数据为标准字段
 * @param {Array} data - 原始测试数据
 * @returns {Array} - 格式化后的数据
 */
function formatTestingData(data) {
  return data.map(item => ({
    '测试编号': item.id || '',
    '日期': formatDateTime(item.testDate),
    '项目': item.projectId || '',
    '基线': item.baselineId || '',
    '物料编码': item.materialCode || '',
    '数量': item.quantity || generateRandomQuantity(),
    '物料名称': item.materialName || '',
    '供应商': item.supplier || '',
    '测试结果': item.testResult === '合格' ? '合格' : '不合格',
    '不合格描述': item.testResult === '合格' ? '' : (item.defectDesc || '质量不符合要求'),
    '备注': item.notes || (item.materialName + '测试记录')
  }));
}

/**
 * 格式化批次数据为标准字段
 * @param {Array} data - 原始数据（可以是库存、测试或上线数据）
 * @returns {Array} - 格式化后的数据
 */
function formatBatchData(data) {
  return data.map(item => ({
    '批次号': item.batchNo || '',
    '物料编码': item.materialCode || '',
    '物料名称': item.materialName || '',
    '供应商': item.supplier || '',
    '数量': item.quantity || 0,
    '入库日期': formatDateTime(item.inboundTime || item.testDate || item.onlineTime),
    '产线异常': generateProductionAbnormal(),
    '测试异常': generateTestAbnormal(),
    '备注': item.notes || (item.materialName + '批次记录')
  }));
}

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} - 格式化后的日期时间
 */
function formatDateTime(dateTime) {
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
 * 格式化不良率为百分比
 * @param {number} rate - 不良率
 * @returns {string} - 百分比格式
 */
function formatDefectRate(rate) {
  if (rate === null || rate === undefined) return '0%';
  return (rate * 100).toFixed(1) + '%';
}

/**
 * 生成本周异常
 * @returns {string} - 异常描述
 */
function generateWeeklyAbnormal() {
  const abnormals = ['无', '轻微异常', '质量异常', '工艺异常', '设备异常'];
  return abnormals[Math.floor(Math.random() * abnormals.length)];
}

/**
 * 生成产线异常
 * @returns {string} - 异常描述
 */
function generateProductionAbnormal() {
  const abnormals = ['无', '设备故障', '工艺偏差', '人员操作', '环境因素'];
  return abnormals[Math.floor(Math.random() * abnormals.length)];
}

/**
 * 生成测试异常
 * @returns {string} - 异常描述
 */
function generateTestAbnormal() {
  const abnormals = ['无', '参数超标', '外观不良', '功能异常', '性能不达标'];
  return abnormals[Math.floor(Math.random() * abnormals.length)];
}

/**
 * 生成随机数量
 * @returns {number} - 随机数量
 */
function generateRandomQuantity() {
  return Math.floor(Math.random() * 500) + 50;
}

export {
  INVENTORY_FIELDS,
  ONLINE_FIELDS,
  TESTING_FIELDS,
  BATCH_FIELDS,
  formatInventoryData,
  formatOnlineData,
  formatTestingData,
  formatBatchData,
  formatDateTime,
  formatDefectRate
};
