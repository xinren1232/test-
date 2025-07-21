/**
 * 服务模块索引
 * 集中导出所有服务模块，优化后的版本
 * 移除了重复的服务，整合为统一的数据服务架构
 */

// 核心数据服务
import unifiedDataService from './UnifiedDataService.js';
import systemDataUpdater from './SystemDataUpdater.js';
import dataImportService from './DataImportService.js';

// 项目和物料相关服务
import projectBaselineService from './ProjectBaselineService.js';
import inventoryDataService from './InventoryDataService.js';
import materialService from './MaterialService.js';

// 标准化服务
import DataStandardService from './DataStandardService.js';
import { LaboratoryDataStandard } from './LaboratoryDataStandard.js';
import { QualityDataStandard } from './QualityDataStandard.js';

// 保留其他可能需要的服务
import factoryDataService from './FactoryDataService.js';
import batchManager from './BatchManager.js';

/**
 * 统一数据服务 - 处理所有数据的存储与读取
 */
export { unifiedDataService };

/**
 * 系统数据更新服务 - 负责生成和更新模拟数据
 */
export { systemDataUpdater };

/**
 * 数据导入服务 - 处理数据导入和格式转换
 */
export { dataImportService };

/**
 * 项目基线服务 - 管理项目和基线关系
 */
export { projectBaselineService };

/**
 * 库存数据服务 - 管理物料数据
 */
export { inventoryDataService };

/**
 * 物料服务 - 管理物料数据
 */
export { materialService };

/**
 * 工厂数据服务 - 兼容旧版本
 */
export { factoryDataService };

/**
 * 数据标准服务 - 定义和管理数据标准
 * @type {DataStandardService}
 */
export const dataStandardService = new DataStandardService();

/**
 * 初始化所有服务
 * @returns {Promise<boolean>} 初始化结果
 */
export async function initializeServices() {
  try {
    console.log('开始初始化服务...');
    
    // 首先确保数据已迁移到统一存储
    const migrationResult = unifiedDataService.migrateOldData();
    console.log('数据迁移' + (migrationResult ? '成功' : '失败或无需迁移'));
    
    // 初始化项目基线服务
    const projectBaselineResult = await projectBaselineService.initialize();
    console.log('项目基线服务初始化' + (projectBaselineResult ? '成功' : '失败'));
    
    // 初始化数据导入服务
    const dataImportResult = await dataImportService.initialize();
    console.log('数据导入服务初始化' + (dataImportResult ? '成功' : '失败'));
    
    // 初始化数据标准服务
    await dataStandardService.initialize();
    
    // 初始化实验室和质量数据标准
    const labStandard = new LaboratoryDataStandard();
    await labStandard.initialize();
    
    const qualityStandard = new QualityDataStandard();
    await qualityStandard.initialize();
    
    console.log('所有服务初始化完成');
    return true;
  } catch (error) {
    console.error('服务初始化失败:', error);
    return false;
  }
}

// 自动导出所有服务模块
export default {
  unifiedDataService,
  systemDataUpdater,
  dataImportService,
  projectBaselineService,
  inventoryDataService,
  materialService,
  factoryDataService,
  dataStandardService,
  initializeServices,
  batchManager
};