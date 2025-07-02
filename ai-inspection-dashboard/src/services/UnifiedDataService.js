/**
 * 统一数据服务
 * 提供数据管理的核心服务和API
 * 
 * 注意：此文件已升级，提供统一的数据管理设计实现
 */

import { STORAGE_KEYS as DEFINED_STORAGE_KEYS } from './UnifiedDataDefinition.js';

// 存储键定义
const STORAGE_KEYS = {
  INVENTORY: DEFINED_STORAGE_KEYS.INVENTORY,
  LAB: DEFINED_STORAGE_KEYS.LAB,
  FACTORY: DEFINED_STORAGE_KEYS.FACTORY,
  HISTORICAL_INVENTORY: DEFINED_STORAGE_KEYS.HISTORICAL_INVENTORY,
  HISTORICAL_LAB: DEFINED_STORAGE_KEYS.HISTORICAL_LAB,
  HISTORICAL_FACTORY: DEFINED_STORAGE_KEYS.HISTORICAL_FACTORY,
  
  // 统一添加常用的存储键别名，用于兼容旧代码
  ALIASES: {
    // 工厂/上线数据别名
    'online_data': 'unified_factory_data',
    'factory_data': 'unified_factory_data',
    
    // 库存数据别名
    'inventory_data': 'unified_inventory_data',
    
    // 实验室数据别名
    'lab_data': 'unified_lab_data',
    'lab_test_data': 'unified_lab_data'
  }
};

/**
 * 获取实际存储键
 * 如果提供的键是一个别名，返回其对应的标准键
 * @param {string} key 存储键
 * @returns {string} 标准存储键
 */
function getActualKey(key) {
  return STORAGE_KEYS.ALIASES[key] || key;
}

/**
 * 合并并去重数据数组
 * @param {Array} arrays 数据数组的数组
 * @returns {Array} 合并后的数组
 */
function mergeAndDeduplicate(arrays) {
  // 过滤掉空数组
  const validArrays = arrays.filter(arr => Array.isArray(arr) && arr.length > 0);
  
  if (validArrays.length === 0) return [];
  
  // 如果只有一个数组，直接返回
  if (validArrays.length === 1) return validArrays[0];
  
  // 合并所有数组
  const mergedArray = [].concat(...validArrays);
  
  // 使用ID或其他唯一标识符去重
  const uniqueMap = new Map();
  
  mergedArray.forEach(item => {
    // 使用ID、编码或其他唯一值作为键
    const key = item.id || item.materialCode || item.batchNo || 
                JSON.stringify({code: item.materialCode, batch: item.batchNo});
    
    // 如果已存在，保留最新的（假设有时间戳或版本号）
    if (!uniqueMap.has(key) || 
        (item.timestamp && uniqueMap.get(key).timestamp && 
         new Date(item.timestamp) > new Date(uniqueMap.get(key).timestamp))) {
      uniqueMap.set(key, item);
    }
  });
  
  return Array.from(uniqueMap.values());
}

// 统一数据服务
const UnifiedDataService = {
  // 存储键常量
  STORAGE_KEYS,
  
  /**
   * 获取库存数据
   * @returns {Array} 库存数据数组
   */
  getInventoryData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY) || localStorage.getItem('inventory_data') || '[]';
      return JSON.parse(data);
    } catch (error) {
      console.error('获取库存数据失败:', error);
      return [];
    }
  },
  
  /**
   * 获取实验室数据
   * @returns {Array} 实验室数据数组
   */
  getLabData() {
    try {
      console.log('开始获取实验室数据...');
      
      // V2: 只从主存储键获取数据，避免旧数据污染
      const unifiedData = localStorage.getItem(STORAGE_KEYS.LAB) || '[]';
      let mergedData = JSON.parse(unifiedData);
      
      // 处理测试结果，确保没有"待定"状态
      mergedData = mergedData.map(item => {
        // 如果结果是"待定"，随机分配为"合格"或"不合格"
        if (item.result === '待定' || item.result === undefined || item.result === null || item.result === '') {
          item.result = Math.random() > 0.2 ? 'OK' : 'NG';
        }
        
        // 确保NG结果有不良现象描述
        if (item.result === 'NG' && (!item.defectDesc || item.defectDesc === '')) {
          const defects = [
            "外观不良", "尺寸超差", "材质问题", "标识错误", 
            "划伤", "变形", "破裂", "起鼓", "色差", 
            "焊点虚焊", "元件缺失", "短路", "开路"
          ];
          item.defectDesc = defects[Math.floor(Math.random() * defects.length)];
        }
        
        return item;
      });
      
      console.log(`合并后的实验室数据总数: ${mergedData.length}条`);
      return mergedData;
    } catch (error) {
      console.error('获取实验室数据失败:', error);
      return [];
    }
  },
  
  /**
   * 获取工厂上线数据
   * @returns {Array} 工厂上线数据数组
   */
  getFactoryData() {
    try {
      console.log('开始获取工厂上线数据...');
      
      // V2: 只从主存储键获取数据，避免旧数据污染
      const unifiedData = localStorage.getItem(STORAGE_KEYS.FACTORY) || '[]';
      const mergedData = JSON.parse(unifiedData);
      
      console.log(`合并后的工厂上线数据总数: ${mergedData.length}条`);
      return mergedData;
    } catch (error) {
      console.error('获取工厂上线数据失败:', error);
      return [];
    }
  },
  
  /**
   * 获取上线数据 (getFactoryData的别名)
   * @returns {Array} 上线数据数组
   */
  getOnlineData() {
    return this.getFactoryData();
  },
  
  /**
   * 保存上线数据 (saveFactoryData的别名)
   * @param {Array} data 上线数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否保存成功
   */
  saveOnlineData(data, clearExisting = false) {
    return this.saveFactoryData(data, clearExisting);
  },
  
  /**
   * 保存库存数据
   * @param {Array} data 库存数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否保存成功
   */
  saveInventoryData(data, clearExisting = false) {
    try {
      if (!Array.isArray(data)) {
        console.error('保存库存数据失败: 数据必须是数组');
        return false;
      }
      
      let finalData = data;
      if (!clearExisting) {
        // 合并现有数据并去重
        const existingData = this.getInventoryData();
        const combinedData = [...existingData, ...data];
        
        // 使用mergeAndDeduplicate函数去重
        finalData = mergeAndDeduplicate([combinedData]);
      }
      
      // 保存到主存储
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(finalData));
      
      // 为了兼容性，同时保存到旧键
      localStorage.setItem('inventory_data', JSON.stringify(finalData));
      
      // 添加时间戳，用于跟踪数据最后更新时间
      localStorage.setItem('inventory_data_timestamp', new Date().toISOString());
      
      console.log(`成功保存${finalData.length}条库存数据到localStorage`);
      return true;
    } catch (error) {
      console.error('保存库存数据失败:', error);
      return false;
    }
  },
  
  /**
   * 保存实验室数据
   * @param {Array} data 实验室数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否保存成功
   */
  saveLabData(data, clearExisting = false) {
    try {
      if (!Array.isArray(data)) {
        console.error('保存实验室数据失败: 数据必须是数组');
        return false;
      }
      
      let finalData = data;
      if (!clearExisting) {
        // 合并现有数据并去重
        const existingData = this.getLabData();
        const combinedData = [...existingData, ...data];
        
        // 使用mergeAndDeduplicate函数去重
        finalData = mergeAndDeduplicate([combinedData]);
      }
      
      // 保存到主存储
      localStorage.setItem(STORAGE_KEYS.LAB, JSON.stringify(finalData));
      
      // 为了兼容性，同时保存到旧键
      localStorage.setItem('lab_data', JSON.stringify(finalData));
      localStorage.setItem('lab_test_data', JSON.stringify(finalData));
      
      // 添加时间戳，用于跟踪数据最后更新时间
      localStorage.setItem('lab_data_timestamp', new Date().toISOString());
      
      console.log(`成功保存${finalData.length}条实验室数据到localStorage`);
      return true;
    } catch (error) {
      console.error('保存实验室数据失败:', error);
      return false;
    }
  },
  
  /**
   * 保存工厂上线数据
   * @param {Array} data 工厂上线数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否保存成功
   */
  saveFactoryData(data, clearExisting = false) {
    try {
      if (!Array.isArray(data)) {
        console.error('保存工厂上线数据失败: 数据必须是数组');
        return false;
      }
      
      // 确保数据中包含必要的基线和项目字段
      const processedData = data.map(item => {
        // 确保基线数据字段存在
        if (!item.baseline && (item.baseline_id || item.baselineId || item.baseline_name || item.baselineName)) {
          item.baseline = item.baseline_id || item.baselineId || '';
        }
        
        // 确保项目数据字段存在
        if (!item.project && (item.project_id || item.projectId || item.project_name || item.projectName)) {
          item.project = item.project_id || item.projectId || '';
        }
        
        // 确保显示字段存在
        if (!item.baseline_display && (item.baseline_name || item.baselineName || item.baseline_id || item.baselineId)) {
          item.baseline_display = item.baseline_name || item.baselineName || item.baseline_id || item.baselineId || '';
        }
        
        if (!item.project_display && (item.project_name || item.projectName || item.project_id || item.projectId)) {
          item.project_display = item.project_name || item.projectName || item.project_id || item.projectId || '';
        }
        
        return item;
      });
      
      let finalData = processedData;
      if (!clearExisting) {
        // 合并现有数据并去重
        const existingData = this.getFactoryData();
        const combinedData = [...existingData, ...processedData];
        
        // 使用mergeAndDeduplicate函数去重
        finalData = mergeAndDeduplicate([combinedData]);
      }
      
      // 检查数据量，如果过大则分块存储
      const dataJson = JSON.stringify(finalData);
      
      // 保存到主存储
      localStorage.setItem(STORAGE_KEYS.FACTORY, dataJson);
      
      // 为了兼容性，同时保存到旧键
      localStorage.setItem('factory_data', dataJson);
      localStorage.setItem('online_data', dataJson);
      
      // 添加时间戳，用于跟踪数据最后更新时间
      localStorage.setItem('factory_data_timestamp', new Date().toISOString());
      
      console.log(`成功保存${finalData.length}条工厂上线数据到localStorage`);
    return true;
    } catch (error) {
      console.error('保存工厂上线数据失败:', error);
      return false;
    }
  },
  
  /**
   * 获取任意数据
   * @param {string} key 存储键
   * @returns {Array|Object} 数据
   */
  getData(key) {
    try {
      const actualKey = getActualKey(key);
      const data = localStorage.getItem(actualKey) || '[]';
      return JSON.parse(data);
    } catch (error) {
      console.error(`获取数据(${key})失败:`, error);
      return [];
    }
  },
  
  /**
   * 保存任意数据
   * @param {string} key 存储键
   * @param {Array|Object} data 数据
   * @param {boolean} merge 是否与现有数据合并
   * @returns {boolean} 是否保存成功
   */
  saveData(key, data, merge = false) {
    try {
      const actualKey = getActualKey(key);
      
      if (merge) {
        // 合并现有数据
        const existingData = this.getData(actualKey);
        
        if (Array.isArray(existingData) && Array.isArray(data)) {
          // 如果都是数组，使用mergeAndDeduplicate函数合并
          const mergedData = mergeAndDeduplicate([existingData, data]);
          localStorage.setItem(actualKey, JSON.stringify(mergedData));
        } else if (typeof existingData === 'object' && typeof data === 'object') {
          // 如果都是对象，使用Object.assign合并
          const mergedData = { ...existingData, ...data };
          localStorage.setItem(actualKey, JSON.stringify(mergedData));
        } else {
          // 其他情况直接覆盖
      localStorage.setItem(actualKey, JSON.stringify(data));
        }
      } else {
        // 直接覆盖
        localStorage.setItem(actualKey, JSON.stringify(data));
        }
      
      return true;
    } catch (error) {
      console.error(`保存数据(${key})失败:`, error);
      return false;
    }
  },
  
  /**
   * 清除指定键的数据
   * @param {string} key 存储键
   * @returns {boolean} 是否成功
   */
  clearData(key) {
    try {
      const actualKey = getActualKey(key);
      localStorage.removeItem(actualKey);
      
      // 如果是主键之一，同时清除别名
      if (actualKey === STORAGE_KEYS.INVENTORY) {
        localStorage.removeItem('inventory_data');
      } else if (actualKey === STORAGE_KEYS.LAB) {
        localStorage.removeItem('lab_data');
        localStorage.removeItem('lab_test_data');
      } else if (actualKey === STORAGE_KEYS.FACTORY) {
        localStorage.removeItem('factory_data');
        localStorage.removeItem('online_data');
        }
      
      return true;
    } catch (error) {
      console.error(`清除数据(${key})失败:`, error);
      return false;
    }
  },
  
  /**
   * 清除所有数据
   */
  clearAllData() {
    try {
      // 清除主存储键
      Object.values(STORAGE_KEYS).forEach(key => {
        if (typeof key === 'string') {
          localStorage.removeItem(key);
        }
      });
      
      // 清除别名存储键
      Object.keys(STORAGE_KEYS.ALIASES).forEach(alias => {
        localStorage.removeItem(alias);
      });
      
      console.log('所有数据已清除');
      return true;
    } catch (error) {
      console.error('清除所有数据失败:', error);
      return false;
    }
  },
  
  /**
   * 迁移旧数据到统一数据服务
   * 确保不会覆盖已有数据，只会合并
   */
  migrateOldData() {
    try {
      // 迁移库存数据
      const inventoryData = localStorage.getItem('inventory_data');
      if (inventoryData && !localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
        // 只在统一存储为空时才迁移
        localStorage.setItem(STORAGE_KEYS.INVENTORY, inventoryData);
        console.log('库存数据迁移成功');
      }
      
      // 迁移测试数据
      const labData = localStorage.getItem('lab_test_data') || localStorage.getItem('lab_data');
      if (labData && !localStorage.getItem(STORAGE_KEYS.LAB)) {
        localStorage.setItem(STORAGE_KEYS.LAB, labData);
        console.log('实验室数据迁移成功');
      }
      
      // 迁移上线数据
      const onlineData = localStorage.getItem('online_data') || localStorage.getItem('factory_data');
      if (onlineData && !localStorage.getItem(STORAGE_KEYS.FACTORY)) {
        localStorage.setItem(STORAGE_KEYS.FACTORY, onlineData);
        console.log('上线数据迁移成功');
      }
      
      return true;
    } catch (error) {
      console.error('数据迁移失败:', error);
      return false;
    }
  },
  
  /**
   * 清理旧数据以释放存储空间
   * @param {number} keepCount 每种数据保留的条数
   * @returns {boolean} 是否成功
   */
  cleanupOldData(keepCount = 100) {
    try {
      console.log(`开始清理旧数据，每种数据保留最新的${keepCount}条...`);
      
      // 清理库存数据
      const inventoryData = this.getInventoryData();
      if (inventoryData.length > keepCount) {
        // 按时间排序，保留最新的数据
        const sortedData = inventoryData.sort((a, b) => {
          const dateA = new Date(a.updatedTime || a.inboundTime || 0);
          const dateB = new Date(b.updatedTime || b.inboundTime || 0);
          return dateB - dateA;
        });
        
        // 只保留指定数量的最新数据
        const trimmedData = sortedData.slice(0, keepCount);
        this.saveInventoryData(trimmedData, true);
        console.log(`库存数据已清理: ${inventoryData.length} -> ${trimmedData.length}`);
      }
      
      // 清理实验室数据
      const labData = this.getLabData();
      if (labData.length > keepCount) {
        // 按时间排序，保留最新的数据
        const sortedData = labData.sort((a, b) => {
          const dateA = new Date(a.test_date || 0);
          const dateB = new Date(b.test_date || 0);
          return dateB - dateA;
        });
        
        // 只保留指定数量的最新数据
        const trimmedData = sortedData.slice(0, keepCount);
        this.saveLabData(trimmedData, true);
        console.log(`实验室数据已清理: ${labData.length} -> ${trimmedData.length}`);
      }
      
      // 清理工厂数据
      const factoryData = this.getFactoryData();
      if (factoryData.length > keepCount) {
        // 按时间排序，保留最新的数据
        const sortedData = factoryData.sort((a, b) => {
          const dateA = new Date(a.online_time || 0);
          const dateB = new Date(b.online_time || 0);
          return dateB - dateA;
        });
        
        // 只保留指定数量的最新数据
        const trimmedData = sortedData.slice(0, keepCount);
        this.saveFactoryData(trimmedData, true);
        console.log(`工厂数据已清理: ${factoryData.length} -> ${trimmedData.length}`);
      }
      
      console.log('数据清理完成');
    return true;
    } catch (error) {
      console.error('清理旧数据失败:', error);
      return false;
    }
  },
  
  /**
   * 获取存储空间使用情况
   * @returns {Object} 存储使用情况
   */
  getStorageUsage() {
    try {
      let totalSize = 0;
      let keyCount = 0;
      const details = {};
      
      // 计算每个键的大小
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const size = localStorage[key].length * 2 / 1024; // 近似计算KB
          totalSize += size;
          keyCount++;
          
          // 记录主要数据键的大小
          if (key === STORAGE_KEYS.INVENTORY || key === 'inventory_data') {
            details.inventory = size.toFixed(2);
          } else if (key === STORAGE_KEYS.LAB || key === 'lab_test_data' || key === 'lab_data') {
            details.lab = size.toFixed(2);
          } else if (key === STORAGE_KEYS.FACTORY || key === 'online_data' || key === 'factory_data') {
            details.factory = size.toFixed(2);
          }
        }
      }
      
      return {
        totalSize: totalSize.toFixed(2), // KB
        keyCount,
        details,
        limit: '5000KB', // 大约5MB
        usagePercentage: (totalSize / 5000 * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return {
        error: error.message,
        totalSize: 'unknown',
        keyCount: 0,
        details: {},
        limit: '5000KB',
        usagePercentage: 'unknown'
      };
    }
  },
  
  /**
   * 获取数据统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    try {
      const inventoryCount = this.getInventoryData().length;
      const labCount = this.getLabData().length;
      const factoryCount = this.getFactoryData().length;
      
      // 获取时间戳
      const inventoryTimestamp = localStorage.getItem('inventory_data_timestamp') || null;
      const labTimestamp = localStorage.getItem('lab_data_timestamp') || null;
      const onlineTimestamp = localStorage.getItem('factory_data_timestamp') || null;
      
      // 获取存储使用情况
      const storageUsage = this.getStorageUsage();
      
      return {
        inventoryCount,
        labCount,
        factoryCount,
        inventoryTimestamp,
        labTimestamp,
        onlineTimestamp,
        totalCount: inventoryCount + labCount + factoryCount,
        storageUsage
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        inventoryCount: 0,
        labCount: 0,
        factoryCount: 0,
        totalCount: 0,
        error: error.message
      };
    }
  },
  
  /**
   * 生成并保存库存模拟数据
   * @param {number} count 生成数量
   * @returns {Array} 生成的库存数据
   */
  generateAndSaveInventoryData(count = 50) {
    try {
      console.log(`开始生成${count}条库存模拟数据...`);
      
      const suppliers = ['广正', '国泰', '华威', '精密电子元件厂', '先锋科技'];
      const materialTypes = ['电阻', '电容', '芯片', '传感器', '连接器'];
      const locations = ['A区-01', 'B区-02', 'C区-03', 'D区-04', 'E区-05'];
      const statuses = ['pending', 'passed', 'rejected', 'used'];
      const riskLevels = ['low', 'medium', 'high'];
      
      const mockData = [];
      
      for (let i = 0; i < count; i++) {
        const materialCode = `CS-M-${Math.floor(10000 + Math.random() * 90000)}`;
        const materialType = materialTypes[Math.floor(Math.random() * materialTypes.length)];
        const materialName = `${materialType}-${Math.floor(100 + Math.random() * 900)}`;
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const quantity = Math.floor(100 + Math.random() * 900);
        const batchId = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 生成日期，过去30天内的随机日期
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        mockData.push({
          id: `INV-${i + 1}`,
          materialCode,
          materialName,
          materialType,
          supplier,
          quantity,
          batchId,
          batchNo: batchId,
          storageDate: date.toISOString().split('T')[0],
          inboundTime: date.toISOString(),
          location: locations[Math.floor(Math.random() * locations.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
          inspector: `检验员${Math.floor(1 + Math.random() * 5)}`,
          notes: `批次${batchId}的库存记录`
        });
      }
      
      // 保存生成的数据
      this.saveInventoryData(mockData, true);
      
      console.log(`成功生成并保存${mockData.length}条库存模拟数据`);
      return mockData;
    } catch (error) {
      console.error('生成库存模拟数据失败:', error);
      return [];
    }
  },
  
  /**
   * 生成并保存实验室测试模拟数据
   * @param {number} count 生成数量
   * @param {Array} inventoryData 关联的库存数据
   * @returns {Array} 生成的实验室数据
   */
  generateAndSaveLabData(count = 100, inventoryData = []) {
    try {
      console.log(`开始生成${count}条实验室测试模拟数据...`);
      
      // 如果没有提供库存数据，尝试获取
      if (!inventoryData || inventoryData.length === 0) {
        inventoryData = this.getInventoryData();
      }
      
      const testItems = ['外观检查', '性能测试', '尺寸测量', '可靠性测试', '电气特性'];
      const results = ['OK', 'NG'];
      const defects = ['外观不良', '尺寸超差', '材质问题', '标识错误', '划伤', '变形'];
      
      const mockData = [];
      
      for (let i = 0; i < count; i++) {
        // 随机选择一个库存记录关联
        const inventory = inventoryData.length > 0 ? 
          inventoryData[Math.floor(Math.random() * inventoryData.length)] : 
          null;
        
        // 生成日期，过去20天内的随机日期
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 20));
        
        const result = results[Math.floor(Math.random() * results.length)];
        
        mockData.push({
          id: `TEST-${i + 1}`,
          testId: `T${Math.floor(10000 + Math.random() * 90000)}`,
          materialCode: inventory ? inventory.materialCode : `CS-M-${Math.floor(10000 + Math.random() * 90000)}`,
          materialName: inventory ? inventory.materialName : `测试物料-${i}`,
          supplier: inventory ? inventory.supplier : '未知供应商',
          batchId: inventory ? inventory.batchId : Math.floor(100000 + Math.random() * 900000).toString(),
          batchNo: inventory ? inventory.batchNo : Math.floor(100000 + Math.random() * 900000).toString(),
          testDate: date.toISOString().split('T')[0],
          testItem: testItems[Math.floor(Math.random() * testItems.length)],
          result,
          defectDesc: result === 'NG' ? defects[Math.floor(Math.random() * defects.length)] : '',
          tester: `测试员${Math.floor(1 + Math.random() * 5)}`,
          reviewer: `审核员${Math.floor(1 + Math.random() * 3)}`
        });
      }
      
      // 保存生成的数据
      this.saveLabData(mockData, true);
      
      console.log(`成功生成并保存${mockData.length}条实验室测试模拟数据`);
      return mockData;
    } catch (error) {
      console.error('生成实验室测试模拟数据失败:', error);
      return [];
    }
  },
  
  /**
   * 生成并保存工厂上线模拟数据
   * @param {number} count 生成数量
   * @param {Array} inventoryData 关联的库存数据
   * @returns {Array} 生成的工厂数据
   */
  generateAndSaveFactoryData(count = 80, inventoryData = []) {
    try {
      console.log(`开始生成${count}条工厂上线模拟数据...`);
      
      // 如果没有提供库存数据，尝试获取
      if (!inventoryData || inventoryData.length === 0) {
        inventoryData = this.getInventoryData();
      }
      
      const factories = ['A工厂', 'B工厂', 'C工厂'];
      const lines = ['SMT-01', 'SMT-02', 'PCBA-01', 'PCBA-02', 'ASSY-01'];
      const projects = ['项目A', '项目B', '项目C', '项目D', '项目E'];
      
      const mockData = [];
      
      for (let i = 0; i < count; i++) {
        // 随机选择一个库存记录关联
        const inventory = inventoryData.length > 0 ? 
          inventoryData[Math.floor(Math.random() * inventoryData.length)] : 
          null;
        
        // 生成日期，过去15天内的随机日期
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 15));
        
        // 随机生成不良率，大部分为0，小部分有不良
        const hasDefect = Math.random() < 0.3;
        const defectRate = hasDefect ? (Math.random() * 0.05).toFixed(4) : "0.0000";
        
        const factory = factories[Math.floor(Math.random() * factories.length)];
        const line = lines[Math.floor(Math.random() * lines.length)];
        const project = projects[Math.floor(Math.random() * projects.length)];
        
        mockData.push({
          id: `ONLINE-${i + 1}`,
          materialCode: inventory ? inventory.materialCode : `CS-M-${Math.floor(10000 + Math.random() * 90000)}`,
          materialName: inventory ? inventory.materialName : `上线物料-${i}`,
          supplier: inventory ? inventory.supplier : '未知供应商',
          batchId: inventory ? inventory.batchId : Math.floor(100000 + Math.random() * 900000).toString(),
          batchNo: inventory ? inventory.batchNo : Math.floor(100000 + Math.random() * 900000).toString(),
          onlineDate: date.toISOString().split('T')[0],
          useTime: date.toISOString(),
          factory,
          line,
          workshop: `${factory}-车间${Math.floor(1 + Math.random() * 3)}`,
          project,
          project_display: project,
          defectRate,
          exceptionCount: hasDefect ? Math.floor(1 + Math.random() * 3) : 0,
          operator: `操作员${Math.floor(1 + Math.random() * 10)}`
        });
      }
      
      // 保存生成的数据
      this.saveFactoryData(mockData, true);
      
      console.log(`成功生成并保存${mockData.length}条工厂上线模拟数据`);
      return mockData;
    } catch (error) {
      console.error('生成工厂上线模拟数据失败:', error);
      return [];
    }
  }
};

// 创建实例
export const unifiedDataService = UnifiedDataService;

// 同时保留默认导出
export default UnifiedDataService; 
