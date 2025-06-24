/**
 * 批次管理服务
 * 处理批次相关的数据操作
 */

import apiClient from '../api/ApiClient.js';
import { API_ENDPOINTS } from '../api/endpoints.js';
import { DataTransformer } from '../api/DataTransformer.js';

class BatchService {
  /**
   * 获取批次列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} - 批次列表
   */
  async getBatches(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.batches.list, params);
      
      if (!response.success) {
        throw new Error(response.error || '获取批次列表失败');
      }

      return DataTransformer.transformBatchList(response.data);
    } catch (error) {
      console.error('获取批次列表错误:', error);
      throw error;
    }
  }

  /**
   * 获取批次详情
   * @param {string} id - 批次ID
   * @returns {Promise<Object>} - 批次详情
   */
  async getBatchById(id) {
    try {
      if (!id) {
        throw new Error('批次ID不能为空');
      }

      const response = await apiClient.get(API_ENDPOINTS.batches.detail(id));
      
      if (!response.success) {
        throw new Error(response.error || '获取批次详情失败');
      }

      return DataTransformer.transformBatch(response.data);
    } catch (error) {
      console.error('获取批次详情错误:', error);
      throw error;
    }
  }

  /**
   * 创建批次
   * @param {Object} batchData - 批次数据
   * @returns {Promise<Object>} - 创建的批次
   */
  async createBatch(batchData) {
    try {
      if (!batchData) {
        throw new Error('批次数据不能为空');
      }

      // 将前端数据转换为API格式
      const apiData = DataTransformer.transformToApiFormat(batchData, 'batch');

      const response = await apiClient.post(API_ENDPOINTS.batches.create, apiData);
      
      if (!response.success) {
        throw new Error(response.error || '创建批次失败');
      }

      return DataTransformer.transformBatch(response.data);
    } catch (error) {
      console.error('创建批次错误:', error);
      throw error;
    }
  }

  /**
   * 更新批次
   * @param {string} id - 批次ID
   * @param {Object} batchData - 批次数据
   * @returns {Promise<Object>} - 更新的批次
   */
  async updateBatch(id, batchData) {
    try {
      if (!id) {
        throw new Error('批次ID不能为空');
      }

      if (!batchData) {
        throw new Error('批次数据不能为空');
      }

      // 将前端数据转换为API格式
      const apiData = DataTransformer.transformToApiFormat(batchData, 'batch');

      const response = await apiClient.put(API_ENDPOINTS.batches.update(id), apiData);
      
      if (!response.success) {
        throw new Error(response.error || '更新批次失败');
      }

      return DataTransformer.transformBatch(response.data);
    } catch (error) {
      console.error('更新批次错误:', error);
      throw error;
    }
  }

  /**
   * 删除批次
   * @param {string} id - 批次ID
   * @returns {Promise<boolean>} - 删除结果
   */
  async deleteBatch(id) {
    try {
      if (!id) {
        throw new Error('批次ID不能为空');
      }

      const response = await apiClient.delete(API_ENDPOINTS.batches.delete(id));
      
      if (!response.success) {
        throw new Error(response.error || '删除批次失败');
      }

      return true;
    } catch (error) {
      console.error('删除批次错误:', error);
      throw error;
    }
  }

  /**
   * 获取批次活动记录
   * @param {string} id - 批次ID
   * @returns {Promise<Array>} - 批次活动记录
   */
  async getBatchActivities(id) {
    try {
      if (!id) {
        throw new Error('批次ID不能为空');
      }

      const response = await apiClient.get(API_ENDPOINTS.batches.activities(id));
      
      if (!response.success) {
        throw new Error(response.error || '获取批次活动记录失败');
      }

      return response.data;
    } catch (error) {
      console.error('获取批次活动记录错误:', error);
      throw error;
    }
  }

  /**
   * 批量获取批次列表
   * @param {Array} ids - 批次ID列表
   * @returns {Promise<Array>} - 批次列表
   */
  async getBatchesByIds(ids) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return [];
      }

      // 构建批量查询参数
      const params = { ids: ids.join(',') };
      const response = await apiClient.get(API_ENDPOINTS.batches.list, params);
      
      if (!response.success) {
        throw new Error(response.error || '批量获取批次失败');
      }

      return DataTransformer.transformBatchList(response.data);
    } catch (error) {
      console.error('批量获取批次错误:', error);
      throw error;
    }
  }

  /**
   * 获取批次统计信息
   * @returns {Promise<Object>} - 批次统计信息
   */
  async getBatchStatistics() {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.batches.list}/statistics`);
      
      if (!response.success) {
        throw new Error(response.error || '获取批次统计信息失败');
      }

      return response.data;
    } catch (error) {
      console.error('获取批次统计信息错误:', error);
      throw error;
    }
  }

  /**
   * 验证批次数据有效性
   * @param {Object} batchData - 批次数据
   * @returns {Object} - 验证结果，{valid: boolean, errors: Array}
   */
  validateBatchData(batchData) {
    if (!batchData) {
      return { valid: false, errors: ['批次数据不能为空'] };
    }

    const errors = [];

    // 批次号验证
    if (!batchData.batchNo) {
      errors.push('批次号不能为空');
    }

    // 物料验证
    if (!batchData.materialCode) {
      errors.push('物料代码不能为空');
    }

    // 数量验证
    if (batchData.quantity === undefined || batchData.quantity <= 0) {
      errors.push('批次数量必须大于0');
    }

    // 其他验证...

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 创建批次服务实例并导出
const batchService = new BatchService();
export default batchService;
