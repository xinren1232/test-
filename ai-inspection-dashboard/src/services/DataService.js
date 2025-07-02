/**
 * 数据服务 - 提供统一的数据获取接口
 * 集成查询优化器和智能缓存，提升查询性能
 */

import { DataQueryResult } from '../data/models.js';
import mockData from '../data/mockData';
import { ElMessage } from 'element-plus';
import { queryOptimizer } from './QueryOptimizer.js';
import { queryCacheService } from './QueryCacheService.js';

class DataService {
  /**
   * 查询物料列表 - 优化版
   * @param {Object} params 查询参数
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getMaterials(params = {}) {
    try {
      const result = await queryOptimizer.optimizedQuery(
        'materials',
        params,
        async () => {
          // 模拟网络延迟
          await this.delay(300);
          const data = mockData.queryMaterials(params);
          return data;
        },
        {
          cacheType: 'inventory',
          cacheTTL: 2 * 60 * 1000 // 2分钟缓存
        }
      );

      return DataQueryResult.success(result, '查询物料列表成功');
    } catch (error) {
      console.error('查询物料失败:', error);
      return DataQueryResult.error('查询物料列表失败');
    }
  }

  /**
   * 获取物料详情 - 优化版
   * @param {string} materialCode 物料编码
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getMaterialDetail(materialCode) {
    try {
      const result = await queryOptimizer.optimizedQuery(
        'material_detail',
        { materialCode },
        async () => {
          await this.delay(200);
          const material = mockData.queryMaterials({ code: materialCode })[0];

          if (!material) {
            throw new Error(`未找到编码为 ${materialCode} 的物料`);
          }

          // 并行获取关联数据
          const [inspections, labTests, exceptions] = await Promise.all([
            Promise.resolve(mockData.queryInspectionResults({ materialCode })),
            Promise.resolve(mockData.queryLabTests({ materialCode })),
            Promise.resolve(mockData.queryQualityExceptions({ materialCode }))
          ]);

          return {
            material,
            inspections,
            labTests,
            exceptions
          };
        },
        {
          cacheType: 'quality',
          cacheTTL: 5 * 60 * 1000 // 5分钟缓存
        }
      );

      return DataQueryResult.success(result, '查询物料详情成功');
    } catch (error) {
      console.error('查询物料详情失败:', error);
      return DataQueryResult.error(error.message || '查询物料详情失败');
    }
  }

  /**
   * 查询质量检验结果
   * @param {Object} params 查询参数
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getInspectionResults(params = {}) {
    try {
      await this.delay(300);
      const data = mockData.queryInspectionResults(params);
      return DataQueryResult.success(data, '查询质检结果成功');
    } catch (error) {
      console.error('查询质检结果失败:', error);
      return DataQueryResult.error('查询质检结果失败');
    }
  }

  /**
   * 查询实验室测试结果
   * @param {Object} params 查询参数
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getLabTests(params = {}) {
    try {
      await this.delay(250);
      const data = mockData.queryLabTests(params);
      return DataQueryResult.success(data, '查询实验室测试结果成功');
    } catch (error) {
      console.error('查询实验室测试结果失败:', error);
      return DataQueryResult.error('查询实验室测试结果失败');
    }
  }

  /**
   * 查询质量异常记录
   * @param {Object} params 查询参数
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getQualityExceptions(params = {}) {
    try {
      await this.delay(200);
      const data = mockData.queryQualityExceptions(params);
      return DataQueryResult.success(data, '查询质量异常记录成功');
    } catch (error) {
      console.error('查询质量异常记录失败:', error);
      return DataQueryResult.error('查询质量异常记录失败');
    }
  }

  /**
   * 获取质量统计数据
   * @param {string} period 统计周期 (daily|weekly|monthly)
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getQualityStatistics(period = 'daily') {
    try {
      await this.delay(400);
      const data = mockData.qualityStatistics[period];
      
      if (!data) {
        return DataQueryResult.error(`未找到${period}的统计数据`);
      }
      
      return DataQueryResult.success(data, '查询统计数据成功');
    } catch (error) {
      console.error('查询统计数据失败:', error);
      return DataQueryResult.error('查询统计数据失败');
    }
  }

  /**
   * 获取不合格物料
   * @returns {Promise<DataQueryResult>} 查询结果
   */
  async getUnqualifiedMaterials() {
    try {
      await this.delay(350);
      
      // 查询不合格的检验结果
      const unqualifiedResults = mockData.queryInspectionResults({ result: '不合格' });
      
      // 提取对应的物料编码
      const materialCodes = unqualifiedResults.map(item => item.materialCode);
      
      // 获取物料信息
      const unqualifiedMaterials = [];
      for (const code of materialCodes) {
        const materials = mockData.queryMaterials({ code });
        if (materials.length > 0) {
          unqualifiedMaterials.push({
            ...materials[0],
            inspectionResult: unqualifiedResults.find(r => r.materialCode === code)
          });
        }
      }
      
      return DataQueryResult.success(unqualifiedMaterials, '查询不合格物料成功');
    } catch (error) {
      console.error('查询不合格物料失败:', error);
      return DataQueryResult.error('查询不合格物料失败');
    }
  }

  /**
   * 辅助方法：模拟延迟
   * @param {number} ms 延迟毫秒数
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 创建单例实例
export const dataService = new DataService();

// 默认导出
export default dataService; 