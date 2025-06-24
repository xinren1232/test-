/**
 * 物料保质期规范
 * 定义不同类型物料的保质期规则
 */

// 物料类别默认保质期（单位：月）
const CATEGORY_SHELF_LIFE = {
  '电子元件': 24,
  '结构件': 36,
  '晶片类': 12,
  'CAM/FP/电声组件': 18,
  '连接器': 36,
  '电池/电源': 12,
  '辅料/包材': 36,
  '其他': 24, // 未指定类别的默认值
  '默认': 24 // 未指定类别的默认值
};

// 特定物料保质期（单位：月）- 优先级高于类别
const MATERIAL_SHELF_LIFE = {
  // 结构件
  '手机壳料-后盖': 24,
  '手机壳料-中框': 24,
  '手机卡托': 36,
  '侧键': 36,
  '五金小件': 36,
  '装饰件': 36,
  '保护套': 24,
  '硅胶套': 24,
  
  // 电子元件
  'PCB主板': 12,
  'FPC软板': 12,
  '贴片电阻': 24,
  '贴片电容': 24,
  '贴片电感': 24,
  '贴片二极管': 24,
  '贴片三极管': 24,
  '贴片IC': 12,
  
  // 晶片类
  'LCD屏幕': 12,
  'OLED屏幕': 6,
  
  // CAM/FP/电声组件
  'CAM摄像头模组': 12,
  'FP指纹模组': 12,
  '电声(喇叭/听筒)': 24,
  
  // 电池/电源
  '电池': 6,
  '充电器': 24,
  
  // 辅料/包材
  '包材(彩盒/泡棉等)': 36,
  '辅料类(泡棉/标签)': 12,
  '后摄镜片': 36
};

// 物料状态对保质期的影响
const MATERIAL_STATUS_FACTORS = {
  '正常': 1.0,  // 正常状态，不影响保质期
  '风险': 0.8,  // 风险状态，保质期缩短为原来的80%
  '冻结': 0.0,  // 冻结状态，视为已过期
  '默认': 1.0   // 默认状态
};

// 物料规格对保质期的影响系数
const SPECIFICATION_FACTORS = {
  // 结构件规格
  '标准': 1.0,
  '定制': 0.9,
  '特殊': 0.85,
  
  // 电子元件规格
  '0402': 0.9,  // 小规格电阻电容保质期略短
  '0603': 0.95,
  '0805': 1.0,
  '1206': 1.0,
  
  // 晶片类规格
  '小尺寸': 1.0,
  '中尺寸': 0.95,
  '大尺寸': 0.9,
  
  // 电池规格
  '小容量': 1.0,
  '中容量': 0.95,
  '大容量': 0.9,
  
  // 包材规格
  '标准包装': 1.0,
  '定制包装': 0.9,
  '礼品包装': 0.85,
  
  // 默认
  '默认': 1.0
};

// 存储环境对保质期的影响系数
const STORAGE_ENVIRONMENT_FACTORS = {
  '常温': 1.0,      // 标准环境
  '恒温': 1.2,      // 温度受控环境
  '低温': 1.5,      // 低温环境
  '防潮': 1.3,      // 防潮环境
  '真空': 1.4,      // 真空包装
  '氮气保护': 1.5,  // 氮气保护环境
  '默认': 1.0       // 默认环境
};

/**
 * 计算物料的保质期（月）
 * @param {Object} material 物料信息
 * @param {string} status 物料状态
 * @param {string} environment 存储环境
 * @returns {number} 保质期（月）
 */
function calculateShelfLife(material, status = '正常', environment = '常温') {
  // 1. 获取基础保质期
  let baseShelfLife;
  
  // 首先检查是否有特定物料的保质期设置
  if (material.name && MATERIAL_SHELF_LIFE[material.name]) {
    baseShelfLife = MATERIAL_SHELF_LIFE[material.name];
  } 
  // 其次检查物料类别的保质期设置
  else if (material.category && CATEGORY_SHELF_LIFE[material.category]) {
    baseShelfLife = CATEGORY_SHELF_LIFE[material.category];
  }
  // 最后使用默认值
  else {
    baseShelfLife = CATEGORY_SHELF_LIFE['默认'];
  }
  
  // 2. 应用物料状态因子
  const statusFactor = MATERIAL_STATUS_FACTORS[status] || MATERIAL_STATUS_FACTORS['默认'];
  
  // 3. 应用存储环境因子
  const envFactor = STORAGE_ENVIRONMENT_FACTORS[environment] || STORAGE_ENVIRONMENT_FACTORS['默认'];
  
  // 4. 计算最终保质期（向下取整）
  const finalShelfLife = Math.floor(baseShelfLife * statusFactor * envFactor);
  
  return finalShelfLife;
}

/**
 * 计算物料到期日期
 * @param {Date|string} manufactureDate 生产日期
 * @param {number} shelfLifeMonths 保质期（月）
 * @returns {Date} 到期日期
 */
function calculateExpiryDate(manufactureDate, shelfLifeMonths) {
  const mDate = manufactureDate instanceof Date ? manufactureDate : new Date(manufactureDate);
  const expiryDate = new Date(mDate);
  expiryDate.setMonth(expiryDate.getMonth() + shelfLifeMonths);
  return expiryDate;
}

/**
 * 检查物料是否过期
 * @param {Date|string} expiryDate 到期日期
 * @param {Date} [checkDate=new Date()] 检查日期，默认为当前日期
 * @returns {boolean} 是否过期
 */
function isExpired(expiryDate, checkDate = new Date()) {
  const eDate = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  return eDate < checkDate;
}

/**
 * 计算物料剩余保质期（天）
 * @param {Date|string} expiryDate 到期日期
 * @param {Date} [checkDate=new Date()] 检查日期，默认为当前日期
 * @returns {number} 剩余天数，负数表示已过期
 */
function getRemainingDays(expiryDate, checkDate = new Date()) {
  const eDate = expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
  const diffTime = eDate.getTime() - checkDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取保质期状态描述
 * @param {number} remainingDays 剩余天数
 * @returns {Object} 状态对象，包含状态码和描述
 */
function getShelfLifeStatus(remainingDays) {
  if (remainingDays < 0) {
    return { code: 'expired', label: '已过期', type: 'danger' };
  } else if (remainingDays < 30) {
    return { code: 'critical', label: '即将过期', type: 'warning' };
  } else if (remainingDays < 90) {
    return { code: 'warning', label: '需关注', type: 'warning' };
  } else {
    return { code: 'normal', label: '正常', type: 'success' };
  }
}

/**
 * 获取物料状态分布比例
 * @returns {Object} 状态分布比例
 */
function getMaterialStatusDistribution() {
  return {
    '正常': 0.7,  // 70%的物料处于正常状态
    '风险': 0.2,  // 20%的物料处于风险状态
    '冻结': 0.1   // 10%的物料处于冻结状态
  };
}

/**
 * 获取批次号格式规范
 * @returns {Object} 批次号格式规范
 */
function getBatchNumberFormat() {
  return {
    pattern: /^\d{6}$/,  // 6位数字
    min: 100000,         // 最小值
    max: 999999,         // 最大值
    validate: function(batchNumber) {
      return this.pattern.test(batchNumber) && 
             parseInt(batchNumber) >= this.min && 
             parseInt(batchNumber) <= this.max;
    },
    generate: function() {
      return Math.floor(this.min + Math.random() * (this.max - this.min + 1)).toString();
    }
  };
}

/**
 * 获取有效的日期范围
 * @returns {Object} 日期范围对象
 */
function getValidDateRange() {
  return {
    min: new Date('2024-01-01'),
    max: new Date('2025-05-31'),
    validate: function(date) {
      const checkDate = date instanceof Date ? date : new Date(date);
      return checkDate >= this.min && checkDate <= this.max;
    },
    generateRandom: function() {
      const timeDiff = this.max.getTime() - this.min.getTime();
      const randomTime = Math.random() * timeDiff;
      return new Date(this.min.getTime() + randomTime);
    }
  };
}

export {
  CATEGORY_SHELF_LIFE,
  MATERIAL_SHELF_LIFE,
  MATERIAL_STATUS_FACTORS,
  SPECIFICATION_FACTORS,
  STORAGE_ENVIRONMENT_FACTORS,
  calculateShelfLife,
  calculateExpiryDate,
  isExpired,
  getRemainingDays,
  getShelfLifeStatus,
  getMaterialStatusDistribution,
  getBatchNumberFormat,
  getValidDateRange
};

export default {
  calculateShelfLife,
  calculateExpiryDate,
  isExpired,
  getRemainingDays,
  getShelfLifeStatus,
  getMaterialStatusDistribution,
  getBatchNumberFormat,
  getValidDateRange
}; 