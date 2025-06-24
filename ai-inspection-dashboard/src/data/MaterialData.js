/**
 * 物料数据定义
 * 包含物料分类、供应商映射和缺陷定义
 */

// 物料分类定义
export const materialCategories = {
  "结构件类": ["电池盖", "中框", "手机卡托", "侧键", "装饰件"],
  "光学类": ["LCD显示屏", "OLED显示屏", "摄像头模组"],
  "充电类": ["电池", "充电器"],
  "声学类": ["扬声器", "听筒"],
  "包料类": ["保护套", "标签", "包装盒"]
};

// 物料供应商映射
export const materialSuppliers = {
  "电池盖": ["聚龙", "欣冠", "广正"],
  "中框": ["聚龙", "欣冠", "广正"],
  "手机卡托": ["聚龙", "欣冠", "广正"],
  "侧键": ["聚龙", "欣冠", "广正"],
  "装饰件": ["聚龙", "欣冠", "广正"],
  "LCD显示屏": ["帝晶", "天马", "BOE"],
  "OLED显示屏": ["BOE", "天马", "华星"],
  "摄像头模组": ["盛泰", "天实", "深奥"],
  "电池": ["百俊达", "奥海", "辰阳"],
  "充电器": ["锂威", "风华", "维科"],
  "扬声器": ["东声", "豪声", "歌尔"],
  "听筒": ["东声", "豪声", "歌尔"],
  "保护套": ["丽德宝", "裕同", "富群"],
  "标签": ["丽德宝", "裕同", "富群"],
  "包装盒": ["丽德宝", "裕同", "富群"]
};

// 物料缺陷映射
export const materialDefects = {
  "电池盖": ["划伤", "掉漆", "起翘", "色差"],
  "中框": ["变形", "破裂", "掉漆", "尺寸异常"],
  "手机卡托": ["注塑不良", "尺寸异常", "断裂", "毛刺"],
  "侧键": ["脱落", "卡键", "尺寸异常", "松动"],
  "装饰件": ["掉色", "偏位", "脱落", "掉色"],
  "LCD显示屏": ["漏光", "暗点", "花屏", "偏色"],
  "OLED显示屏": ["闪屏", "mura", "亮点", "亮线"],
  "摄像头模组": ["刮花", "底座破裂", "脏污", "无法拍照"],
  "电池": ["起鼓", "松动", "漏液", "电压不稳定"],
  "充电器": ["无法充电", "外壳破裂", "输出功率异常", "发热异常"],
  "扬声器": ["无声", "杂音", "音量小", "破裂"],
  "听筒": ["无声", "杂音", "音量小", "破裂"],
  "保护套": ["尺寸偏差", "发黄", "开孔错位", "模具压痕"],
  "标签": ["脱落", "错印", "logo错误", "尺寸异常"],
  "包装盒": ["破损", "logo错误", "错印", "尺寸异常"]
};

// 物料保质期定义（月）
export const materialShelfLife = {
  "电池盖": 24,
  "中框": 24,
  "手机卡托": 24,
  "侧键": 24,
  "装饰件": 24,
  "LCD显示屏": 12,
  "OLED显示屏": 12,
  "摄像头模组": 14,
  "电池": 12,
  "充电器": 12,
  "扬声器": 13,
  "听筒": 14,
  "保护套": 15,
  "标签": 16,
  "包装盒": 17
};

// 工厂列表
export const factories = ["重庆工厂", "深圳工厂", "南昌工厂", "宜宾工厂"];

// 仓库列表
export const warehouses = ["中央库存", "重庆库存", "深圳库存"];

// 工厂-仓库映射关系
export const factoryWarehouseMapping = {
  "重庆工厂": ["中央库存", "重庆库存"],
  "深圳工厂": ["中央库存", "深圳库存"],
  "南昌工厂": ["中央库存"],
  "宜宾工厂": ["中央库存"]
};

/**
 * 获取所有物料分类
 * @returns {Object} 物料分类对象
 */
export function getAllMaterialCategories() {
  return materialCategories;
}

/**
 * 获取特定分类的物料
 * @param {string} category 分类名称
 * @returns {Array|undefined} 物料数组
 */
export function getMaterialsByCategory(category) {
  return materialCategories[category];
}

/**
 * 获取特定物料的供应商
 * @param {string} material 物料名称
 * @returns {Array|undefined} 供应商数组
 */
export function getSuppliersByMaterial(material) {
  return materialSuppliers[material];
}

/**
 * 获取特定物料的缺陷类型
 * @param {string} material 物料名称
 * @returns {Array|undefined} 缺陷类型数组
 */
export function getDefectsByMaterial(material) {
  return materialDefects[material];
}

/**
 * 获取特定物料的保质期（月）
 * @param {string} material 物料名称
 * @returns {number|undefined} 保质期月数
 */
export function getShelfLifeByMaterial(material) {
  return materialShelfLife[material];
}

/**
 * 获取所有供应商
 * @returns {Array} 供应商数组
 */
export function getAllSuppliers() {
  const suppliers = new Set();
  Object.values(materialSuppliers).forEach(supplierList => {
    supplierList.forEach(supplier => suppliers.add(supplier));
  });
  return Array.from(suppliers);
}

/**
 * 获取所有物料
 * @returns {Array} 物料数组
 */
export function getAllMaterials() {
  return Object.keys(materialSuppliers);
}

/**
 * 获取工厂可用的仓库列表
 * @param {string} factory 工厂名称
 * @returns {Array} 可用仓库列表
 */
export function getWarehousesByFactory(factory) {
  return factoryWarehouseMapping[factory] || [];
}

/**
 * 验证工厂与仓库的匹配关系是否合法
 * @param {string} factory 工厂名称
 * @param {string} warehouse 仓库名称
 * @returns {boolean} 是否匹配合法
 */
export function validateFactoryWarehouse(factory, warehouse) {
  const availableWarehouses = getWarehousesByFactory(factory);
  return availableWarehouses.includes(warehouse);
}

export default {
  materialCategories,
  materialSuppliers,
  materialDefects,
  materialShelfLife,
  factories,
  warehouses,
  factoryWarehouseMapping,
  getAllMaterialCategories,
  getMaterialsByCategory,
  getSuppliersByMaterial,
  getDefectsByMaterial,
  getShelfLifeByMaterial,
  getAllSuppliers,
  getAllMaterials,
  getWarehousesByFactory,
  validateFactoryWarehouse
}; 