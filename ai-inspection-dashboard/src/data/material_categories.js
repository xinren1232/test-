/**
 * IQE物料分类定义
 * 符合数据规则文档要求的物料分类体系
 */
export const materialCategories = [
  {
    id: 1,
    name: '电子元件',
    description: '各类电子元器件，包括电阻、电容、IC等',
    risk_level: 'medium'
  },
  {
    id: 2,
    name: '结构件',
    description: '产品结构和外观相关部件',
    risk_level: 'low'
  },
  {
    id: 3,
    name: '晶片类',
    description: '液晶显示屏、触控面板等晶片类物料',
    risk_level: 'high'
  },
  {
    id: 4,
    name: 'CAM/FP/电声组件',
    description: '摄像头模组、指纹模组和扬声器等电声组件',
    risk_level: 'medium'
  },
  {
    id: 5,
    name: '连接器',
    description: '各类连接器和接插件',
    risk_level: 'low'
  },
  {
    id: 6,
    name: '电池/电源',
    description: '电池和电源管理组件',
    risk_level: 'high'
  },
  {
    id: 7,
    name: '辅料/包材',
    description: '辅助材料和包装材料',
    risk_level: 'low'
  },
  {
    id: 8,
    name: '其他',
    description: '其他类别物料',
    risk_level: 'low'
  }
];

// 物料编码规则
export const MATERIAL_CODE_RULES = {
  prefix: {
    1: 'E', // 电子元件
    2: 'S', // 结构件
    3: 'D', // 晶片类
    4: 'M', // CAM/FP/电声组件
    5: 'C', // 连接器
    6: 'B', // 电池/电源
    7: 'P', // 辅料/包材
    8: 'O'  // 其他
  },
  pattern: /^[A-Z]{1,2}\d{4,6}$/, // 1-2位字母+4-6位数字
  validate: function(code) {
    return this.pattern.test(code);
  }
};

/**
 * 根据物料编码获取物料类别
 * @param {string} materialCode 物料编码
 * @returns {Object|null} 物料类别信息
 */
export function getMaterialCategory(materialCode) {
  if (!materialCode || !MATERIAL_CODE_RULES.validate(materialCode)) return null;
  
  // 从编码中提取类别前缀
  const prefix = materialCode.charAt(0);
  
  // 查找对应的类别ID
  const categoryId = Object.keys(MATERIAL_CODE_RULES.prefix).find(
    id => MATERIAL_CODE_RULES.prefix[id] === prefix
  );
  
  if (!categoryId) return null;
  
  return materialCategories.find(category => category.id === parseInt(categoryId));
}

/**
 * 根据ID获取物料类别名称
 * @param {number} id 类别ID
 * @returns {string} 类别名称
 */
export function getCategoryName(categoryId) {
  const category = materialCategories.find(cat => cat.id === categoryId);
  return category ? category.name : '未知分类';
}

/**
 * 根据ID获取物料类别描述
 * @param {number} id 类别ID
 * @returns {string} 类别描述
 */
export function getCategoryDescription(categoryId) {
  const category = materialCategories.find(cat => cat.id === categoryId);
  return category ? category.description : '';
}

/**
 * 获取所有物料类别
 * @returns {Array} 所有类别数组
 */
export function getAllCategories() {
  return materialCategories;
}

/**
 * 根据名称获取物料类别
 * @param {string} name 类别名称
 * @returns {Object|null} 物料类别信息
 */
export function getCategoryByName(name) {
  return materialCategories.find(cat => cat.name === name);
}

/**
 * 根据风险因子获取风险等级
 * @param {number} riskFactor 风险因子 (0-100)
 * @returns {string} 风险等级
 */
export function getRiskLevel(riskFactor) {
  if (riskFactor >= 75) return 'high';
  if (riskFactor >= 45) return 'medium';
  return 'low';
}

/**
 * 获取类别检验配置
 * @param {number} id 类别ID
 * @returns {Object} 检验配置
 */
export function getCategoryInspectionConfig(id) {
  // 每个类别的默认检验配置
  const configs = {
    1: { sampleRate: 0.1, keyItems: ['电气性能', '焊接可靠性'] },
    2: { sampleRate: 0.2, keyItems: ['外观', '尺寸'] },
    3: { sampleRate: 0.5, keyItems: ['外观', '尺寸', '材质'] },
    4: { sampleRate: 0.3, keyItems: ['显示均匀性', '亮度', '色彩'] },
    5: { sampleRate: 0.2, keyItems: ['成像质量', '识别准确度', '音频质量'] },
    6: { sampleRate: 0.4, keyItems: ['容量', '循环寿命', '安全性能'] },
    7: { sampleRate: 0.1, keyItems: ['外观', '尺寸', '印刷质量'] },
    8: { sampleRate: 0.2, keyItems: ['功能测试'] }
  };
  
  return configs[id] || { sampleRate: 0.1, keyItems: [] };
} 
 
/**
 * 生成符合规则的物料编码
 * @param {number} categoryId 物料类别ID
 * @param {number} serialNumber 序列号
 * @returns {string} 物料编码
 */
export function generateMaterialCode(categoryId, serialNumber) {
  if (!categoryId || !MATERIAL_CODE_RULES.prefix[categoryId]) {
    return null;
  }
  
  // 确保序列号在有效范围内
  const validSerial = Math.max(0, Math.min(999999, serialNumber));
  
  // 生成编码：前缀 + 4-6位序列号(补0)
  // 根据序列号大小自动生成4-6位数字
  let serialDigits = String(validSerial);
  if (serialDigits.length < 4) {
    serialDigits = serialDigits.padStart(4, '0');
  }
  
  return MATERIAL_CODE_RULES.prefix[categoryId] + serialDigits;
}

export default {
  materialCategories,
  MATERIAL_CODE_RULES,
  getMaterialCategory,
  getCategoryName,
  getCategoryDescription,
  getAllCategories,
  getCategoryByName,
  getRiskLevel,
  getCategoryInspectionConfig,
  generateMaterialCode
}; 