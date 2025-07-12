import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

// 模拟数据存储
let materialCodeMappings = [];

/**
 * 获取物料编码映射
 * @returns {Promise<Array>}
 */
export async function getMaterialCodeMappings() {
  try {
    // 返回当前存储的映射数据
    logger.info(`获取物料编码映射，共 ${materialCodeMappings.length} 条记录`);
    return materialCodeMappings;
  } catch (error) {
    logger.error('获取物料编码映射失败:', error);
    return [];
  }
}

/**
 * 更新物料编码映射
 * @param {Object} newMapping 新的映射数据
 * @returns {Promise<Object>}
 */
export async function updateMaterialCodeMappings(newMapping) {
  try {
    logger.info('更新物料编码映射:', newMapping);

    // 检查是否已存在相同的映射
    const existingIndex = materialCodeMappings.findIndex(
      mapping => mapping.material_code === newMapping.material_code
    );

    if (existingIndex >= 0) {
      // 更新现有映射
      materialCodeMappings[existingIndex] = {
        ...materialCodeMappings[existingIndex],
        ...newMapping,
        updated_at: new Date().toISOString()
      };
      logger.info(`更新现有物料编码映射: ${newMapping.material_code}`);
    } else {
      // 添加新映射
      materialCodeMappings.push({
        ...newMapping,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      logger.info(`添加新物料编码映射: ${newMapping.material_code}`);
    }

    return {
      message: '物料编码映射更新成功',
      total: materialCodeMappings.length
    };
  } catch (error) {
    logger.error('更新物料编码映射失败:', error);
    throw error;
  }
}

/**
 * 初始化一些示例数据
 */
function initializeSampleData() {
  if (materialCodeMappings.length === 0) {
    materialCodeMappings = [
      {
        material_code: 'BAT-S1001',
        material_name: '锂电池',
        supplier_name: '深圳电池厂',
        code_prefix: 'BAT',
        category: '电池类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        material_code: 'MEM-H2001',
        material_name: '内存条',
        supplier_name: '华为供应商',
        code_prefix: 'MEM',
        category: '存储类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        material_code: 'SCR-S3001',
        material_name: '显示屏',
        supplier_name: '深圳显示厂',
        code_prefix: 'SCR',
        category: '光学类',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    logger.info('初始化示例物料编码映射数据');
  }
}

// 初始化示例数据
initializeSampleData();
 