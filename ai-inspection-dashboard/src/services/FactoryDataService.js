/**
 * 工厂数据服务
 * 提供工厂和产线数据相关功能
 * 注意：此服务为兼容层，主要功能已迁移到UnifiedDataService
 */

import unifiedDataService from './UnifiedDataService.js';
import { v4 as uuidv4 } from 'uuid';

// 生产线列表
const PRODUCTION_LINES = ['01线', '02线', '03线', '04线'];

// 工厂状态列表
const FACTORY_STATUSES = ['正常', '预警', '异常', '维护中'];

/**
 * 工厂数据服务
 * 处理工厂和产线数据
 */
const FactoryDataService = {
  /**
   * 获取工厂数据
   * @returns {Array} 工厂数据数组
   */
  getFactoryData() {
    return unifiedDataService.getFactoryData();
  },
  
  /**
   * 保存工厂数据
   * @param {Array} data 数据数组
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveFactoryData(data, clearExisting = false) {
      return unifiedDataService.saveFactoryData(data, clearExisting);
  },
  
  /**
   * 获取生产线列表
   * @returns {Array} 生产线数组
   */
  getProductionLines() {
    return PRODUCTION_LINES;
  },
  
  /**
   * 获取工厂状态列表
   * @returns {Array} 状态数组
   */
  getFactoryStatuses() {
    return FACTORY_STATUSES;
  },
  
  /**
   * 创建工厂数据项
   * @param {Object} materialData 物料数据
   * @returns {Object} 工厂数据项
   */
  createFactoryItem(materialData) {
    const now = new Date();
    
    // 生成唯一ID
    const id = `PROD-${now.getTime()}-${Math.floor(Math.random() * 1000)}`;
    
    // 确保项目ID符合X+4位数字的格式
    let projectId = materialData.project_id;
    let projectName = materialData.project_name;
    
    if (!projectId || !projectId.match(/^X\d{4}$/)) {
      projectId = `X${1000 + Math.floor(Math.random() * 9000)}`;
      projectName = projectName || `项目${projectId}`;
    }
    
    // 设置默认值
    const defaultData = {
      materialCode: `M-${Math.floor(Math.random() * 10000)}`,
      materialName: '未知物料',
      category: '未分类',
      batchNo: `B-${Math.floor(Math.random() * 10000)}`,
      supplier: '未知供应商',
      factory: '主工厂',
      productionLine: PRODUCTION_LINES[0],
      onlineStatus: FACTORY_STATUSES[0],
      onlineDate: now.toISOString(),
      usageQuantity: 0,
      unit: '个',
      yieldRate: '95%',
      operator: '未分配',
      notes: '',
      quality_metrics: {
        first_pass_yield: 95,
        defect_rate: 2,
        rework_rate: 3
      },
      // 添加默认的项目ID和项目名称
      project_id: projectId,
      project_name: projectName
    };
    
    // 合并用户提供的数据和默认值
    const factoryItem = {
      id,
      ...defaultData,
      ...materialData,
      project_id: projectId, // 确保使用规范的项目ID
      project_name: projectName, // 确保有项目名称
      last_updated: now.toISOString()
    };
    
    return factoryItem;
  }
};

export default FactoryDataService; 
