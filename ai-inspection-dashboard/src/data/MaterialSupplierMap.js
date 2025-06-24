/**
 * 物料-供应商映射数据
 * 包含物料基本信息、供应商列表和常见不良类型
 * 根据图二更新的物料和不良类型对应关系
 * 
 * 注意：此文件已重置，保留基本结构，等待新的数据管理设计实现
 */

// 物料-供应商映射 - 根据表格更新
const materialSupplierMap = [
  // 结构件类
  {
    name: '电池盖',
    category: '结构件类',
    code_prefix: 'CS-B',
    unit: '片',
    suppliers: ['聚龙', '欣冠', '广正'],
    defectTypes: ["划伤", "变形", "破裂", "起鼓", "色差", "尺寸异常"]
  },
  {
    name: '中框',
    category: '结构件类',
    code_prefix: 'CS-M',
    unit: '个',
    suppliers: ['聚龙', '欣冠', '广正'],
    defectTypes: ["变形", "破裂", "掉漆", "尺寸异常"]
  },
  {
    name: '手机卡托',
    category: '结构件类',
    code_prefix: 'SIM',
    unit: '个',
    suppliers: ['聚龙', '欣冠', '广正'],
    defectTypes: ["注塑不良", "尺寸异常", "断裂", "毛刺"]
  },
  {
    name: '侧键',
    category: '结构件类',
    code_prefix: 'KEY',
    unit: '个',
    suppliers: ['聚龙', '欣冠', '广正'],
    defectTypes: ["脱落", "卡键", "尺寸异常", "松动"]
  },
  {
    name: '装饰件',
    category: '结构件类',
    code_prefix: 'DEC',
    unit: '个',
    suppliers: ['聚龙', '欣冠', '广正'],
    defectTypes: ["掉色", "偏位", "脱落"]
  },
  
  // 显示与光学类
  {
    name: 'LCD显示屏',
    category: '光学类',
    code_prefix: 'DS-L',
    unit: '片',
    suppliers: ['天马', 'BOE'],
    defectTypes: ["漏光", "暗点", "偏色", "亮晶"]
  },
  {
    name: 'OLED显示屏',
    category: '光学类',
    code_prefix: 'DS-O',
    unit: '片',
    suppliers: ['BOE', '天马', '华星'],
    defectTypes: ["闪屏", "mura", "亮点", "亮线"]
  },
  {
    name: '摄像头(CAM)',
    category: '光学类',
    code_prefix: 'CAM',
    unit: '个',
    suppliers: ['盛泰', '天实', '深奥'],
    defectTypes: ["刮花", "底座破裂", "脏污", "无法拍照"]
  },

  // 电池与充电类
  {
    name: '电池',
    category: '充电类',
    code_prefix: 'BAT',
    unit: '块',
    suppliers: ['百佳达', '奥海', '辉阳'],
    defectTypes: ["起鼓", "鼓包", "漏液", "电压不稳定"]
  },
  {
    name: '充电器',
    category: '充电类',
    code_prefix: 'CHG',
    unit: '个',
    suppliers: ['理威', '风华', '维科'],
    defectTypes: ["无法充电", "外壳破裂", "输出功率异常", "发热异常"]
  },

  // 声学与音频类
  {
    name: '喇叭',
    category: '声学类',
    code_prefix: 'SPK',
    unit: '个',
    suppliers: ['东声', '瑞声', '歌尔'],
    defectTypes: ["无声", "杂音", "音量小", "破裂"]
  },
  {
    name: '听筒',
    category: '声学类',
    code_prefix: 'REC',
    unit: '个',
    suppliers: ['东声', '瑞声', '歌尔'],
    defectTypes: ["无声", "杂音", "音量小", "破裂"]
  },

  // 包装与辅料类
  {
    name: '保护套',
    category: '包材类',
    code_prefix: 'CASE',
    unit: '个',
    suppliers: ['丽德宝', '怡同', '富群'],
    defectTypes: ["尺寸偏差", "发黄", "开孔错位", "模具压痕"]
  },
  {
    name: '标签',
    category: '包材类',
    code_prefix: 'LABEL',
    unit: '个',
    suppliers: ['丽德宝', '怡同', '富群'],
    defectTypes: ["脱落", "错印", "logo错误", "尺寸异常"]
  },
  {
    name: '包装盒',
    category: '包材类',
    code_prefix: 'BOX',
    unit: '个',
    suppliers: ['丽德宝', '怡同', '富群'],
    defectTypes: ["破损", "logo错误", "错印"]
  }
];

/**
 * 获取所有物料数据
 * @returns {Array} 物料数据数组
 */
export function getAllMaterials() {
  return materialSupplierMap;
}

/**
 * 根据物料类别获取物料
 * @param {string} category 物料类别
 * @returns {Array} 符合类别的物料数组
 */
export function getMaterialsByCategory(category) {
  if (!category) return materialSupplierMap;
  return materialSupplierMap.filter(material => material.category === category);
}

/**
 * 根据供应商获取物料
 * @param {string} supplier 供应商名称
 * @returns {Array} 符合供应商的物料数组
 */
export function getMaterialsBySupplier(supplier) {
  if (!supplier) return materialSupplierMap;
  return materialSupplierMap.filter(material => 
    material.suppliers && material.suppliers.includes(supplier)
  );
}

/**
 * 获取所有物料类别
 * @returns {Array} 物料类别数组
 */
export function getAllCategories() {
  const categories = new Set(materialSupplierMap.map(material => material.category));
  return [...categories];
}

/**
 * 获取所有供应商
 * @returns {Array} 供应商数组
 */
export function getAllSuppliers() {
  const suppliers = new Set();
  materialSupplierMap.forEach(material => {
    if (material.suppliers) {
      material.suppliers.forEach(supplier => suppliers.add(supplier));
    }
  });
  return [...suppliers];
}

/**
 * 获取物料的随机供应商
 * @param {string} materialName 物料名称
 * @returns {string} 随机供应商名称
 */
export function getRandomSupplierForMaterial(materialName) {
  const material = materialSupplierMap.find(m => m.name === materialName);
  if (!material || !material.suppliers || material.suppliers.length === 0) {
    return '未知供应商';
  }
  return material.suppliers[Math.floor(Math.random() * material.suppliers.length)];
}

/**
 * 获取物料的所有供应商
 * @param {string} materialName 物料名称
 * @returns {Array} 供应商数组
 */
export function getSuppliersForMaterial(materialName) {
  const material = materialSupplierMap.find(m => m.name === materialName);
  if (!material || !material.suppliers) {
    return [];
  }
  return material.suppliers;
} 

export default {
  getAllMaterials,
  getMaterialsByCategory,
  getMaterialsBySupplier,
  getAllCategories,
  getAllSuppliers,
  getRandomSupplierForMaterial,
  getSuppliersForMaterial
}; 