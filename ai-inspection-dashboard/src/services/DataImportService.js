/**
 * 数据导入服务
 * 负责处理Excel导入和历史数据管理
 */
import { ElMessage } from 'element-plus';
// 注意：需要安装xlsx和uuid依赖，或者使用以下替代方案
// import * as XLSX from 'xlsx';
// import { v4 as uuidv4 } from 'uuid';
import unifiedDataService from './UnifiedDataService.js';
import systemDataUpdater from './SystemDataUpdater.js';
import { 
  getAllMaterials,
  getRandomSupplierForMaterial,
  getSuppliersForMaterial
} from '../data/MaterialSupplierMap.js';
// 移除对UnifiedDataDefinition的导入，改为自定义函数
// import { 
//   generateBatchNumber, 
//   generateTestId, 
//   generateOnlineId,
//   calculateExpiryDate,
//   getRandomElement
// } from './UnifiedDataDefinition.js';

// 添加自定义替代函数
// 生成批次号
function generateBatchNumber(materialCode, date) {
  const now = date || new Date();
  const year = now.getFullYear().toString().substr(2, 2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 提取编号，确保是2位数字
  let codeNumber;
  if (materialCode && typeof materialCode === 'string') {
    const matches = materialCode.match(/\d+/);
    if (matches && matches.length > 0) {
      codeNumber = matches[0].substring(0, 2).padStart(2, '0');
    } else {
      codeNumber = Math.floor(10 + Math.random() * 90).toString();
    }
  } else {
    codeNumber = Math.floor(10 + Math.random() * 90).toString();
  }
  
  const random = Math.floor(100 + Math.random() * 900).toString(); // 3位序列号
  return `M${codeNumber}-${year}${month}${day}-${random}`;
}

// 生成测试ID
function generateTestId() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `T${timestamp}${random}`;
}

// 生成上线ID
function generateOnlineId() {
  const now = new Date();
  const timestamp = now.getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `P${timestamp}${random}`;
}

// 计算过期日期
function calculateExpiryDate(productionDate, shelfLifeDays) {
  const result = new Date(productionDate);
  result.setDate(result.getDate() + shelfLifeDays);
  return result;
}

// 从数组中随机获取一个元素
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

class DataImportService {
  constructor() {
    this.historicalInventoryData = [];
    this.historicalTestData = [];
    this.historicalOnlineData = [];
    this.isInitialized = false;
  }

  /**
   * 初始化服务
   */
  async initialize() {
    this.loadHistoricalData();
    this.isInitialized = true;
    console.log('数据导入服务已初始化');
    return true;
  }

  /**
   * 加载所有历史数据
   */
  loadHistoricalData() {
    try {
      // 从localStorage加载已保存的历史数据
      const inventoryData = JSON.parse(localStorage.getItem('historical_inventory_data') || '[]');
      const testData = JSON.parse(localStorage.getItem('historical_test_data') || '[]');
      const onlineData = JSON.parse(localStorage.getItem('historical_online_data') || '[]');

      this.historicalInventoryData = inventoryData;
      this.historicalTestData = testData;
      this.historicalOnlineData = onlineData;

      console.log(`已加载历史数据: ${inventoryData.length}条库存数据, ${testData.length}条测试数据, ${onlineData.length}条上线数据`);
      return true;
    } catch (error) {
      console.error('加载历史数据失败:', error);
      return false;
    }
  }

  /**
   * 保存历史数据
   */
  saveHistoricalData() {
    try {
      localStorage.setItem('historical_inventory_data', JSON.stringify(this.historicalInventoryData));
      localStorage.setItem('historical_test_data', JSON.stringify(this.historicalTestData));
      localStorage.setItem('historical_online_data', JSON.stringify(this.historicalOnlineData));
      return true;
    } catch (error) {
      console.error('保存历史数据失败:', error);
      return false;
    }
  }

  /**
   * 将新数据标记为历史数据
   * @param {string} dataType - 数据类型：'inventory', 'test', 'online'
   * @param {Array} data - 数据数组
   */
  markAsHistorical(dataType, data) {
    switch (dataType) {
      case 'inventory':
        this.historicalInventoryData = [...this.historicalInventoryData, ...data];
        break;
      case 'test':
        this.historicalTestData = [...this.historicalTestData, ...data];
        break;
      case 'online':
        this.historicalOnlineData = [...this.historicalOnlineData, ...data];
        break;
      default:
        console.warn(`未知数据类型: ${dataType}`);
    }
    
    this.saveHistoricalData();
  }

  /**
   * 导入JSON数据（替代Excel导入，避免依赖问题）
   * @param {string} jsonString - JSON字符串
   * @param {string} dataType - 数据类型：'inventory', 'test', 'online'
   * @returns {Array} 导入的数据
   */
  importJSON(jsonString, dataType) {
    try {
      const data = JSON.parse(jsonString);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('JSON数据无效，需要是数组格式');
      }
      
      // 根据数据类型进行处理
      let processedData = [];
      switch (dataType) {
        case 'inventory':
          processedData = this.processInventoryData(data);
          break;
        case 'test':
          processedData = this.processTestData(data);
          break;
        case 'online':
          processedData = this.processOnlineData(data);
          break;
        default:
          throw new Error(`不支持的数据类型: ${dataType}`);
      }
      
      // 将数据保存为历史数据
      this.markAsHistorical(dataType, processedData);
      
      // 同时更新当前系统数据
      this.updateSystemData(dataType, processedData, false);
      
      return processedData;
    } catch (error) {
      console.error('导入JSON数据失败:', error);
      ElMessage.error(`导入数据失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 生成唯一ID，替代uuid库
   * @returns {string} 唯一ID
   */
  generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }
  
  /**
   * 处理库存数据
   * @param {Array} data - 原始数据
   * @returns {Array} 处理后的库存数据
   */
  processInventoryData(data) {
    return data.map(item => {
      // 生成唯一ID
      const id = item.id || this.generateUniqueId();
      
      // 确保批次号存在
      const batchNo = item.batch_no || item.batchNo || 
        generateBatchNumber(item.material_code?.substring(0, 4) || 'MAT', 
        new Date(item.arrival_date || item.arrivalDate || Date.now()));
      
      // 计算过期日期
      const arrivalDate = new Date(item.arrival_date || item.arrivalDate || Date.now());
      const shelfLifeDays = item.shelf_life_days || 365; // 默认一年有效期
      const expiryDate = item.expiry_date || item.expiryDate || 
        calculateExpiryDate(arrivalDate, shelfLifeDays).toISOString();
      
      return {
        id,
        material_id: item.material_code || item.material_id || item.materialCode || '',
        material_name: item.material_name || item.materialName || '',
        material_type: item.material_type || item.category || '',
        batch_no: batchNo,
        supplier: item.supplier || '',
        quantity: item.quantity || 0,
        unit: item.unit || '个',
        warehouse: item.warehouse || '',
        location: item.location || '',
        status: item.status || '正常',
        quality: item.quality || '合格',
        arrival_date: item.arrival_date || item.arrivalDate || new Date().toISOString(),
        expiry_date: expiryDate,
        inspection_date: item.inspection_date || item.inspectionDate || arrivalDate.toISOString(),
        remark: item.remark || item.remarks || '',
        created_at: item.created_at || new Date().toISOString(),
        project_id: item.project_id || '',
        project_name: item.project_name || '',
        baseline_id: item.baseline_id || '',
        baseline_name: item.baseline_name || '',
        factory: item.factory || '',
        factoryCode: item.factory_code || item.factoryCode || '',
        // 标记为历史数据
        is_historical: true
      };
    });
  }
  
  /**
   * 处理测试数据
   * @param {Array} data - 原始数据
   * @returns {Array} 处理后的测试数据
   */
  processTestData(data) {
    return data.map(item => {
      // 生成唯一ID
      const id = item.id || generateTestId();
      
      // 测试结果处理
      let testResults = item.test_results || item.testResults || {};
      if (typeof testResults === 'string') {
        try {
          testResults = JSON.parse(testResults);
        } catch (e) {
          testResults = {};
        }
      }
      
      return {
        id,
        material_id: item.material_id || item.material_code || item.materialCode || '',
        material_name: item.material_name || item.materialName || '',
        material_type: item.material_type || item.category || '',
        batch_no: item.batch_no || item.batchNo || '',
        supplier: item.supplier || '',
        test_date: item.test_date || item.testDate || new Date().toISOString(),
        test_results: testResults,
        test_conclusion: item.test_conclusion || item.testConclusion || '合格',
        tester: item.tester || '未知',
        remarks: item.remarks || item.remark || '',
        created_at: item.created_at || new Date().toISOString(),
        project_id: item.project_id || '',
        project_name: item.project_name || '',
        baseline_id: item.baseline_id || '',
        baseline_name: item.baseline_name || '',
        factory: item.factory || '',
        factoryCode: item.factory_code || item.factoryCode || '',
        test_type: item.test_type || item.testType || '',
        // 标记为历史数据
        is_historical: true
      };
    });
  }
  
  /**
   * 处理上线数据
   * @param {Array} data - 原始数据
   * @returns {Array} 处理后的上线数据
   */
  processOnlineData(data) {
    return data.map(item => {
      // 生成唯一ID
      const id = item.id || generateOnlineId();
      
      // 项目和基线信息处理
      const projectId = item.project_id || '';
      const projectName = item.project_name || '';
      const baselineId = item.baseline_id || '';
      const baselineName = item.baseline_name || '';
      
      // 创建项目和基线显示名称，避免显示"未知项目"或"未知基线"
      const project_display = item.project_display || 
        (projectId ? (projectName ? `${projectId} ${projectName}` : projectId) : projectName);
      
      const baseline_display = item.baseline_display || 
        (baselineId ? (baselineName ? `${baselineId} ${baselineName}` : baselineId) : baselineName);
      
      return {
        id,
        online_id: id,
        material_id: item.material_id || item.material_code || item.materialCode || '',
        material_name: item.material_name || item.materialName || '',
        material_type: item.material_type || item.category || '',
        batch_no: item.batch_no || item.batchNo || '',
        supplier: item.supplier || '',
        production_line: item.production_line || item.productionLine || '',
        line: item.line || item.production_line || item.productionLine || '',
        factory: item.factory || '',
        factory_code: item.factory_code || item.factoryCode || '',
        online_date: item.online_date || item.onlineDate || new Date().toISOString(),
        planned_quantity: item.planned_quantity || item.plannedQuantity || 0,
        actual_quantity: item.actual_quantity || item.actualQuantity || 0,
        status: item.status || '正常',
        operator: item.operator || '未知',
        remarks: item.remarks || item.remark || '',
        created_at: item.created_at || new Date().toISOString(),
        project_id: projectId,
        project_name: projectName,
        baseline_id: baselineId,
        baseline_name: baselineName,
        project_display: project_display,
        baseline_display: baseline_display,
        // 添加不良率和不良现象字段
        defect_rate: item.defect_rate || 0,
        defectRate: item.defectRate || item.defect_rate || 0,
        defect: item.defect || '',
        // 标记为历史数据
        is_historical: true
      };
    });
  }
  
  /**
   * 更新系统数据
   * @param {string} dataType - 数据类型：'inventory', 'test', 'online'
   * @param {Array} data - 新数据
   * @param {boolean} clearExisting - 是否清除现有数据
   */
  updateSystemData(dataType, data, clearExisting = false) {
    switch (dataType) {
      case 'inventory':
        unifiedDataService.saveInventoryData(data, clearExisting);
        break;
      case 'test':
        unifiedDataService.saveLabTestData(data, clearExisting);
        break;
      case 'online':
        unifiedDataService.saveOnlineData(data, clearExisting);
        break;
      default:
        console.warn(`未知数据类型: ${dataType}`);
    }
  }
  
  /**
   * 生成包含历史数据的完整数据集
   * @param {Object} options - 配置选项
   * @returns {Promise<Object>} 包含生成的各类数据的对象
   */
  async generateCompleteDataset(options = {}) {
    try {
      const inventoryCount = options.inventoryCount || 50;
      const testCount = options.testCount || 40;
      const onlineCount = options.onlineCount || 30;
      const clearExisting = options.clearExisting === true;
      
      // 清除现有系统数据（如果需要）
      if (clearExisting) {
        unifiedDataService.clearAllData();
      }
      
      // 1. 生成新的库存数据
      const inventoryItems = await systemDataUpdater.updateInventoryData({
        count: inventoryCount,
        clearExisting: true // 首先清除所有数据
      });
      
      // 2. 添加历史库存数据
      if (this.historicalInventoryData.length > 0) {
        unifiedDataService.saveInventoryData(this.historicalInventoryData, false);
        console.log(`已添加${this.historicalInventoryData.length}条历史库存数据`);
      }
      
      // 3. 生成新的测试数据
      const testItems = await systemDataUpdater.updateLabData({
        count: testCount,
        clearExisting: true // 首先清除所有数据
      });
      
      // 4. 添加历史测试数据
      if (this.historicalTestData.length > 0) {
        unifiedDataService.saveLabTestData(this.historicalTestData, false);
        console.log(`已添加${this.historicalTestData.length}条历史测试数据`);
      }
      
      // 5. 生成新的上线数据
      const onlineItems = await systemDataUpdater.updateOnlineData({
        count: onlineCount,
        clearExisting: true // 首先清除所有数据
      });
      
      // 6. 添加历史上线数据
      if (this.historicalOnlineData.length > 0) {
        unifiedDataService.saveOnlineData(this.historicalOnlineData, false);
        console.log(`已添加${this.historicalOnlineData.length}条历史上线数据`);
      }
      
      ElMessage.success('数据生成完成，包含历史数据');
      
      return {
        inventoryItems,
        testItems,
        onlineItems,
        historicalInventory: this.historicalInventoryData,
        historicalTest: this.historicalTestData,
        historicalOnline: this.historicalOnlineData
      };
    } catch (error) {
      console.error('生成完整数据集失败:', error);
      ElMessage.error(`生成数据失败: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * 获取历史数据
   * @param {string} dataType - 数据类型：'inventory', 'test', 'online'
   * @returns {Array} 历史数据
   */
  getHistoricalData(dataType) {
    switch (dataType) {
      case 'inventory':
        return this.historicalInventoryData;
      case 'test':
        return this.historicalTestData;
      case 'online':
        return this.historicalOnlineData;
      default:
        console.warn(`未知数据类型: ${dataType}`);
        return [];
    }
  }
}

// 创建单例实例
const dataImportService = new DataImportService();

// 导出服务
export default dataImportService; 
 
 
 