/**
 * 数据同步服务
 * 用于在前端和后端之间同步数据
 */
import { APIService } from './api/APIService';
import { useIQEStore } from '../stores';
import { ElMessage } from 'element-plus';

export class DataSyncService {
  /**
   * 同步所有数据
   * @returns {Promise<boolean>} 同步是否成功
   */
  static async syncAllData() {
    let store;
    
    try {
      store = useIQEStore();
    } catch (error) {
      console.error('无法获取IQE Store:', error);
      ElMessage.error('数据存储初始化失败，请刷新页面重试');
      return false;
    }
    
    try {
      console.log('开始同步所有数据...');
      
      // 测试API连接
      const isConnected = await APIService.testConnection().catch(() => false);
      if (!isConnected) {
        console.warn('API服务不可用，将使用模拟数据');
        ElMessage.warning('API服务不可用，使用本地模拟数据');
      }
      
      // 同步库存数据
      await this.syncInventoryData(store);
      
      // 同步实验室测试数据
      await this.syncLabTestData(store);
      
      // 同步质量管理数据
      await this.syncQualityData(store);
      
      console.log('数据同步完成');
      return true;
    } catch (error) {
      console.error('数据同步失败:', error);
      ElMessage.error('数据同步失败: ' + (error.message || '未知错误'));
      return false;
    }
  }
  
  /**
   * 同步库存数据
   * @param {Object} store IQE Store实例
   * @returns {Promise<void>}
   */
  static async syncInventoryData(store) {
    if (!store) {
      try {
        store = useIQEStore();
      } catch (error) {
        console.error('无法获取IQE Store:', error);
        return;
      }
    }
    
    try {
      console.log('同步库存数据...');
      // 获取API数据
      const response = await APIService.getInventoryList();
      
      if (response && response.data) {
        // 确认store实例有updateInventoryData方法
        if (typeof store.updateInventoryData === 'function') {
          // 更新store中的数据
          store.updateInventoryData(response.data);
          console.log('库存数据同步成功');
        } else {
          console.error('store中没有updateInventoryData方法');
        }
      } else {
        console.warn('没有收到有效的库存数据');
      }
    } catch (error) {
      console.error('库存数据同步失败:', error);
      
      try {
        // 尝试使用APIService中的模拟数据
        const mockData = APIService.getMockData('inventory');
        if (mockData && mockData.data && typeof store.updateInventoryData === 'function') {
          store.updateInventoryData(mockData.data);
          console.log('使用模拟库存数据');
        }
      } catch (mockError) {
        console.error('使用模拟库存数据失败:', mockError);
      }
    }
  }
  
  /**
   * 同步实验室测试数据
   * @param {Object} store IQE Store实例
   * @returns {Promise<void>}
   */
  static async syncLabTestData(store) {
    if (!store) {
      try {
        store = useIQEStore();
      } catch (error) {
        console.error('无法获取IQE Store:', error);
        return;
      }
    }
    
    try {
      console.log('同步实验室测试数据...');
      // 获取API数据
      const response = await APIService.getLabTestList();
      
      if (response && response.data) {
        // 确认store实例有updateLabTestData方法
        if (typeof store.updateLabTestData === 'function') {
          // 更新store中的数据
          store.updateLabTestData(response.data);
          console.log('实验室测试数据同步成功');
        } else {
          console.error('store中没有updateLabTestData方法');
        }
      } else {
        console.warn('没有收到有效的实验室测试数据');
      }
    } catch (error) {
      console.error('实验室测试数据同步失败:', error);
      
      try {
        // 尝试使用APIService中的模拟数据
        const mockData = APIService.getMockData('labTests');
        if (mockData && mockData.data && typeof store.updateLabTestData === 'function') {
          store.updateLabTestData(mockData.data);
          console.log('使用模拟实验室测试数据');
        }
      } catch (mockError) {
        console.error('使用模拟实验室测试数据失败:', mockError);
      }
    }
  }
  
  /**
   * 同步质量管理数据
   * @param {Object} store IQE Store实例
   * @returns {Promise<void>}
   */
  static async syncQualityData(store) {
    if (!store) {
      try {
        store = useIQEStore();
      } catch (error) {
        console.error('无法获取IQE Store:', error);
        return;
      }
    }
    
    try {
      console.log('同步质量问题数据...');
      // 获取质量问题数据
      const issuesResponse = await APIService.getQualityIssueList();
      
      if (issuesResponse && issuesResponse.data) {
        // 确认store实例有updateQualityIssueData方法
        if (typeof store.updateQualityIssueData === 'function') {
          // 更新store中的数据
          store.updateQualityIssueData(issuesResponse.data);
          console.log('质量问题数据同步成功');
        } else {
          console.error('store中没有updateQualityIssueData方法');
        }
      } else {
        console.warn('没有收到有效的质量问题数据');
      }
    } catch (error) {
      console.error('质量管理数据同步失败:', error);
      
      try {
        // 尝试使用APIService中的模拟数据
        const mockData = APIService.getMockData('qualityIssues');
        if (mockData && mockData.data && typeof store.updateQualityIssueData === 'function') {
          store.updateQualityIssueData(mockData.data);
          console.log('使用模拟质量管理数据');
        }
      } catch (mockError) {
        console.error('使用模拟质量管理数据失败:', mockError);
      }
    }
  }
  
  /**
   * 将本地更改推送到服务器并同步数据
   * @param {string} dataType 数据类型
   * @param {Object} data 数据对象
   * @param {Object} store 数据存储
   * @returns {Promise<boolean>} 推送是否成功
   */
  static async pushChangesToServerAndSync(dataType, data, store) {
    if (!store) {
      try {
        store = useIQEStore();
      } catch (error) {
        console.error('无法获取IQE Store:', error);
        ElMessage.error('数据存储初始化失败');
        return false;
      }
    }
    
    try {
      console.log(`推送${dataType}数据到服务器...`, data);
      let response;
      let success = false;
      
      switch (dataType) {
        case 'inventory':
          // 根据是否有ID决定是创建还是更新
          if (data.inventory_id) {
            response = await APIService.updateInventory(data.inventory_id, data);
          } else {
            response = await APIService.createInventory(data);
          }
          // 更新本地数据
          if (response && response.success) {
            await this.syncInventoryData(store);
            success = true;
          }
          break;
          
        case 'labTest':
          // 根据是否有ID决定是创建还是更新
          if (data.test_id) {
            response = await APIService.updateLabTest(data.test_id, data);
          } else {
            response = await APIService.createLabTest(data);
          }
          // 更新本地数据
          if (response && response.success) {
            await this.syncLabTestData(store);
            success = true;
          }
          break;
          
        case 'qualityIssue':
          // 根据是否有ID决定是创建还是更新
          if (data.issue_id) {
            response = await APIService.updateQualityIssue(data.issue_id, data);
          } else {
            response = await APIService.createQualityIssue(data);
          }
          // 更新本地数据
          if (response && response.success) {
            await this.syncQualityData(store);
            success = true;
          }
          break;
          
        case 'freezeBatch':
          response = await APIService.freezeBatch(data);
          // 更新本地数据
          if (response && response.success) {
            await this.syncInventoryData(store);
            success = true;
          }
          break;
          
        case 'releaseBatch':
          response = await APIService.releaseBatch(data);
          // 更新本地数据
          if (response && response.success) {
            await this.syncInventoryData(store);
            success = true;
          }
          break;
          
        default:
          console.error(`未知的数据类型: ${dataType}`);
          ElMessage.error(`未知的数据类型: ${dataType}`);
          return false;
      }
      
      if (success) {
        console.log(`${dataType}数据推送成功`);
        ElMessage.success(`${dataType}数据更新成功`);
      } else {
        console.warn(`${dataType}数据推送失败或服务器拒绝了请求`);
        ElMessage.warning(`${dataType}数据更新失败`);
      }
      
      return success;
    } catch (error) {
      console.error(`推送更改失败 (${dataType}):`, error);
      ElMessage.error(`推送更改失败: ${error.message || '未知错误'}`);
      return false;
    }
  }
} 