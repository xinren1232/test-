/**
 * 物料供应商映射表
 * 用于生成模拟数据和业务场景时保持一致性
 */

export const materialSupplierMapping = {
  // 1️⃣ 结构件-量产管理组
  "structural-mass": {
    category: "结构件-量产管理组",
    materials: [
      {
        name: "手机壳料-后盖",
        suppliers: ["歌尔股份", "蓝思科技", "比亚迪电子"],
        code_prefix: "SHKH",
        unit: "个",
        inspection_items: ["外观", "尺寸", "硬度", "耐冲击性"],
        shelf_life_months: 24
      },
      {
        name: "手机壳料-中框",
        suppliers: ["领益智造", "通达集团", "安洁科技"],
        code_prefix: "SHKZ",
        unit: "个",
        inspection_items: ["外观", "尺寸", "硬度", "耐冲击性"],
        shelf_life_months: 24
      },
      {
        name: "手机卡托",
        suppliers: ["安捷利美维", "立讯精密", "信邦"],
        code_prefix: "SHKT",
        unit: "个",
        inspection_items: ["外观", "尺寸", "插拔力"],
        shelf_life_months: 36
      },
      {
        name: "侧键",
        suppliers: ["赛尔康", "欧菲光", "柏承电子"],
        code_prefix: "SCEJ",
        unit: "个",
        inspection_items: ["外观", "尺寸", "按压力", "使用寿命"],
        shelf_life_months: 36
      },
      {
        name: "五金小件",
        suppliers: ["富驰高科", "信邦", "崇达"],
        code_prefix: "SWJX",
        unit: "个",
        inspection_items: ["外观", "尺寸", "镀层厚度"],
        shelf_life_months: 36
      },
      {
        name: "装饰件",
        suppliers: ["通达集团", "欣兴电子", "赛尔康"],
        code_prefix: "SZSJ",
        unit: "个",
        inspection_items: ["外观", "尺寸", "颜色一致性"],
        shelf_life_months: 36
      },
      {
        name: "保护套",
        suppliers: ["ESR亿色", "倍思BASEUS", "绿联"],
        code_prefix: "SBHT",
        unit: "个",
        inspection_items: ["外观", "尺寸", "材质", "韧性"],
        shelf_life_months: 24
      },
      {
        name: "硅胶套",
        suppliers: ["倍思BASEUS", "摩米士", "绿联"],
        code_prefix: "SGJT",
        unit: "个",
        inspection_items: ["外观", "尺寸", "材质", "韧性"],
        shelf_life_months: 24
      },
      {
        name: "后摄镜片",
        suppliers: ["舜宇光学", "大立光电", "舜宇车载"],
        code_prefix: "HSJP",
        unit: "片",
        inspection_items: ["外观", "尺寸", "透光率", "耐刮擦性"],
        shelf_life_months: 36
      },
      {
        name: "辅料类(泡棉/标签)",
        suppliers: ["杜邦", "3M", "裕同科技"],
        code_prefix: "SFLL",
        unit: "件",
        inspection_items: ["外观", "尺寸", "粘性"],
        shelf_life_months: 12
      }
    ]
  },

  // 3️⃣ 电子贴片料
  "electronic-patch": {
    category: "电子贴片料",
    materials: [
      {
        name: "PCB主板",
        suppliers: ["致伸科技", "深南电路", "鹏鼎控股"],
        code_prefix: "EPCB",
        unit: "片",
        inspection_items: ["外观", "尺寸", "阻抗测试", "线路测试"],
        shelf_life_months: 12
      },
      {
        name: "FPC软板",
        suppliers: ["东山精密", "福耀电子", "铭旺达"],
        code_prefix: "EFPC",
        unit: "片",
        inspection_items: ["外观", "尺寸", "阻抗测试", "弯折测试"],
        shelf_life_months: 12
      },
      {
        name: "贴片电阻",
        suppliers: ["国巨", "旺诠", "厚声"],
        code_prefix: "ETPD",
        unit: "个",
        inspection_items: ["外观", "阻值测试", "耐压测试"],
        shelf_life_months: 24
      },
      {
        name: "贴片电容",
        suppliers: ["三星电机", "村田", "风华高科"],
        code_prefix: "ETPR",
        unit: "个",
        inspection_items: ["外观", "容值测试", "耐压测试"],
        shelf_life_months: 24
      },
      {
        name: "贴片电感",
        suppliers: ["TDK", "顺络电子", "村田"],
        code_prefix: "ETPG",
        unit: "个",
        inspection_items: ["外观", "电感值测试", "直流电阻测试"],
        shelf_life_months: 24
      },
      {
        name: "贴片二极管",
        suppliers: ["安森美ON", "长电科技", "台半"],
        code_prefix: "ETPE",
        unit: "个",
        inspection_items: ["外观", "正向压降测试", "反向漏电流测试"],
        shelf_life_months: 24
      },
      {
        name: "贴片三极管",
        suppliers: ["意法半导体", "长电科技", "台半"],
        code_prefix: "ETPS",
        unit: "个",
        inspection_items: ["外观", "电流增益测试", "饱和电压测试"],
        shelf_life_months: 24
      },
      {
        name: "贴片IC",
        suppliers: ["高通", "联发科", "紫光展锐"],
        code_prefix: "ETIC",
        unit: "个",
        inspection_items: ["外观", "功能测试", "电气特性测试"],
        shelf_life_months: 12
      }
    ]
  },

  // 4️⃣ 屏物料组
  "screen": {
    category: "屏物料组",
    materials: [
      {
        name: "LCD屏幕",
        suppliers: ["京东方BOE", "天马微电子", "和辉光电"],
        code_prefix: "DLCD",
        unit: "片",
        inspection_items: ["外观", "亮度测试", "色彩测试", "坏点检测"],
        shelf_life_months: 12
      },
      {
        name: "OLED屏幕",
        suppliers: ["三星显示", "LG Display", "京东方BOE"],
        code_prefix: "DOLD",
        unit: "片",
        inspection_items: ["外观", "亮度测试", "色彩测试", "坏点检测", "烧屏测试"],
        shelf_life_months: 6
      }
    ]
  },

  // 5️⃣ CAM/FP/电声/安规/包材物料组
  "misc": {
    category: "CAM/FP/电声/安规/包材物料组",
    materials: [
      {
        name: "CAM摄像头模组",
        suppliers: ["丘钛科技", "欧菲光", "舜宇光学"],
        code_prefix: "MCAM",
        unit: "个",
        inspection_items: ["外观", "成像质量", "对焦测试", "色彩还原度测试"],
        shelf_life_months: 12
      },
      {
        name: "FP指纹模组",
        suppliers: ["神盾", "汇顶科技", "新思科技"],
        code_prefix: "MFGP",
        unit: "个",
        inspection_items: ["外观", "识别率测试", "抗干扰测试"],
        shelf_life_months: 12
      },
      {
        name: "电声(喇叭/听筒)",
        suppliers: ["瑞声科技", "歌尔股份", "立讯精密"],
        code_prefix: "MDSL",
        unit: "个",
        inspection_items: ["外观", "阻抗测试", "音频响应测试", "失真度测试"],
        shelf_life_months: 24
      },
      {
        name: "电池",
        suppliers: ["欣旺达", "德赛电池", "力神电池"],
        code_prefix: "BBTRY",
        unit: "个",
        inspection_items: ["外观", "容量测试", "充放电测试", "安全性测试"],
        shelf_life_months: 6
      },
      {
        name: "充电器",
        suppliers: ["立讯精密", "比亚迪电子", "意丰科技"],
        code_prefix: "BCHRG",
        unit: "个",
        inspection_items: ["外观", "输出电压测试", "输出电流测试", "安全性测试"],
        shelf_life_months: 24
      },
      {
        name: "包材(彩盒/泡棉等)",
        suppliers: ["裕同科技", "盛通股份", "合兴包装"],
        code_prefix: "PPACK",
        unit: "件",
        inspection_items: ["外观", "尺寸", "印刷质量", "包装牢固性"],
        shelf_life_months: 36
      }
    ]
  }
};

// 工厂定义
export const factories = [
  { id: "CQ", name: "重庆工厂", address: "重庆市渝北区创新路123号" },
  { id: "SZ", name: "深圳工厂", address: "深圳市南山区高新南九道10号" },
  { id: "NC", name: "南昌工厂", address: "南昌市高新开发区创业大道1800号" },
  { id: "YB", name: "宜宾工厂", address: "宜宾市临港经济技术开发区港园路西段61号" }
];

// 仓库定义
export const warehouses = [
  { id: "CQ-W1", name: "重庆主仓", factory_id: "CQ" },
  { id: "CQ-W2", name: "重庆辅料仓", factory_id: "CQ" },
  { id: "SZ-W1", name: "深圳主仓", factory_id: "SZ" },
  { id: "SZ-W2", name: "深圳电子料仓", factory_id: "SZ" },
  { id: "NC-W1", name: "南昌主仓", factory_id: "NC" },
  { id: "YB-W1", name: "宜宾主仓", factory_id: "YB" }
];

/**
 * 获取物料信息
 * @param {string} materialName 物料名称
 * @returns {Object|null} 物料信息对象
 */
export function getMaterialInfo(materialName) {
  for (const categoryKey in materialSupplierMapping) {
    const category = materialSupplierMapping[categoryKey];
    const material = category.materials.find(m => m.name === materialName);
    if (material) {
      return { ...material, category: category.category };
    }
  }
  return null;
}

/**
 * 获取物料的供应商列表
 * @param {string} materialName 物料名称
 * @returns {Array} 供应商数组
 */
export function getSuppliersForMaterial(materialName) {
  const material = getMaterialInfo(materialName);
  return material ? material.suppliers : [];
}

/**
 * 随机获取物料的一个供应商
 * @param {string} materialName 物料名称
 * @returns {string|null} 供应商名称
 */
export function getRandomSupplierForMaterial(materialName) {
  const suppliers = getSuppliersForMaterial(materialName);
  if (suppliers.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * suppliers.length);
  return suppliers[randomIndex];
}

/**
 * 获取所有物料类别
 * @returns {Array} 物料类别数组
 */
export function getAllCategories() {
  return Object.values(materialSupplierMapping).map(category => category.category);
}

/**
 * 根据类别获取物料列表
 * @param {string} categoryKey 类别键名
 * @returns {Array} 物料数组
 */
export function getMaterialsByCategory(categoryKey) {
  return materialSupplierMapping[categoryKey]?.materials || [];
}

/**
 * 获取所有物料列表
 * @returns {Array} 所有物料的扁平数组
 */
export function getAllMaterials() {
  const allMaterials = [];
  for (const categoryKey in materialSupplierMapping) {
    const category = materialSupplierMapping[categoryKey];
    const materialsWithCategory = category.materials.map(material => ({
        ...material,
        category: category.category,
        categoryKey
    }));
    allMaterials.push(...materialsWithCategory);
  }
  return allMaterials;
}

/**
 * 获取所有供应商列表(去重)
 * @returns {Array} 供应商数组
 */
export function getAllSuppliers() {
  const suppliersSet = new Set();
  for (const categoryKey in materialSupplierMapping) {
    const category = materialSupplierMapping[categoryKey];
    category.materials.forEach(material => {
      material.suppliers.forEach(supplier => suppliersSet.add(supplier));
    });
  }
  return Array.from(suppliersSet);
}

/**
 * 根据工厂ID获取工厂信息
 * @param {string} factoryId 工厂ID
 * @returns {Object|null} 工厂信息
 */
export function getFactoryById(factoryId) {
  return factories.find(factory => factory.id === factoryId) || null;
}

/**
 * 根据仓库ID获取仓库信息
 * @param {string} warehouseId 仓库ID
 * @returns {Object|null} 仓库信息
 */
export function getWarehouseById(warehouseId) {
  return warehouses.find(warehouse => warehouse.id === warehouseId) || null;
}

/**
 * 根据物料编码前缀验证物料类型
 * @param {string} code 物料编码
 * @returns {Object|null} 物料信息
 */
export function validateMaterialCodePrefix(code) {
  if (!code || typeof code !== 'string') return null;
  
  const prefix = code.substring(0, 4); // 取前4位作为前缀
  
  for (const categoryKey in materialSupplierMapping) {
    const category = materialSupplierMapping[categoryKey];
    const material = category.materials.find(m => m.code_prefix === prefix);
    if (material) {
      return {
        name: material.name,
        category: category.category,
        categoryKey,
        unit: material.unit,
        code_prefix: material.code_prefix,
        inspection_items: material.inspection_items,
        shelf_life_months: material.shelf_life_months
      };
    }
  }
  
  return null;
}

export default {
  materialSupplierMapping,
  factories,
  warehouses,
  getMaterialInfo,
  getSuppliersForMaterial,
  getRandomSupplierForMaterial,
  getAllCategories,
  getMaterialsByCategory,
  getAllMaterials,
  getAllSuppliers,
  getFactoryById,
  getWarehouseById,
  validateMaterialCodePrefix
}; 