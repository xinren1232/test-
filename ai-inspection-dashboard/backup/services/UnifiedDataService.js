/**
 * 统一数据服务
 * 集中管理所有系统数据，解决数据不一致问题
 */

import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import DataGenerationRules, { DATA_RELATION_RULES } from './DataGenerationRules.js';
import { 
  getAllMaterials, 
  getRandomSupplierForMaterial 
} from '../data/MaterialSupplierMap.js';

class UnifiedDataService {
  constructor() {
    this.isUpdating = ref(false);
    this.lastUpdateTime = ref(null);
    
    // 存储键定义
    this.STORAGE_KEYS = {
      INVENTORY: 'inventory_data',
      LAB: 'lab_data',
      FACTORY: 'factory_data'
    };
    
    // 数据统计
    this.stats = ref({
      inventoryCount: 0,
      labCount: 0,
      factoryCount: 0,
      lastUpdate: null
    });
    
    // 初始化时更新统计
    this.updateStats();
  }
  
  /**
   * 获取库存数据
   * @returns {Array} 库存数据数组
   */
  getInventoryData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.INVENTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取库存数据失败:', error);
      return [];
    }
  }
  
  /**
   * 获取测试数据
   * @returns {Array} 测试数据数组
   */
  getLabData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.LAB);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取测试数据失败:', error);
      return [];
    }
  }
  
  /**
   * 获取上线数据
   * @returns {Array} 上线数据数组
   */
  getFactoryData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.FACTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('获取上线数据失败:', error);
      return [];
    }
  }
  
  /**
   * 保存库存数据
   * @param {Array} data 库存数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveInventoryData(data, clearExisting = false) {
    try {
      const existingData = clearExisting ? [] : this.getInventoryData();
      const newData = clearExisting ? data : [...existingData, ...data];
      localStorage.setItem(this.STORAGE_KEYS.INVENTORY, JSON.stringify(newData));
      this.updateStats();
      return true;
    } catch (error) {
      console.error('保存库存数据失败:', error);
      return false;
    }
  }
  
  /**
   * 保存测试数据
   * @param {Array} data 测试数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveLabData(data, clearExisting = false) {
    try {
      const existingData = clearExisting ? [] : this.getLabData();
      const newData = clearExisting ? data : [...existingData, ...data];
      localStorage.setItem(this.STORAGE_KEYS.LAB, JSON.stringify(newData));
      
      // 移除旧的键，保持数据一致性
      if (localStorage.getItem('lab_test_data')) {
        localStorage.removeItem('lab_test_data');
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('保存测试数据失败:', error);
      return false;
    }
  }
  
  /**
   * 保存上线数据
   * @param {Array} data 上线数据
   * @param {boolean} clearExisting 是否清除现有数据
   * @returns {boolean} 是否成功
   */
  saveFactoryData(data, clearExisting = false) {
    try {
      const existingData = clearExisting ? [] : this.getFactoryData();
      const newData = clearExisting ? data : [...existingData, ...data];
      localStorage.setItem(this.STORAGE_KEYS.FACTORY, JSON.stringify(newData));
      
      // 移除旧的键，保持数据一致性
      if (localStorage.getItem('online_data')) {
        localStorage.removeItem('online_data');
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('保存上线数据失败:', error);
      return false;
    }
  }
  
  /**
   * 清除所有数据
   * @returns {boolean} 是否成功
   */
  clearAllData() {
    try {
      // 删除主要存储键
      localStorage.removeItem(this.STORAGE_KEYS.INVENTORY);
      localStorage.removeItem(this.STORAGE_KEYS.LAB);
      localStorage.removeItem(this.STORAGE_KEYS.FACTORY);
      
      // 删除旧的存储键，确保完全清除
      localStorage.removeItem('lab_test_data');
      localStorage.removeItem('online_data');
      localStorage.removeItem('baseline_data');
      localStorage.removeItem('inventory_data');
      
      // 确保所有相关数据都被清除
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.includes('data') || key.includes('test') || key.includes('online') || key.includes('baseline')) {
          localStorage.removeItem(key);
        }
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('清除所有数据失败:', error);
      return false;
    }
  }
  
  /**
   * 迁移旧数据到新的存储结构
   * @returns {boolean} 是否成功
   */
  migrateOldData() {
    try {
      let migrationPerformed = false;
      
      // 迁移库存数据
      const inventoryData = localStorage.getItem('inventory_data');
      if (inventoryData) {
        localStorage.setItem(this.STORAGE_KEYS.INVENTORY, inventoryData);
        migrationPerformed = true;
      }
      
      // 迁移测试数据（优先使用lab_data，如果不存在则使用lab_test_data）
      const labData = localStorage.getItem('lab_data');
      const labTestData = localStorage.getItem('lab_test_data');
      
      if (labData) {
        localStorage.setItem(this.STORAGE_KEYS.LAB, labData);
        migrationPerformed = true;
        
        // 如果lab_test_data存在且与lab_data不同，则合并数据
        if (labTestData && labTestData !== labData) {
          try {
            const labDataArray = JSON.parse(labData);
            const labTestDataArray = JSON.parse(labTestData);
            
            // 使用批次号作为唯一标识符合并数据
            const batchMap = new Map();
            labDataArray.forEach(item => batchMap.set(item.batchNo, item));
            labTestDataArray.forEach(item => {
              if (!batchMap.has(item.batchNo)) {
                batchMap.set(item.batchNo, item);
              }
            });
            
            const mergedData = Array.from(batchMap.values());
            localStorage.setItem(this.STORAGE_KEYS.LAB, JSON.stringify(mergedData));
            console.log(`已合并 ${labDataArray.length} 条lab_data和 ${labTestDataArray.length} 条lab_test_data数据，最终数据 ${mergedData.length} 条`);
          } catch (mergeError) {
            console.error('合并测试数据失败:', mergeError);
          }
        }
      } else if (labTestData) {
        localStorage.setItem(this.STORAGE_KEYS.LAB, labTestData);
        migrationPerformed = true;
      }
      
      // 迁移上线数据（优先使用factory_data，如果不存在则使用online_data）
      const factoryData = localStorage.getItem('factory_data');
      const onlineData = localStorage.getItem('online_data');
      
      if (factoryData) {
        localStorage.setItem(this.STORAGE_KEYS.FACTORY, factoryData);
        migrationPerformed = true;
        
        // 如果online_data存在且与factory_data不同，则合并数据
        if (onlineData && onlineData !== factoryData) {
          try {
            const factoryDataArray = JSON.parse(factoryData);
            const onlineDataArray = JSON.parse(onlineData);
            
            // 使用批次号作为唯一标识符合并数据
            const batchMap = new Map();
            factoryDataArray.forEach(item => batchMap.set(item.batchNo, item));
            onlineDataArray.forEach(item => {
              if (!batchMap.has(item.batchNo)) {
                batchMap.set(item.batchNo, item);
              }
            });
            
            const mergedData = Array.from(batchMap.values());
            localStorage.setItem(this.STORAGE_KEYS.FACTORY, JSON.stringify(mergedData));
            console.log(`已合并 ${factoryDataArray.length} 条factory_data和 ${onlineDataArray.length} 条online_data数据，最终数据 ${mergedData.length} 条`);
          } catch (mergeError) {
            console.error('合并上线数据失败:', mergeError);
          }
        }
      } else if (onlineData) {
        localStorage.setItem(this.STORAGE_KEYS.FACTORY, onlineData);
        migrationPerformed = true;
      }
      
      // 初始化空数据（如果没有数据）
      if (!localStorage.getItem(this.STORAGE_KEYS.INVENTORY)) {
        localStorage.setItem(this.STORAGE_KEYS.INVENTORY, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(this.STORAGE_KEYS.LAB)) {
        localStorage.setItem(this.STORAGE_KEYS.LAB, JSON.stringify([]));
      }
      
      if (!localStorage.getItem(this.STORAGE_KEYS.FACTORY)) {
        localStorage.setItem(this.STORAGE_KEYS.FACTORY, JSON.stringify([]));
      }
      
      // 更新统计
      this.updateStats();
      
      return true;
    } catch (error) {
      console.error('迁移旧数据失败:', error);
      return false;
    }
  }
  
  /**
   * 更新数据统计
   */
  updateStats() {
    try {
      this.stats.value = {
        inventoryCount: this.getInventoryData().length,
        labCount: this.getLabData().length,
        factoryCount: this.getFactoryData().length,
        lastUpdate: new Date().toLocaleString()
      };
    } catch (error) {
      console.error('更新数据统计失败:', error);
    }
  }
  
  /**
   * 导出所有数据
   * @returns {Object} 所有系统数据
   */
  exportAllData() {
    return {
      inventory: this.getInventoryData(),
      lab: this.getLabData(),
      factory: this.getFactoryData(),
      exportTime: new Date().toISOString()
    };
  }
  
  /**
   * 导入数据
   * @param {Object} data 要导入的数据
   * @returns {boolean} 是否成功
   */
  importData(data) {
    try {
      if (data.inventory) {
        this.saveInventoryData(data.inventory, true);
      }
      
      if (data.lab) {
        this.saveLabData(data.lab, true);
      }
      
      if (data.factory) {
        this.saveFactoryData(data.factory, true);
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
  
  /**
   * 清除上线数据
   * @returns {boolean} 是否成功
   */
  clearFactoryData() {
    try {
      // 删除上线数据存储键
      localStorage.removeItem(this.STORAGE_KEYS.FACTORY);
      
      // 删除旧的存储键，确保完全清除
      localStorage.removeItem('online_data');
      localStorage.removeItem('factory_data');
      
      // 清除其他可能包含上线数据的键
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (key.includes('online') || key.includes('factory')) {
          localStorage.removeItem(key);
        }
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('清除上线数据失败:', error);
      return false;
    }
  }
  
  /**
   * 清除物料状态一览数据
   * @returns {boolean} 是否成功
   */
  clearInventoryStatusData() {
    try {
      // 清除与物料状态相关的数据
      const inventoryData = this.getInventoryData();
      
      // 更新物料状态数据，清除状态信息
      const updatedData = inventoryData.map(item => {
        return {
          ...item,
          status: '',  // 清除状态
          quality: '', // 清除质量信息
          location: '' // 清除位置信息
        };
      });
      
      // 保存更新后的数据
      localStorage.setItem(this.STORAGE_KEYS.INVENTORY, JSON.stringify(updatedData));
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('清除物料状态一览数据失败:', error);
      return false;
    }
  }
}

// 创建单例
const unifiedDataService = new UnifiedDataService();

export default unifiedDataService; 