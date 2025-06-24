/**
 * 质量管理服务
 * 处理质量问题和测试相关的数据操作
 */

import apiClient from '../api/ApiClient';
import { API_ENDPOINTS } from '../api/endpoints';
import { DataTransformer } from '../api/DataTransformer';
import { ref } from 'vue';

class QualityService {
  constructor() {
    this.qualityIssues = ref([]);
    this.qualityMetrics = ref({});
    this.initialized = false;
  }
  
  /**
   * 初始化质量管理服务
   * @returns {Promise<boolean>} 初始化结果
   */
  async initialize() {
    if (this.initialized) return true;
    
    try {
      // 尝试从localStorage获取质量问题数据
      let qualityData = [];
      try {
        const dataStr = localStorage.getItem('quality_issues');
        if (dataStr) {
          qualityData = JSON.parse(dataStr);
        }
      } catch (error) {
        console.warn('从localStorage加载质量问题数据失败:', error);
      }
      
      // 如果本地没有数据，使用API获取
      if (qualityData.length === 0) {
        try {
          const response = await apiClient.get(API_ENDPOINTS.quality.issues);
          if (response.success) {
            qualityData = DataTransformer.transformQualityIssueList(response.data);
          }
        } catch (error) {
          console.warn('从API加载质量问题数据失败:', error);
          // 生成一些默认的质量问题数据
          qualityData = this.generateDefaultQualityIssues();
        }
      }
      
      this.qualityIssues.value = qualityData;
      
      // 生成质量指标数据
      this.qualityMetrics.value = this.calculateQualityMetrics(qualityData);
      
      this.initialized = true;
      console.log('质量管理服务初始化完成');
      return true;
    } catch (error) {
      console.error('初始化质量管理服务失败:', error);
      return false;
    }
  }
  
  /**
   * 生成默认质量问题数据
   * @returns {Array} 质量问题数据
   */
  generateDefaultQualityIssues() {
    const issues = [];
    const categories = ['原材料', '成品', '半成品', '包装材料'];
    const types = ['外观缺陷', '功能异常', '尺寸偏差', '物理性能不符', '化学性能不符', '包装破损', '标签错误', '批次混乱'];
    const levels = ['严重', '中等', '轻微'];
    const statuses = ['已解决', '处理中', '待处理', '已关闭'];
    
    for (let i = 0; i < 20; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createDate = new Date();
      createDate.setDate(createDate.getDate() - Math.floor(Math.random() * 30));
      
      issues.push({
        id: `QI-${String(1000 + i).padStart(4, '0')}`,
        title: `${category} - ${type}`,
        description: `发现${category}存在${type}问题，需要进行处理`,
        category,
        type,
        level,
        status,
        create_date: createDate.toISOString(),
        update_date: new Date().toISOString(),
        related_batch: `B${String(10000 + Math.floor(Math.random() * 90000))}`,
        responsible_person: ['张工', '李工', '王工', '赵工', '钱工'][Math.floor(Math.random() * 5)],
        solution: status === '已解决' ? '已完成处理，问题已解决' : '',
        impact: level === '严重' ? '可能导致产品质量严重问题' : level === '中等' ? '对产品质量有一定影响' : '对产品质量影响轻微'
      });
    }
    
    return issues;
  }
  
  /**
   * 计算质量指标
   * @param {Array} issues 质量问题数据
   * @returns {Object} 质量指标
   */
  calculateQualityMetrics(issues) {
    const total = issues.length;
    const solved = issues.filter(i => i.status === '已解决' || i.status === '已关闭').length;
    const critical = issues.filter(i => i.level === '严重').length;
    
    // 按类别统计
    const byCategory = {};
    issues.forEach(issue => {
      if (!byCategory[issue.category]) {
        byCategory[issue.category] = 0;
      }
      byCategory[issue.category]++;
    });
    
    // 按类型统计
    const byType = {};
    issues.forEach(issue => {
      if (!byType[issue.type]) {
        byType[issue.type] = 0;
      }
      byType[issue.type]++;
    });
    
    // 计算解决率
    const solveRate = total > 0 ? solved / total : 0;
    
    return {
      total,
      solved,
      critical,
      solveRate: (solveRate * 100).toFixed(2),
      byCategory,
      byType
    };
  }

  /**
   * 获取质量问题列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} - 质量问题列表
   */
  async getQualityIssues(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.quality.issues, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取质量问题列表失败');
      }

      return DataTransformer.transformQualityIssueList(response.data);
    } catch (error) {
      console.error('获取质量问题列表错误:', error);
      throw error;
    }
  }

  /**
   * 获取质量问题详情
   * @param {string} id - 质量问题ID
   * @returns {Promise<Object>} - 质量问题详情
   */
  async getQualityIssueById(id) {
    try {
      if (!id) {
        throw new Error('质量问题ID不能为空');
      }

      const response = await apiClient.get(API_ENDPOINTS.quality.issueDetail(id));
      
      if (!response.success) {
        throw new Error(response.error || '获取质量问题详情失败');
      }

      return DataTransformer.transformQualityIssue(response.data);
    } catch (error) {
      console.error('获取质量问题详情错误:', error);
      throw error;
    }
  }

  /**
   * 创建质量问题
   * @param {Object} issueData - 质量问题数据
   * @returns {Promise<Object>} - 创建的质量问题
   */
  async createQualityIssue(issueData) {
    try {
      if (!issueData) {
        throw new Error('质量问题数据不能为空');
      }

      // 验证数据
      const validation = this.validateQualityIssueData(issueData);
      if (!validation.valid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 将前端数据转换为API格式
      const apiData = DataTransformer.transformToApiFormat(issueData, 'qualityIssue');

      const response = await apiClient.post(API_ENDPOINTS.quality.issues, apiData);
      
      if (!response.success) {
        throw new Error(response.error || '创建质量问题失败');
      }

      return DataTransformer.transformQualityIssue(response.data);
    } catch (error) {
      console.error('创建质量问题错误:', error);
      throw error;
    }
  }

  /**
   * 更新质量问题
   * @param {string} id - 质量问题ID
   * @param {Object} issueData - 质量问题数据
   * @returns {Promise<Object>} - 更新的质量问题
   */
  async updateQualityIssue(id, issueData) {
    try {
      if (!id) {
        throw new Error('质量问题ID不能为空');
      }

      if (!issueData) {
        throw new Error('质量问题数据不能为空');
      }

      // 验证数据
      const validation = this.validateQualityIssueData(issueData);
      if (!validation.valid) {
        throw new Error(`数据验证失败: ${validation.errors.join(', ')}`);
      }

      // 将前端数据转换为API格式
      const apiData = DataTransformer.transformToApiFormat(issueData, 'qualityIssue');

      const response = await apiClient.put(API_ENDPOINTS.quality.issueDetail(id), apiData);
      
      if (!response.success) {
        throw new Error(response.error || '更新质量问题失败');
      }

      return DataTransformer.transformQualityIssue(response.data);
    } catch (error) {
      console.error('更新质量问题错误:', error);
      throw error;
    }
  }

  /**
   * 删除质量问题
   * @param {string} id - 质量问题ID
   * @returns {Promise<boolean>} - 删除结果
   */
  async deleteQualityIssue(id) {
    try {
      if (!id) {
        throw new Error('质量问题ID不能为空');
      }

      const response = await apiClient.delete(API_ENDPOINTS.quality.issueDetail(id));
      
      if (!response.success) {
        throw new Error(response.error || '删除质量问题失败');
      }

      return true;
    } catch (error) {
      console.error('删除质量问题错误:', error);
      throw error;
    }
  }

  /**
   * 获取质量指标
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 质量指标数据
   */
  async getQualityMetrics(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.quality.metrics, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取质量指标失败');
      }

      return response.data;
    } catch (error) {
      console.error('获取质量指标错误:', error);
      throw error;
    }
  }

  /**
   * 获取质量统计信息
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 质量统计信息
   */
  async getQualityStatistics(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.quality.statistics, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取质量统计信息失败');
      }

      return response.data;
    } catch (error) {
      console.error('获取质量统计信息错误:', error);
      throw error;
    }
  }

  /**
   * 获取质量趋势数据
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} - 质量趋势数据
   */
  async getQualityTrends(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.quality.trends, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取质量趋势数据失败');
      }

      return response.data;
    } catch (error) {
      console.error('获取质量趋势数据错误:', error);
      throw error;
    }
  }

  /**
   * 按批次ID获取质量问题
   * @param {string} batchId - 批次ID
   * @returns {Promise<Array>} - 质量问题列表
   */
  async getQualityIssuesByBatchId(batchId) {
    try {
      if (!batchId) {
        throw new Error('批次ID不能为空');
      }

      const params = { related_batch_id: batchId };
      const response = await apiClient.get(API_ENDPOINTS.quality.issues, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取批次质量问题失败');
      }

      return DataTransformer.transformQualityIssueList(response.data);
    } catch (error) {
      console.error('获取批次质量问题错误:', error);
      throw error;
    }
  }

  /**
   * 按物料代码获取质量问题
   * @param {string} materialCode - 物料代码
   * @returns {Promise<Array>} - 质量问题列表
   */
  async getQualityIssuesByMaterialCode(materialCode) {
    try {
      if (!materialCode) {
        throw new Error('物料代码不能为空');
      }

      const params = { material_code: materialCode };
      const response = await apiClient.get(API_ENDPOINTS.quality.issues, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取物料质量问题失败');
      }

      return DataTransformer.transformQualityIssueList(response.data);
    } catch (error) {
      console.error('获取物料质量问题错误:', error);
      throw error;
    }
  }

  /**
   * 验证质量问题数据有效性
   * @param {Object} issueData - 质量问题数据
   * @returns {Object} - 验证结果，{valid: boolean, errors: Array}
   */
  validateQualityIssueData(issueData) {
    if (!issueData) {
      return { valid: false, errors: ['质量问题数据不能为空'] };
    }

    const errors = [];

    // 标题验证
    if (!issueData.title) {
      errors.push('质量问题标题不能为空');
    }

    // 类型验证
    if (!issueData.type) {
      errors.push('质量问题类型不能为空');
    }

    // 描述验证
    if (!issueData.description) {
      errors.push('质量问题描述不能为空');
    }

    // 其他验证...

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 创建质量服务实例并导出
const qualityService = new QualityService();
export default qualityService; 