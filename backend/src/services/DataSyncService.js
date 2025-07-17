/**
 * 数据同步服务
 * 负责将前端localStorage数据同步到后端内存
 */

import mysql from 'mysql2/promise';
import { logger } from '../utils/logger.js';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Zxylsy.99',
  database: 'iqe_inspection'
};

// 内存数据存储
let memoryData = {
  inventory: [],
  inspection: [],
  production: [],
  lastSync: null
};

/**
 * 同步前端数据到后端内存
 * @param {Object} frontendData 前端数据
 * @returns {Object} 同步结果
 */
export async function syncFrontendData(frontendData) {
  try {
    logger.info('开始同步前端数据到后端内存');
    
    // 验证数据格式
    if (!frontendData || typeof frontendData !== 'object') {
      throw new Error('无效的前端数据格式');
    }
    
    // 同步库存数据
    if (frontendData.inventory && Array.isArray(frontendData.inventory)) {
      memoryData.inventory = frontendData.inventory;
      logger.info(`同步库存数据: ${memoryData.inventory.length} 条记录`);
    }
    
    // 同步测试数据
    if (frontendData.inspection && Array.isArray(frontendData.inspection)) {
      memoryData.inspection = frontendData.inspection;
      logger.info(`同步测试数据: ${memoryData.inspection.length} 条记录`);
    }
    
    // 同步生产数据
    if (frontendData.production && Array.isArray(frontendData.production)) {
      memoryData.production = frontendData.production;
      logger.info(`同步生产数据: ${memoryData.production.length} 条记录`);
    }
    
    // 更新同步时间
    memoryData.lastSync = new Date().toISOString();
    
    // 保存到数据库（可选）
    await saveToDatabase(memoryData);
    
    logger.info('前端数据同步完成');
    
    return {
      success: true,
      message: '数据同步成功',
      data: {
        inventoryCount: memoryData.inventory.length,
        inspectionCount: memoryData.inspection.length,
        productionCount: memoryData.production.length,
        lastSync: memoryData.lastSync
      }
    };
  } catch (error) {
    logger.error('数据同步失败:', error);
    return {
      success: false,
      message: '数据同步失败: ' + error.message
    };
  }
}

/**
 * 获取内存数据
 * @returns {Object} 内存数据
 */
export function getMemoryData() {
  return memoryData;
}

/**
 * 检查数据是否已同步
 * @returns {boolean} 是否已同步
 */
export function isDataSynced() {
  return memoryData.lastSync !== null && 
         (memoryData.inventory.length > 0 || 
          memoryData.inspection.length > 0 || 
          memoryData.production.length > 0);
}

/**
 * 获取数据统计信息
 * @returns {Object} 数据统计
 */
export function getDataStats() {
  return {
    inventoryCount: memoryData.inventory.length,
    inspectionCount: memoryData.inspection.length,
    productionCount: memoryData.production.length,
    lastSync: memoryData.lastSync,
    totalRecords: memoryData.inventory.length + memoryData.inspection.length + memoryData.production.length
  };
}

/**
 * 保存数据到数据库
 * @param {Object} data 数据
 */
async function saveToDatabase(data) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 清空现有数据
    await connection.execute('DELETE FROM real_data_storage');
    
    // 保存新数据
    const dataTypes = [
      { type: 'inventory', data: data.inventory },
      { type: 'inspection', data: data.inspection },
      { type: 'production', data: data.production }
    ];
    
    for (const { type, data: typeData } of dataTypes) {
      if (typeData && typeData.length > 0) {
        await connection.execute(`
          INSERT INTO real_data_storage (data_type, data_content, record_count, last_updated)
          VALUES (?, ?, ?, NOW())
        `, [type, JSON.stringify(typeData), typeData.length]);
      }
    }
    
    await connection.end();
    logger.info('数据已保存到数据库');
  } catch (error) {
    logger.error('保存数据到数据库失败:', error);
  }
}

/**
 * 从数据库加载数据
 * @returns {Object} 加载的数据
 */
export async function loadFromDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT data_type, data_content, record_count, last_updated
      FROM real_data_storage
      ORDER BY last_updated DESC
    `);
    
    await connection.end();
    
    if (rows.length === 0) {
      logger.info('数据库中没有数据');
      return null;
    }
    
    const loadedData = {
      inventory: [],
      inspection: [],
      production: [],
      lastSync: null
    };
    
    for (const row of rows) {
      try {
        const data = JSON.parse(row.data_content);
        loadedData[row.data_type] = data;
        
        if (!loadedData.lastSync || new Date(row.last_updated) > new Date(loadedData.lastSync)) {
          loadedData.lastSync = row.last_updated;
        }
      } catch (error) {
        logger.error(`解析${row.data_type}数据失败:`, error);
      }
    }
    
    // 更新内存数据
    memoryData = loadedData;
    
    logger.info('从数据库加载数据完成', {
      inventoryCount: loadedData.inventory.length,
      inspectionCount: loadedData.inspection.length,
      productionCount: loadedData.production.length
    });
    
    return loadedData;
  } catch (error) {
    logger.error('从数据库加载数据失败:', error);
    return null;
  }
}

/**
 * 初始化数据同步服务
 */
export async function initializeDataSync() {
  try {
    logger.info('初始化数据同步服务');
    
    // 尝试从数据库加载数据
    await loadFromDatabase();
    
    logger.info('数据同步服务初始化完成');
  } catch (error) {
    logger.error('数据同步服务初始化失败:', error);
  }
}

export default {
  syncFrontendData,
  getMemoryData,
  isDataSynced,
  getDataStats,
  loadFromDatabase,
  initializeDataSync
};
