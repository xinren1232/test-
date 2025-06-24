/**
 * 调试工具函数
 */

/**
 * 调试localStorage中的数据
 * 输出所有键及其对应的数据概要以及大小信息
 * @param {string} [keyFilter] 可选的键名过滤条件
 * @returns {Object} 调试结果信息
 */
export function debugLocalStorage(keyFilter) {
  console.log('===== localStorage 调试信息 =====');
  
  const keys = Object.keys(localStorage).filter(key => 
    !keyFilter || key.includes(keyFilter)
  );
  
  console.log(`共发现 ${keys.length} 个键`);
  
  // 计算总大小
  const totalSize = keys.reduce((size, key) => {
    const itemSize = (localStorage[key] || '').length;
    return size + itemSize;
  }, 0);
  
  console.log(`总存储大小: ${formatBytes(totalSize)}`);
  
  // 遍历所有键
  keys.forEach(key => {
    try {
      const rawData = localStorage.getItem(key);
      const itemSize = (rawData || '').length;
      
      // 显示大小信息
      console.log(`${key}: ${formatBytes(itemSize)}`);
      
      // 尝试解析JSON数据
      try {
        const parsedData = JSON.parse(rawData);
        
        if (Array.isArray(parsedData)) {
          console.log(`${key}: 数组类型，${parsedData.length}条数据`);
          
          // 输出第一条数据作为示例
          if (parsedData.length > 0) {
            console.log(`${key} 示例:`, parsedData[0]);
          }
        } else if (typeof parsedData === 'object' && parsedData !== null) {
          console.log(`${key}: 对象类型，属性:`, Object.keys(parsedData));
        } else {
          console.log(`${key}: ${typeof parsedData}类型，值:`, parsedData);
        }
      } catch (e) {
        // 不是JSON数据
        console.log(`${key}: 非JSON数据，长度: ${rawData.length}字符`);
        
        // 如果数据较短，直接显示
        if (rawData.length < 100) {
          console.log(`${key} 值:`, rawData);
        }
      }
    } catch (error) {
      console.error(`读取键 ${key} 时出错:`, error);
    }
  });
  
  console.log('===== localStorage 调试结束 =====');
  
  return {
    keyCount: keys.length,
    totalSize: totalSize,
    formattedSize: formatBytes(totalSize)
  };
}

/**
 * 调试对象属性
 * @param {Object} obj 要调试的对象
 * @param {string} name 对象名称
 */
export function debugObject(obj, name = 'object') {
  console.log(`===== ${name} 调试信息 =====`);
  
  if (!obj) {
    console.log(`${name} 为 ${obj}`);
    return;
  }
  
  console.log(`类型: ${typeof obj}`);
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      console.log(`数组长度: ${obj.length}`);
      if (obj.length > 0) {
        console.log('第一个元素:', obj[0]);
      }
    } else {
      console.log('属性:', Object.keys(obj));
      for (const key in obj) {
        const value = obj[key];
        const valueType = typeof value;
        
        if (valueType === 'function') {
          console.log(`${key}: [函数]`);
        } else if (valueType === 'object' && value !== null) {
          if (Array.isArray(value)) {
            console.log(`${key}: [数组] 长度: ${value.length}`);
          } else {
            console.log(`${key}: [对象] 属性: ${Object.keys(value).join(', ')}`);
          }
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }
  } else {
    console.log(`值: ${obj}`);
  }
  
  console.log(`===== ${name} 调试结束 =====`);
}

/**
 * 检查物料数据
 * 尝试获取物料数据并显示详细信息
 * @returns {Object} 检查结果
 */
export function checkMaterialData() {
  console.log('===== 物料数据检查 =====');
  
  const result = {
    success: false,
    materials: [],
    categories: [],
    suppliers: []
  };
  
  try {
    // 从模块导入相关函数
    const { getAllMaterials, getAllCategories, getAllSuppliers } = require('../data/material_supplier_mapping');
    
    // 检查各种方法是否可用
    console.log('getAllMaterials类型:', typeof getAllMaterials);
    console.log('getAllCategories类型:', typeof getAllCategories);
    console.log('getAllSuppliers类型:', typeof getAllSuppliers);
    
    // 尝试获取所有物料
    try {
      const materials = getAllMaterials();
      console.log('物料数据:', materials ? `获取到${materials.length}个物料` : '未获取到物料数据');
      
      if (materials && materials.length > 0) {
        console.log('第一个物料示例:', materials[0]);
        result.materials = materials;
        result.success = true;
      }
    } catch (error) {
      console.error('物料获取失败:', error);
    }
    
    // 尝试获取所有分类
    try {
      const categories = getAllCategories();
      console.log('分类数据:', categories ? `获取到${categories.length}个分类` : '未获取到分类数据');
      
      if (categories && categories.length > 0) {
        console.log('分类列表:', categories.map(c => c.name).join(', '));
        result.categories = categories;
      }
    } catch (error) {
      console.error('分类获取失败:', error);
    }
    
    // 尝试获取所有供应商
    try {
      const suppliers = getAllSuppliers();
      console.log('供应商数据:', suppliers ? `获取到${suppliers.length}个供应商` : '未获取到供应商数据');
      
      if (suppliers && suppliers.length > 0) {
        console.log('供应商列表(部分):', suppliers.slice(0, 5).join(', ') + (suppliers.length > 5 ? '...' : ''));
        result.suppliers = suppliers;
      }
    } catch (error) {
      console.error('供应商获取失败:', error);
    }
    
    // 尝试直接导入物料映射
    try {
      const materialMapping = require('../data/material_supplier_mapping').default;
      console.log('物料映射对象:', materialMapping ? '已获取' : '未获取');
      
      if (materialMapping) {
        const categoryKeys = Object.keys(materialMapping);
        console.log(`物料映射包含${categoryKeys.length}个分类`);
        
        for (const key of categoryKeys) {
          const category = materialMapping[key];
          console.log(`- ${category.category}: ${category.materials.length}个物料`);
        }
        
        result.materialMapping = materialMapping;
      }
    } catch (error) {
      console.error('物料映射获取失败:', error);
    }
  } catch (error) {
    console.error('物料数据检查失败:', error);
  }
  
  console.log('===== 物料数据检查结束 =====');
  return result;
}

/**
 * 格式化字节大小
 * @param {number} bytes 字节数
 * @param {number} [decimals=2] 小数位数
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
} 