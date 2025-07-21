/**
 * 质量管理服务
 * 处理质量问题和测试相关的数据操作
 */

import { ref } from 'vue';
import apiClient from '../api/ApiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { DataTransformer } from '../api/DataTransformer';

// 质量事件状态
export const QUALITY_EVENT_STATUS = {
  OPEN: 'open',           // 待处理
  IN_PROGRESS: 'in_progress', // 处理中
  RESOLVED: 'resolved',   // 已解决
  CLOSED: 'closed',       // 已关闭
  POSTPONED: 'postponed'  // 已推迟
};

// 风险级别
export const RISK_LEVELS = {
  LOW: 'low',         // 低风险
  MEDIUM: 'medium',   // 中等风险
  HIGH: 'high',       // 高风险
  CRITICAL: 'critical' // 致命风险
};

class QualityService {
  constructor() {
    this.qualityIssues = ref([]);
    this.qualityMetrics = ref({});
    this.initialized = false;
  }

  /**
   * 初始化质量服务
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 加载质量问题数据
      const storedIssues = localStorage.getItem('quality_issues');
      if (storedIssues) {
        this.qualityIssues.value = JSON.parse(storedIssues);
      }

      // 加载质量指标
      this._initializeMetrics();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('初始化质量服务失败:', error);
      return false;
    }
  }

  /**
   * 初始化质量指标
   */
  _initializeMetrics() {
    this.qualityMetrics.value = {
      firstTimePassRate: 92.8,
      defectRate: 1.2,
      materialRejectionRate: 2.5,
      averageResolutionTime: 3.2, // 天
      criticalIssuesCount: 3,
      openIssuesCount: 12
    };
  }
  
  /**
   * 获取所有质量问题
   */
  getAllIssues() {
    return this.qualityIssues.value;
  }
  
  /**
   * 获取质量指标
   */
  getQualityMetrics() {
    return this.qualityMetrics.value;
  }
  
  /**
   * 根据ID获取质量问题
   */
  getIssueById(id) {
    return this.qualityIssues.value.find(issue => issue.id === id);
  }

  /**
   * 根据批次号获取质量问题
   */
  getIssuesByBatchNo(batchNo) {
    return this.qualityIssues.value.filter(issue => issue.batchNo === batchNo);
  }
  
  /**
   * 添加质量问题
   */
  addIssue(issue) {
    // 确保有ID
    if (!issue.id) {
      issue.id = `QI-${Date.now()}`;
      }

    // 添加创建时间
    if (!issue.createdAt) {
      issue.createdAt = new Date().toISOString();
      }

    // 设置初始状态
    if (!issue.status) {
      issue.status = QUALITY_EVENT_STATUS.OPEN;
    }
    
    this.qualityIssues.value.push(issue);
    this._saveIssuesToStorage();
    
    // 更新指标
    this._updateMetricsAfterChange();
    
    return issue;
  }

  /**
   * 更新质量问题
   */
  updateIssue(id, updates) {
    const index = this.qualityIssues.value.findIndex(issue => issue.id === id);
    if (index === -1) {
      throw new Error(`未找到ID为 ${id} 的质量问题`);
      }

    this.qualityIssues.value[index] = {
      ...this.qualityIssues.value[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this._saveIssuesToStorage();
    this._updateMetricsAfterChange();
    
    return this.qualityIssues.value[index];
  }

  /**
   * 关闭质量问题
   */
  closeIssue(id, resolution) {
    return this.updateIssue(id, {
      status: QUALITY_EVENT_STATUS.CLOSED,
      resolution,
      closedAt: new Date().toISOString()
    });
  }

  /**
   * 重新打开质量问题
   */
  reopenIssue(id, reason) {
    return this.updateIssue(id, {
      status: QUALITY_EVENT_STATUS.OPEN,
      reopenReason: reason,
      reopenedAt: new Date().toISOString()
    });
  }

  /**
   * 批量更新质量问题
   */
  bulkUpdateIssues(updates) {
    if (!Array.isArray(updates)) {
      throw new Error('更新必须是数组格式');
      }

    const updatedIssues = [];
    
    updates.forEach(update => {
      try {
        const updatedIssue = this.updateIssue(update.id, update.changes);
        updatedIssues.push(updatedIssue);
    } catch (error) {
        console.error(`更新问题 ${update.id} 失败:`, error);
    }
    });
    
    return updatedIssues;
  }
  
  /**
   * 在添加或更新质量问题后更新指标
   */
  _updateMetricsAfterChange() {
    // 计算开放的问题数量
    const openIssues = this.qualityIssues.value.filter(
      issue => issue.status === QUALITY_EVENT_STATUS.OPEN || 
              issue.status === QUALITY_EVENT_STATUS.IN_PROGRESS
    );
    
    this.qualityMetrics.value.openIssuesCount = openIssues.length;
    
    // 计算关键问题数量
    const criticalIssues = this.qualityIssues.value.filter(
      issue => issue.riskLevel === RISK_LEVELS.CRITICAL || 
              issue.riskLevel === RISK_LEVELS.HIGH
    );
    
    this.qualityMetrics.value.criticalIssuesCount = criticalIssues.length;
    }

  /**
   * 将质量问题保存到本地存储
   */
  _saveIssuesToStorage() {
    localStorage.setItem('quality_issues', JSON.stringify(this.qualityIssues.value));
  }

  /**
   * 获取实验室测试数据
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} - 实验室测试数据列表
   */
  async getLabTests(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.labTests.list, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取实验室测试数据失败');
      }

      return DataTransformer.transformLabTestList(response.data);
    } catch (error) {
      console.error('获取实验室测试数据错误:', error);
      throw error;
    }
  }

  /**
   * 获取实验室测试详情
   * @param {string} id - 测试ID
   * @returns {Promise<Object>} - 实验室测试详情
   */
  async getLabTestById(id) {
    try {
      if (!id) {
        throw new Error('测试ID不能为空');
      }

      const response = await apiClient.get(API_ENDPOINTS.labTests.detail(id));
      
      if (!response.success) {
        throw new Error(response.error || '获取实验室测试详情失败');
      }

      return DataTransformer.transformLabTest(response.data);
    } catch (error) {
      console.error('获取实验室测试详情错误:', error);
      throw error;
    }
  }
}

// 创建单例
const qualityService = new QualityService();
export default qualityService; 