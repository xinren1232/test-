/**
 * 物料编码映射管理
 * 用于确保物料编码与物料名称及供应商的一一对应关系
 * 在库存、上线和测试页面的数据生成中保持一致
 */

import { getAllMaterials } from './MaterialSupplierMap.js';
import { ref } from 'vue';
import axios from 'axios';

// 物料编码映射表 - 存储物料名称和供应商与物料编码的对应关系
const materialCodeMap = new Map();
// 是否已初始化标志
const isInitialized = ref(false);

/**
 * 获取或创建物料编码
 * 如果物料名称和供应商的组合已有编码，则返回已有编码
 * 如果没有，则创建新编码并存储
 * @param {string} materialName 物料名称
 * @param {string} supplier 供应商名称
 * @returns {string} 物料编码
 */
export function getMaterialCode(materialName, supplier) {
  // 创建唯一键
  const key = `${materialName}|${supplier}`;
  
  // 如果已存在映射，直接返回
  if (materialCodeMap.has(key)) {
    return materialCodeMap.get(key);
  }
  
  // 如果不存在，创建新的物料编码
  const material = getAllMaterials().find(m => m.name === materialName);
  let materialCode;
  
  if (material && material.code_prefix) {
    // 使用物料的前缀 + 供应商首字母 + 4位数字
    const supplierPrefix = supplier ? supplier.charAt(0) : 'X';
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    materialCode = `${material.code_prefix}-${supplierPrefix}${randomDigits}`;
  } else {
    // 如果没有提供物料名称或找不到物料定义，使用默认格式
    const prefix = 'M';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    materialCode = `${prefix}${randomDigits}`;
  }
  
  // 存储映射关系
  materialCodeMap.set(key, materialCode);
  
  // 保存到数据库（异步操作）
  saveMaterialCodeMapping(materialCode, materialName, supplier, material?.code_prefix, material?.category);
  
  return materialCode;
}

/**
 * 保存物料编码映射到数据库
 * @param {string} materialCode 物料编码
 * @param {string} materialName 物料名称
 * @param {string} supplier 供应商名称
 * @param {string} codePrefix 编码前缀
 * @param {string} category 物料类别
 * @returns {Promise} 保存结果
 */
async function saveMaterialCodeMapping(materialCode, materialName, supplier, codePrefix, category) {
  try {
    // 这里假设有一个API端点用于保存物料编码映射
    // 实际应用中需要根据后端API进行调整
    const response = await axios.post('/api/material-code-mappings', {
      material_code: materialCode,
      material_name: materialName,
      supplier_name: supplier,
      code_prefix: codePrefix || '',
      category: category || ''
    });
    
    console.log('物料编码映射保存成功:', response.data);
    return response.data;
  } catch (error) {
    console.error('保存物料编码映射失败:', error);
    return null;
  }
}

/**
 * 从数据库加载物料编码映射
 * @returns {Promise<boolean>} 加载结果
 */
export async function loadMaterialCodeMappings() {
  try {
    // 这里假设有一个API端点用于获取物料编码映射
    const response = await axios.get('/api/material-code-mappings');
    
    // 清除现有映射
    materialCodeMap.clear();
    
    // 加载从数据库获取的映射
    response.data.forEach(mapping => {
      const key = `${mapping.material_name}|${mapping.supplier_name}`;
      materialCodeMap.set(key, mapping.material_code);
    });
    
    isInitialized.value = true;
    console.log('物料编码映射加载成功，共', materialCodeMap.size, '条记录');
    return true;
  } catch (error) {
    console.error('加载物料编码映射失败:', error);
    return false;
  }
}

/**
 * 获取所有物料编码映射
 * @returns {Map} 物料编码映射表
 */
export function getAllMaterialCodes() {
  return materialCodeMap;
}

/**
 * 根据物料编码获取物料名称和供应商
 * @param {string} materialCode 物料编码
 * @returns {Object|null} 物料名称和供应商对象，如果不存在则返回null
 */
export function getMaterialInfoByCode(materialCode) {
  for (const [key, code] of materialCodeMap.entries()) {
    if (code === materialCode) {
      const [materialName, supplier] = key.split('|');
      return { materialName, supplier };
    }
  }
  return null;
}

/**
 * 清除所有物料编码映射
 * 通常用于测试或重置系统
 */
export function clearMaterialCodeMap() {
  materialCodeMap.clear();
  isInitialized.value = false;
}

/**
 * 初始化物料编码映射
 * 为所有物料和其可能的供应商预生成编码
 */
export async function initializeMaterialCodeMap() {
  // 如果已经初始化，则跳过
  if (isInitialized.value) {
    console.log('物料编码映射已初始化，跳过');
    return;
  }
  
  // 尝试从数据库加载映射
  const loadResult = await loadMaterialCodeMappings();
  
  // 如果从数据库加载失败，则生成新的映射
  if (!loadResult) {
    const allMaterials = getAllMaterials();
    
    allMaterials.forEach(material => {
      if (material.suppliers && material.suppliers.length > 0) {
        material.suppliers.forEach(supplier => {
          getMaterialCode(material.name, supplier);
        });
      }
    });
    
    isInitialized.value = true;
  }
}

/**
 * 检查物料编码映射是否已初始化
 * @returns {boolean} 是否已初始化
 */
export function isCodeMapInitialized() {
  return isInitialized.value;
}

export default {
  getMaterialCode,
  getAllMaterialCodes,
  getMaterialInfoByCode,
  clearMaterialCodeMap,
  initializeMaterialCodeMap,
  loadMaterialCodeMappings,
  isCodeMapInitialized
}; 