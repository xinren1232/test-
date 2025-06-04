/**
 * IQE物料分类定义
 */
export const materialCategories = [
  {
    id: 1,
    name: '电子元件',
    description: '各类电子元器件，包括电阻、电容、IC等'
  },
  {
    id: 2,
    name: '结构件',
    description: '产品结构和外观相关部件'
  },
  {
    id: 3,
    name: '晶片类',
    description: '液晶显示屏、触控面板等晶片类物料'
  },
  {
    id: 4,
    name: 'CAM/FP/电声组件',
    description: '摄像头模组、指纹模组和扬声器等电声组件'
  },
  {
    id: 5,
    name: '连接器',
    description: '各类连接器和接插件'
  },
  {
    id: 6,
    name: '电池/电源',
    description: '电池和电源管理组件'
  },
  {
    id: 7,
    name: '辅料/包材',
    description: '辅助材料和包装材料'
  },
  {
    id: 8,
    name: '其他',
    description: '其他类别物料'
  }
]

/**
 * 根据物料编码获取物料类别
 * @param {string} materialCode 物料编码
 * @returns {Object|null} 物料类别信息
 */
export function getMaterialCategory(materialCode) {
  if (!materialCode) return null
  
  // 简单匹配规则，实际应根据编码规则修改
  const categoryCode = materialCode.substring(1, 3)
  const categoryMap = {
    '10': 1, // 电子元件
    '20': 2, // 结构件-量产管理
    '30': 3, // 结构件项目质量管理
    '40': 4, // 晶片类
    '50': 5  // CAM/FP/电声/安规/包材物料组
  }
  
  const categoryId = categoryMap[categoryCode]
  if (!categoryId) return null
  
  return materialCategories.find(category => category.id === categoryId)
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
  if (riskFactor >= 75) return 'high'
  if (riskFactor >= 45) return 'medium'
  return 'low'
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
    5: { sampleRate: 0.2, keyItems: ['成像质量', '识别准确度', '音频质量'] }
  }
  
  return configs[id] || { sampleRate: 0.1, keyItems: [] }
} 
 
 