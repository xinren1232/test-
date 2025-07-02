/**
 * API服务
 * 提供与后端API的通信功能
 * 注意：这是一个临时的基础架构，将在后续重新设计和实现
 */
import axios from 'axios';

// 配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
let MOCK_MODE = true; // 默认启用模拟模式

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

/**
 * API服务类
 */
export class APIService {
  /**
   * 初始化API服务
   * @param {Object} config 配置对象
   */
  static init(config = {}) {
    try {
      // 设置基本URL
      if (config.baseUrl) {
        apiClient.defaults.baseURL = config.baseUrl;
        console.log('API基本URL已设置:', config.baseUrl);
      }
      
      // 测试连接
      this.testConnection();
      
      return true;
    } catch (error) {
      console.error('API服务初始化失败:', error);
      return false;
    }
  }
  
  /**
   * 测试API连接
   * @returns {Promise<boolean>} 连接是否成功
   */
  static async testConnection() {
    try {
      // 尝试连接API健康检查端点
      console.log('尝试连接API...');
      
      // 临时使用模拟数据，后续将实现真实连接
      MOCK_MODE = true;
      console.log('API测试：当前使用模拟数据模式');
      
      return true;
    } catch (error) {
      console.error('API连接测试失败:', error);
      MOCK_MODE = true;
      return false;
    }
  }
  
  /**
   * 获取模拟数据
   * @param {string} type 数据类型
   * @returns {Object} 模拟数据
   */
  static getMockData(type) {
    // 基本的模拟数据结构
    const mockData = {
      success: true,
      data: [],
      message: '这是模拟数据'
    };
    
    return mockData;
  }
  
  /**
   * 获取质量指标数据
   * @param {string} productId 产品ID
   * @returns {Promise} 响应Promise
   */
  static async getQualityMetrics(productId) {
    return this.getMockData('quality_metrics');
  }
  
  /**
   * 获取实验室测试结果
   * @param {string} batchId 批次ID
   * @returns {Promise} 响应Promise
   */
  static async getLabResults(batchId) {
    return this.getMockData('lab_results');
  }
  
  /**
   * 获取库存列表
   * @returns {Promise} 响应Promise
   */
  static async getInventoryList() {
    return this.getMockData('inventory');
  }
  
  /**
   * 获取实验室测试列表
   * @returns {Promise} 响应Promise
   */
  static async getLabTestList() {
    return this.getMockData('labTests');
  }
  
  /**
   * 获取质量问题列表
   * @returns {Promise} 响应Promise
   */
  static async getQualityIssueList() {
    return this.getMockData('qualityIssues');
  }
}

export default APIService;